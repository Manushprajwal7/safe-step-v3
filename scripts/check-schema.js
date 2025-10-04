// Script to check the database schema
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

async function checkSchema() {
  try {
    console.log(
      "Checking profiles table structure by testing column access..."
    );

    // Test accessing different columns
    const columnsToTest = [
      "user_id",
      "role",
      "onboarding_completed",
      "full_name",
      "age",
      "weight_kg",
      "height_cm",
      "gender",
      "profession",
      "diabetes_type",
      "activity_level",
    ];

    for (const column of columnsToTest) {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select(column)
          .limit(1);

        if (error) {
          console.log(`  ✗ ${column}:`, error.message);
        } else {
          console.log(`  ✓ ${column}: Accessible`);
        }
      } catch (e) {
        console.log(`  ✗ ${column}:`, e.message);
      }
    }

    // Try to get a simple count
    console.log("\nGetting row count...");
    const { count, error: countError } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    if (countError) {
      console.error("Error getting count:", countError);
    } else {
      console.log(`Profiles table has ${count} rows`);
    }
  } catch (error) {
    console.error("Unexpected error:", error);
  }
}

checkSchema();
