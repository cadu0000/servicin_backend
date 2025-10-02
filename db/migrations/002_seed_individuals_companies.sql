INSERT INTO individuals (user_id, full_name, cpf, birth_date)
SELECT id, 'John Doe', '12345678901', '1995-06-15'
FROM users
WHERE email = 'john@example.com'
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO individuals (user_id, full_name, cpf, birth_date)
SELECT id, 'Maria Silva', '98765432100', '1990-03-22'
FROM users
WHERE email = 'maria@example.com'
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO companies (user_id, corporate_name, cnpj, trade_name)
SELECT id, 'Tech Solutions LTDA', '12345678000199', 'TechSol'
FROM users
WHERE email = 'company@example.com'
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO service_providers (user_id, service_description, average_rating)
SELECT id, 'General handyman services', 4.5
FROM users
WHERE email = 'provider@example.com'
ON CONFLICT (user_id) DO NOTHING;
