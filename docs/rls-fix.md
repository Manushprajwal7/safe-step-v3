# Fix for RLS Recursion Error

## Problem

The error "infinite recursion detected in policy for relation 'profiles'" occurs when Row Level Security (RLS) policies create circular dependencies. This happens when:

1. A policy function queries the same table that has policies referencing that function
2. Multiple policies reference each other in a circular manner

Other related errors like "column 'patient_id' does not exist" occur when policies reference columns that don't match the actual database schema.

## Root Cause

In the Safe Step application, the issue was caused by:

1. Functions `is_admin()` and `is_doctor()` were querying the `profiles` table
2. The `profiles` table had RLS policies that referenced these functions
3. This created a circular dependency: policies → functions → profiles table → policies
4. Some policies referenced incorrect column names based on the actual database schema

## Actual Database Schema

Based on diagnostic output, the actual database schema is:

- `profiles` table uses `user_id` as the primary key
- `sessions` table uses `user_id` as the foreign key (NOT `patient_id`)
- Other tables may use either `user_id` or `patient_id` as foreign keys

## Solution

The fix involves several key changes:

### 1. Use Security Definer Functions

By adding `security definer` to the function definitions, they bypass RLS when executing, preventing the recursion:

```sql
create or replace function public.is_admin()
returns boolean language sql stable as $$
  select exists(
    select 1 from public.profiles
    where user_id = auth.uid() and role = 'admin'
  )
$$ security definer;  -- This bypasses RLS and prevents recursion
```

### 2. Simplify Function Signatures

Use functions without parameters to avoid complex queries:

```sql
-- Instead of:
create function is_admin(uid uuid) -- complex parameterized version

-- Use:
create function is_admin() -- simple version that uses auth.uid() directly
```

### 3. Dynamic Column Detection

Use conditional logic to detect what columns actually exist in the database:

```sql
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'assessments' AND column_name = 'patient_id') THEN
    -- Use patient_id column
  ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'assessments' AND column_name = 'user_id') THEN
    -- Use user_id column
  END IF;
END $$;
```

### 4. Correct Table and Column References

Ensure all policies reference the correct column names based on what actually exists in the database:

- In `profiles` table: `user_id`
- In `sessions` table: `user_id` (based on diagnostic output)
- In other tables: Check what column name is actually used (`patient_id`, `user_id`, etc.)

## Implementation Steps

1. Run the final fix script `scripts/final-rls-fix.sql` to apply the complete fix
2. Test the fix with `scripts/test-rls-fix.sql` to verify it works
3. This will:
   - Drop all problematic functions and policies completely
   - Create new functions with `security definer` to prevent recursion
   - Implement updated policies with correct column references based on what actually exists
   - Remove circular dependencies completely
   - Avoid errors for missing tables or incorrect column references

## Prevention

To prevent similar issues in the future:

1. Always use `security definer` for functions used in RLS policies
2. Keep function signatures simple (avoid complex parameterized functions when used in policies)
3. Verify that tables and columns exist before referencing them in policies
4. Use conditional logic to check table and column existence before modifying policies
5. Always check the actual database schema rather than assuming column names
6. Avoid complex nested queries in RLS policies
7. Test RLS policies thoroughly after any changes

## Diagnostic Queries

To check your current database state, run the diagnostic scripts:

1. `scripts/simple-diagnostic.sql` - Check what tables and columns exist
2. `scripts/diagnostic-check.sql` - More comprehensive diagnostic information

This information will help you understand why certain policies might be failing and what column names to use.
