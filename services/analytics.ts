import { supabase } from "@/lib/supabase"
import type { Database } from "@/types/supabase"

export type UsageLog = Database["public"]["Tables"]["usage_logs"]["Row"]

export async function logUsage(action: string, resourceType?: string, resourceId?: string, metadata?: any) {
  const { data, error } = await supabase.rpc("log_usage", {
    p_action: action,
    p_resource_type: resourceType,
    p_resource_id: resourceId,
    p_metadata: metadata || {},
  })

  if (error) {
    console.error("Error logging usage:", error)
    throw error
  }

  return data
}

export async function getUserUsage(userId: string, startDate?: string, endDate?: string) {
  let query = supabase.from("usage_logs").select("*").eq("user_id", userId).order("created_at", { ascending: false })

  if (startDate) {
    query = query.gte("created_at", startDate)
  }

  if (endDate) {
    query = query.lte("created_at", endDate)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching user usage:", error)
    throw error
  }

  return data
}

export async function getUsageStats(startDate?: string, endDate?: string) {
  // This would typically be a server-side function with admin privileges
  // For this example, we'll just get counts of different actions
  let query = supabase.from("usage_logs").select("action, count(*)").group("action")

  if (startDate) {
    query = query.gte("created_at", startDate)
  }

  if (endDate) {
    query = query.lte("created_at", endDate)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching usage stats:", error)
    throw error
  }

  return data
}
