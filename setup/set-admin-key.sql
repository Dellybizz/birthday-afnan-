-- Replace the placeholder privately in the SQL editor; never commit your key.
insert into public.site_admin_security(id,key_hash)
values ('primary', 'bcrypt-sha256$' || extensions.crypt(encode(extensions.digest('REPLACE_WITH_YOUR_PRIVATE_KEY','sha256'),'hex'),extensions.gen_salt('bf',12)))
on conflict(id) do update set key_hash=excluded.key_hash,updated_at=now();
