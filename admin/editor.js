const config=window.BIRTHDAY_CONFIG;
const field=document.getElementById('document'),status=document.getElementById('status');
let revision=null,undos=[],redos=[];
field.value=JSON.stringify({schemaVersion:1,general:{name:'',nickname:'',birthdayISO:'',music:{},appearance:{}},pages:[],menus:[]},null,2);
let previous=field.value;
function snapshot(){undos.push(previous); if(undos.length>50)undos.shift();redos=[];previous=field.value;}
field.addEventListener('change',snapshot);
async function request(action,data){
 if(!config?.supabaseUrl||config.supabaseUrl.includes('YOUR_'))throw Error('Configure your new Supabase project.');
 const r=await fetch(config.supabaseUrl+'/functions/v1/birthday-site-admin',{method:'POST',headers:{'Content-Type':'application/json','x-admin-key':document.getElementById('key').value},body:JSON.stringify({action,...data})});
 const j=await r.json();if(!r.ok)throw Error(j.code==='STALE_STATE'?'Newer changes exist. Copy your draft before reloading.':j.error);return j;
}
function run(fn){return async()=>{try{await fn()}catch(e){status.textContent=e.message}}}
document.getElementById('load').onclick=run(async()=>{
 await request('ping');
 const r=await fetch(config.supabaseUrl+'/rest/v1/site_state?id=eq.live&select=data,revision',{headers:{apikey:config.publishableKey},cache:'no-store'});
 if(!r.ok)throw Error('Could not load state');const rows=await r.json();if(!rows[0])throw Error('Initialize the new database first.');
 field.value=JSON.stringify(rows[0].data,null,2);previous=field.value;undos=[];redos=[];revision=rows[0].revision;status.textContent='Loaded revision '+revision;
});
document.getElementById('add').onclick=run(async()=>{const data=JSON.parse(field.value);data.pages.push({id:crypto.randomUUID(),type:'page',title:'New page',enabled:true,settings:{},children:[]});field.value=JSON.stringify(data,null,2);snapshot();status.textContent='Draft page added.'});
document.getElementById('undo').onclick=()=>{if(undos.length){redos.push(field.value);field.value=undos.pop();previous=field.value}};
document.getElementById('redo').onclick=()=>{if(redos.length){undos.push(field.value);field.value=redos.pop();previous=field.value}};
document.getElementById('publish').onclick=run(async()=>{if(!revision)throw Error('Load live state before publishing.');const j=await request('publish',{data:JSON.parse(field.value),expectedRevision:revision});revision=j.revision;status.textContent='Published revision '+revision});
