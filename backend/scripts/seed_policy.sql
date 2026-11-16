-- Seed para la política de comisiones inicial
INSERT INTO market_commission_policy(name, valid_from, pbase_azucar, k_factor, justification, created_by)
VALUES ('default', NOW(), 1.0, 1.0, 'Política inicial por defecto', 'system_seed');
