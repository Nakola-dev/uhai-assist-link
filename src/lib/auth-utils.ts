// src/lib/auth-utils.ts
import { supabase } from "@/integrations/supabase/client";

/**
 * Role type — matches your profiles.role ENUM
 */
export type UserRole = "admin" | "user";

/**
 * Get user role from profiles table
 * RLS: Only allows reading own profile → secure
 */
export async function getUserRole(userId: string): Promise<UserRole | null> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("[auth-utils] Error fetching role:", error);
      return null;
    }

    if (!data) {
      console.warn("[auth-utils] No profile found for user:", userId);
      return null;
    }

    return data.role as UserRole;
  } catch (err) {
    console.error("[auth-utils] Unexpected error in getUserRole:", err);
    return null;
  }
}

/**
 * Ensure profile exists with role (used on signup or fallback)
 * Uses upsert → safe if trigger already ran
 */
export async function ensureUserRole(userId: string, role: UserRole = "user"): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("profiles")
      .upsert(
        {
          id: userId,
          role,
          updated_at: new Date().toISOString(), // Optional: force updated_at
        },
        { onConflict: "id" }
      );

    if (error) {
      console.error("[auth-utils] Failed to upsert role:", error);
      return false;
    }

    console.log(`[auth-utils] Role ensured: ${role} for user ${userId}`);
    return true;
  } catch (err) {
    console.error("[auth-utils] Unexpected error in ensureUserRole:", err);
    return false;
  }
}

/**
 * Check if user is admin
 * Uses getUserRole → no direct DB access
 */
export async function checkAdminAccess(userId: string): Promise<boolean> {
  const role = await getUserRole(userId);
  const isAdmin = role === "admin";
  
  if (isAdmin) {
    console.log(`[auth-utils] Admin access granted for user: ${userId}`);
  }

  return isAdmin;
}