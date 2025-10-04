// Script to create missing profiles for existing users with minimal schema
require("dotenv").config({ path: ".env.local" });
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

async function createMissingProfiles() {
  try {
    console.log("Fetching all users...");

    // Get all users
    const { data: users, error: usersError } =
      await supabase.auth.admin.listUsers();

    if (usersError) {
      console.error("Error fetching users:", usersError);
      return;
    }

    console.log(`Found ${users.users.length} users`);

    // For each user, check if a profile exists and create one if not
    for (const user of users.users) {
      console.log(`\nChecking profile for user: ${user.email} (${user.id})`);

      // Check if profile exists
      const { data: existingProfile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (profileError && profileError.code === "PGRST116") {
        // No profile found, create one with minimal schema
        console.log("  No profile found, creating one with minimal schema...");

        // Extract name from user metadata if available
        const fullName =
          user.user_metadata?.full_name || user.email.split("@")[0];

        // Create profile with only the columns that exist
        const { data: newProfile, error: createError } = await supabase
          .from("profiles")
          .insert({
            user_id: user.id,
            role: "patient",
            onboarding_completed: false,
          })
          .select()
          .single();

        if (createError) {
          console.error("  Error creating profile:", createError);
        } else {
          console.log("  Profile created successfully:", newProfile);
        }
      } else if (existingProfile) {
        console.log("  Profile already exists:", existingProfile.user_id);
      } else {
        console.log("  Error checking profile:", profileError);
      }
    }

    console.log("\nProfile creation process completed.");
  } catch (error) {
    console.error("Unexpected error:", error);
  }
}

createMissingProfiles();
