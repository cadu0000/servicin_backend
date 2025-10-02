INSERT INTO service_photos (id, service_id, photo_url)
SELECT uuid_generate_v4(), s.id, 'https://picsum.photos/200?11'
FROM services s
WHERE s.name = 'Pipe Fixing'
ON CONFLICT (service_id, photo_url) DO NOTHING;

INSERT INTO service_photos (id, service_id, photo_url)
SELECT uuid_generate_v4(), s.id, 'https://picsum.photos/200?12'
FROM services s
WHERE s.name = 'Wiring Installation'
ON CONFLICT (service_id, photo_url) DO NOTHING;

INSERT INTO service_photos (id, service_id, photo_url)
SELECT uuid_generate_v4(), s.id, 'https://picsum.photos/200?13'
FROM services s
WHERE s.name = 'Home Cleaning'
ON CONFLICT (service_id, photo_url) DO NOTHING;
