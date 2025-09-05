# Safe Step Supabase Backend

This backend exposes a production-ready schema with strict Row Level Security (RLS) and Next.js App Router endpoints.

## Auth & Roles
- profiles.id = auth.uid()
- roles: patient (default), doctor, admin
- Helper functions: is_admin(uid), is_doctor(uid) for RLS elevation.

## Tables
- profiles (id, email, full_name, role, created_at)
- onboarding (patient intake fields)
- sessions (capture sessions)
- session_samples (pressure samples for a session)
- reports (predictions & recommendations)
- assessments (daily foot check)
- chat_messages (stored chat history)
- devices (ESP32 pairing)

All tables have RLS enabled. Patients can access their own data; admins (and doctors where noted) can read across users.

## API Routes
- GET/POST /api/onboarding
- GET/POST /api/sessions
- GET/PATCH /api/sessions/:id
- GET/POST /api/sessions/:id/samples
- GET /api/reports
- POST /api/reports/submit
- POST /api/predict (optional proxy to ML_URL), also stores as report
- GET/POST /api/assessments
- GET/POST /api/chat
- GET /api/admin/analytics (admin only)

All endpoints require a signed-in user except admin analytics which also checks admin role.

## Environment
- SUPABASE_URL (server)
- SUPABASE_SERVICE_ROLE_KEY (server) or SUPABASE_ANON_KEY (server fallback)
- NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY (client)
- ML_URL (optional external model endpoint: POST /predict)

## Migrations
- scripts/002-safe-step-schema.sql
- scripts/003-safe-step-admin-rpc.sql

Run migrations in order. They are idempotent.

## Frontend Integration
- Use the endpoints above with credentials included (cookies-based Supabase session).
- Live Heatmap: push readings to POST /api/sessions/:id/samples (pressure as 2D/1D arrays).
- Reports screen: GET /api/reports
- Assessment: POST /api/assessments
- Chat: POST /api/chat, GET /api/chat
