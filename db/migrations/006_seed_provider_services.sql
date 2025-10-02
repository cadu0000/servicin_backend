INSERT INTO provider_services (provider_id, service_id)
SELECT sp.user_id, s.id
FROM service_providers sp
JOIN services s ON s.name IN ('Pipe Fixing', 'Wiring Installation')
WHERE sp.user_id = (SELECT id FROM users WHERE email = 'provider@example.com')
ON CONFLICT (provider_id, service_id) DO NOTHING;
