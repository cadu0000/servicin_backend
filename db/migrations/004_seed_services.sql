INSERT INTO services (id, name, description, category_id)
SELECT uuid_generate_v4(), 'Pipe Fixing', 'Fix leaking or broken pipes', c.id
FROM categories c
WHERE c.name = 'Plumbing'
ON CONFLICT (name) DO NOTHING;

INSERT INTO services (id, name, description, category_id)
SELECT uuid_generate_v4(), 'Wiring Installation', 'Electrical wiring for buildings', c.id
FROM categories c
WHERE c.name = 'Electrical'
ON CONFLICT (name) DO NOTHING;

INSERT INTO services (id, name, description, category_id)
SELECT uuid_generate_v4(), 'Home Cleaning', 'Complete home cleaning service', c.id
FROM categories c
WHERE c.name = 'Cleaning'
ON CONFLICT (name) DO NOTHING;
