INSERT INTO contacts (id, user_id, type, value)
SELECT uuid_generate_v4(), u.id, 'PHONE', '+5511999999999'
FROM users u
WHERE u.email = 'john@example.com'
ON CONFLICT (user_id, type, value) DO NOTHING;

INSERT INTO contacts (id, user_id, type, value)
SELECT uuid_generate_v4(), u.id, 'EMAIL', 'maria@example.com'
FROM users u
WHERE u.email = 'maria@example.com'
ON CONFLICT (user_id, type, value) DO NOTHING;

INSERT INTO contacts (id, user_id, type, value)
SELECT uuid_generate_v4(), u.id, 'EMAIL', 'company@example.com'
FROM users u
WHERE u.email = 'company@example.com'
ON CONFLICT (user_id, type, value) DO NOTHING;
