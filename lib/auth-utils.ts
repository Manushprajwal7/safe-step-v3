import { createAdminClient } from "@/lib/supabase/server";

/**
 * Automatically confirms a user's email address
 * This bypasses the need for email confirmation
 *
 * @param userId - The ID of the user to confirm
 * @returns Promise<boolean> - Whether the confirmation was successful
 */
export async function confirmUserEmail(userId: string): Promise<boolean> {
  try {
    const adminClient = createAdminClient();

    const { error } = await adminClient.auth.admin.updateUserById(userId, {
      email_confirm: true,
    });

    if (error) {
      console.error("Error confirming user:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Unexpected error confirming user:", error);
    return false;
  }
}

/**
 * Checks if a user is confirmed and confirms them if they're not
 *
 * @param userId - The ID of the user to check and potentially confirm
 * @returns Promise<boolean> - Whether the user is confirmed (either already was or now is)
 */
export async function ensureUserIsConfirmed(userId: string): Promise<boolean> {
  try {
    const adminClient = createAdminClient();

    // Get the user to check their confirmation status
    const {
      data: { user },
      error: getUserError,
    } = await adminClient.auth.admin.getUserById(userId);

    if (getUserError || !user) {
      console.error("Error getting user:", getUserError);
      return false;
    }

    // If user is already confirmed, return true
    if (user.email_confirmed_at) {
      return true;
    }

    // If not confirmed, confirm them now
    const { error: updateError } = await adminClient.auth.admin.updateUserById(
      userId,
      {
        email_confirm: true,
      }
    );

    if (updateError) {
      console.error("Error confirming user:", updateError);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Unexpected error in ensureUserIsConfirmed:", error);
    return false;
  }
}
