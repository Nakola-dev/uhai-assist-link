import { supabase } from "@/integrations/supabase/client";

export type UserRole = "admin" | "user";

export async function getUserRole(userId: string): Promise<UserRole | null> {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data.role as UserRole;
}

export async function createUserRole(userId: string, role: UserRole = "user") {
  const { error } = await supabase
    .from("user_roles")
    .insert([{ user_id: userId, role }]);

  if (error) {
    console.error("Error creating user role:", error);
    return false;
  }

  return true;
}

export async function checkAdminAccess(userId: string): Promise<boolean> {
  const role = await getUserRole(userId);
  return role === "admin";
}
