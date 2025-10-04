# Database Setup Scripts

This directory contains SQL scripts to set up the database schema and policies for the application.

## Authentication Schema Setup

The [auth-schema.sql](auth-schema.sql) file contains all the necessary tables, relationships, and Row Level Security (RLS) policies for the authentication system.

### Tables Created

1. **profiles** - Stores user metadata including roles and onboarding status
2. **sessions** - Tracks user sessions with device and IP information
3. **assessments** - Stores user assessments with status and scores
4. **reports** - Contains generated reports linked to assessments
5. **chat_messages** - Stores chat conversation history

### How to Apply the Schema

1. Log into your Supabase dashboard
2. Navigate to the SQL editor
3. Copy and paste the contents of [auth-schema.sql](auth-schema.sql)
4. Run the script

### Key Features

- Automatic profile creation when a new user signs up
- Row Level Security policies to ensure users can only access their own data
- Admin access to all user data
- Proper foreign key relationships with the auth.users table
- Automatic timestamp updates
- Performance indexes on foreign key columns

### Security

- All tables have RLS enabled
- Users can only read/write their own data
- Admins have broader access to all user data
- Proper authentication checks using `auth.uid()`
