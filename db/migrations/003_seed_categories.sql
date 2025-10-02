INSERT INTO categories (id, name, description)
VALUES
    (uuid_generate_v4(), 'Plumbing', 'All plumbing related services'),
    (uuid_generate_v4(), 'Electrical', 'Electrical installation and repair'),
    (uuid_generate_v4(), 'Cleaning', 'House and office cleaning services')
ON CONFLICT (name) DO NOTHING;
