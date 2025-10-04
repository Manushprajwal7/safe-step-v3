// Script to update the profiles table schema
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

async function updateProfilesSchema() {
  try {
    console.log("Updating profiles table schema...");

    // Add missing columns to profiles table
    const columnsToAdd = [
      { name: "full_name", type: "TEXT" },
      { name: "age", type: "INTEGER" },
      { name: "weight_kg", type: "NUMERIC(5,2)" },
      { name: "height_cm", type: "NUMERIC(5,2)" },
      { name: "gender", type: "TEXT" },
      { name: "profession", type: "TEXT" },
      { name: "diabetes_type", type: "TEXT" },
      { name: "activity_level", type: "TEXT" },
      { name: "diagnosis_date", type: "DATE" },
      { name: "footwear_type", type: "TEXT" },
      { name: "prior_injuries", type: "TEXT" },
      { name: "blood_sugar_mgdl", type: "NUMERIC(5,2)" },
      { name: "foot_symptoms", type: "TEXT[]" },
      { name: "pre_existing_conditions", type: "TEXT[]" },
      {
        name: "created_at",
        type: "TIMESTAMP WITH TIME ZONE",
        default: "NOW()",
      },
      {
        name: "updated_at",
        type: "TIMESTAMP WITH TIME ZONE",
        default: "NOW()",
      },
    ];

    // We can't directly execute ALTER TABLE statements through the Supabase client
    // Instead, let's try to insert a record with all fields to see which ones work
    console.log(
      "\nTesting which columns are available by attempting to insert a record..."
    );

    const testRecord = {
      user_id: "test-user-id-for-schema-check",
      role: "patient",
      onboarding_completed: false,
    };

    // Add all potential columns to the test record
    const allColumns = {
      ...testRecord,
      full_name: "Test User",
      age: 30,
      weight_kg: 70.5,
      height_cm: 175.3,
      gender: "male",
      profession: "engineer",
      diabetes_type: "type2",
      activity_level: "moderate",
    };

    const { data, error } = await supabase
      .from("profiles")
      .insert(allColumns)
      .select();

    if (error) {
      console.log("Error inserting full record:", error.message);

      // Try inserting just the basic record
      const { data: basicData, error: basicError } = await supabase
        .from("profiles")
        .insert(testRecord)
        .select();

      if (basicError) {
        console.log("Error inserting basic record:", basicError.message);
      } else {
        console.log("Basic record inserted successfully");

        // Clean up
        await supabase
          .from("profiles")
          .delete()
          .eq("user_id", "test-user-id-for-schema-check");
      }
    } else {
      console.log("Full record inserted successfully");

      // Clean up
      await supabase
        .from("profiles")
        .delete()
        .eq("user_id", "test-user-id-for-schema-check");
    }

    console.log(
      "\nTo properly update your schema, you need to run the auth-schema.sql script in your Supabase dashboard."
    );
    console.log("1. Go to your Supabase project dashboard");
    console.log("2. Navigate to SQL Editor");
    console.log("3. Paste the contents of scripts/auth-schema.sql");
    console.log("4. Run the script");
  } catch (error) {
    console.error("Unexpected error:", error);
  }
}

updateProfilesSchema();
