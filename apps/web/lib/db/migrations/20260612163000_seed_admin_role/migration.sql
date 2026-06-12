-- Data migration: grant the admin role to the site owner.
-- Idempotent and a no-op on databases where the user does not exist yet
-- (a fresh database gets the role via db:seed instead).
UPDATE "user" SET role = 'admin' WHERE email = 'rene@weteling.com';
