-- Seed test data for development and testing
-- Run this script after migrations to populate the database with sample data

-- Create a test user
INSERT INTO users (id, email, created_at)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440000', 'testuser@example.com', NOW()),
  ('550e8400-e29b-41d4-a716-446655440001', 'premiumuser@example.com', NOW())
ON CONFLICT (id) DO NOTHING;

-- Create bundles for premium user
INSERT INTO bundles (id, user_id, tier, quota, remaining_quota, created_at, expires_at)
VALUES 
  (
    '660e8400-e29b-41d4-a716-446655440000',
    '550e8400-e29b-41d4-a716-446655440001',
    'pro',
    100,
    100,
    NOW(),
    NULL
  ),
  (
    '660e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440001',
    'basic',
    10,
    5,
    NOW(),
    NULL
  )
ON CONFLICT (id) DO NOTHING;

-- Create usage tracking for current month (to test free quota)
INSERT INTO usage_tracking (user_id, month, year, free_messages_used, last_reset_at)
VALUES 
  (
    '550e8400-e29b-41d4-a716-446655440000',
    EXTRACT(MONTH FROM NOW())::INTEGER,
    EXTRACT(YEAR FROM NOW())::INTEGER,
    0,
    NOW()
  ),
  (
    '550e8400-e29b-41d4-a716-446655440001',
    EXTRACT(MONTH FROM NOW())::INTEGER,
    EXTRACT(YEAR FROM NOW())::INTEGER,
    0,
    NOW()
  )
ON CONFLICT (user_id, month, year) DO NOTHING;

-- Display created data
SELECT 'Users created:' as info;
SELECT id, email FROM users WHERE email IN ('testuser@example.com', 'premiumuser@example.com');

SELECT 'Bundles created:' as info;
SELECT id, user_id, tier, remaining_quota FROM bundles WHERE user_id = '550e8400-e29b-41d4-a716-446655440001';

