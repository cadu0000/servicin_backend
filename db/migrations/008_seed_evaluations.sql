INSERT INTO evaluations (id, provider_id, client_id, rating, comment, created_at)
SELECT uuid_generate_v4(), sp.user_id, u.id, 5, 'Excellent service!', now()
FROM service_providers sp
JOIN users u ON u.user_type = 'INDIVIDUAL' AND u.email IN ('john@example.com', 'maria@example.com')
WHERE sp.user_id = (SELECT id FROM users WHERE email = 'provider@example.com')
ON CONFLICT DO NOTHING;
