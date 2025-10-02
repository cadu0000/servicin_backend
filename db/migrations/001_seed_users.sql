INSERT INTO users (id, email, password, user_type, photo_url)
VALUES
    (uuid_generate_v4(), 'john@example.com', 'hashed_password1', 'INDIVIDUAL', 'https://picsum.photos/200?1'),
    (uuid_generate_v4(), 'maria@example.com', 'hashed_password2', 'INDIVIDUAL', 'https://picsum.photos/200?2'),
    (uuid_generate_v4(), 'company@example.com', 'hashed_password3', 'COMPANY', 'https://picsum.photos/200?3'),
    (uuid_generate_v4(), 'provider@example.com', 'hashed_password4', 'INDIVIDUAL', 'https://picsum.photos/200?4')
ON CONFLICT (email) DO NOTHING;
