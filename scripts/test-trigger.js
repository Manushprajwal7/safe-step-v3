// Script to test if the profile creation trigger is working
const { createClient } = require("@supabase/supabase-js");

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing environment variables:");
  console.error("NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl ? "SET" : "NOT SET");
  console.error("SUPABASE_SERVICE_ROLE_KEY:", supabaseKey ? "SET" : "NOT SET");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testTrigger() {
  try {
    console.log("Testing profile creation trigger...");

    // Create a test user
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = "testpassword123";

    console.log(`Creating test user: ${testEmail}`);

    const { data: userData, error: signUpError } =
      await supabase.auth.admin.createUser({
        email: testEmail,
        password: testPassword,
        email_confirm: true,
        user_metadata: { full_name: "Test User" },
      });

    if (signUpError) {
      console.error("Error creating test user:", signUpError);
      return;
    }

    console.log("Test user created:", userData.user.id);

    // Wait a moment for the trigger to execute
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Check if profile was created
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userData.user.id)
      .single();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
    } else if (profile) {
      console.log("Profile created successfully by trigger:", profile);
    } else {
      console.log("No profile found for the test user");
    }

    // Clean up - delete test user
    const { error: deleteError } = await supabase.auth.admin.deleteUser(
      userData.user.id
    );
    if (deleteError) {
      console.error("Error deleting test user:", deleteError);
    } else {
      console.log("Test user deleted successfully");
    }
  } catch (error) {
    console.error("Unexpected error:", error);
  }
}

testTrigger();
