-- 1. Function to handle new user registration
-- This function will automatically create a profile in public.user_profiles
-- when a new user signs up in auth.users.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, company_name, plan)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'company_name', 'Meine Agentur'),
    COALESCE(NEW.raw_user_meta_data->>'plan', 'starter')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Trigger to execute the function after a user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. (Optional) Manual seeding of a test website for user verification
-- REPLACE 'YOUR_USER_ID_HERE' with an actual UUID from your auth.users table
-- INSERT INTO public.websites (url, domain, client_name, owner_id)
-- VALUES ('https://www.google.de', 'google.de', 'Test Client', 'YOUR_USER_ID_HERE');
