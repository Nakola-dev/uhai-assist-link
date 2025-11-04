import { supabase } from "@/integrations/supabase/client";

export type UserRole = "admin" | "user";

export async function getUserRole(userId: string): Promise<UserRole | null> {
  // Changed: Query profiles instead of non-existent user_roles
  const { data, error } = await supabase
    .from("profiles")  // Align with schema
    .select("role")
    .eq("id", userId)  // RLS-safe: Matches auth.uid() = id policy
    .maybeSingle();

  if (error) {
    console.error("Error fetching user role:", error);  // Add logging for debugging
    return null;
  }

  return data?.role as UserRole ?? null;  // Fallback to null if no row
}

export async function createUserRole(userId: string, role: UserRole = "user") {
  // Changed: Insert/update profiles instead (idempotent to avoid duplicates)
  const { error } = await supabase
    .from("profiles")
    .upsert([{ id: userId, role }], { onConflict: "id" });  // Upsert for safety

  if (error) {
    console.error("Error creating/updating user role:", error);
    return false;
  }

  return true;
}

export async function checkAdminAccess(userId: string): Promise<boolean> {
  const role = await getUserRole(userId);
  return role === "admin";
}