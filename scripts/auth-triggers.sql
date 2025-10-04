-- Additional Authentication Triggers
-- This script sets up additional triggers for the authentication system

-- Function to handle user deletion cleanup
CREATE OR REPLACE FUNCTION public.handle_user_deletion()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete all user data when user is deleted from auth.users
  DELETE FROM public.profiles WHERE user_id = OLD.id;
  DELETE FROM public.sessions WHERE user_id = OLD.id;
  DELETE FROM public.assessments WHERE user_id = OLD.id;
  DELETE FROM public.reports WHERE user_id = OLD.id;
  DELETE FROM public.chat_messages WHERE user_id = OLD.id;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to clean up user data when user is deleted
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
CREATE TRIGGER on_auth_user_deleted
  AFTER DELETE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_deletion();

-- Function to update the last_sign_in timestamp in profiles
CREATE OR REPLACE FUNCTION public.handle_user_sign_in()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the updated_at timestamp when user signs in
  UPDATE public.profiles 
  SET updated_at = NOW()
  WHERE user_id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update profile when user signs in
-- Note: This would need to be triggered from your application when a user signs in
-- since Supabase doesn't have a built-in auth sign in event