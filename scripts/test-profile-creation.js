// Test script to check if profiles are being created correctly
const { createClient } = require("@supabase/supabase-js");

// Use your actual Supabase credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role key for full access

if (!supabaseUrl || !supabaseKey) {
  console.error(
    "Missing Supabase credentials. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables."
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testProfileCreation() {
  try {
    console.log("Testing profile creation...");

    // List all users
    const { data: users, error: usersError } =
      await supabase.auth.admin.listUsers();
    if (usersError) {
      console.error("Error listing users:", usersError);
      return;
    }

    console.log(`Found ${users.users.length} users`);

    // For each user, check if a profile exists
    for (const user of users.users) {
      console.log(`\nChecking profile for user: ${user.email} (${user.id})`);

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (profileError) {
        console.log(`  Profile error: ${profileError.message}`);
      } else if (profile) {
        console.log(`  Profile found:`, profile);
      } else {
        console.log(`  No profile found for this user`);
      }
    }
  } catch (error) {
    console.error("Unexpected error:", error);
  }
}

testProfileCreation();
