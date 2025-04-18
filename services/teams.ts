import { supabase } from "@/lib/supabase"
import type { Database } from "@/types/supabase"

export type Team = Database["public"]["Tables"]["teams"]["Row"]
export type TeamMember = Database["public"]["Tables"]["team_members"]["Row"]

export async function getTeams() {
  // Get teams the user is a member of
  const { data, error } = await supabase
    .from("teams")
    .select(`
      *,
      members:team_members(
        user_id,
        role
      )
    `)
    .order("name")

  if (error) {
    console.error("Error fetching teams:", error)
    throw error
  }

  return data
}

export async function getTeam(id: string) {
  const { data, error } = await supabase
    .from("teams")
    .select(`
      *,
      members:team_members(
        user_id,
        role,
        profiles:profiles(*)
      ),
      projects:team_projects(
        project:projects(*)
      )
    `)
    .eq("id", id)
    .single()

  if (error) {
    console.error("Error fetching team:", error)
    throw error
  }

  // Transform the nested structure
  return {
    ...data,
    members: data.members.map((member: any) => ({
      ...member,
      profile: member.profiles,
    })),
    projects: data.projects.map((projectObj: any) => projectObj.project),
  }
}

export async function createTeam(team: Omit<Team, "id" | "created_at" | "updated_at">) {
  const { data, error } = await supabase.from("teams").insert(team).select().single()

  if (error) {
    console.error("Error creating team:", error)
    throw error
  }

  // Add the creator as an owner
  const { error: memberError } = await supabase.from("team_members").insert({
    team_id: data.id,
    user_id: team.owner_id,
    role: "owner",
  })

  if (memberError) {
    console.error("Error adding team owner:", memberError)
    throw memberError
  }

  // Log usage
  await supabase.rpc("log_usage", {
    p_action: "create_team",
    p_resource_type: "team",
    p_resource_id: data.id,
    p_metadata: { team_name: team.name },
  })

  return data
}

export async function updateTeam(id: string, updates: Partial<Omit<Team, "id" | "created_at" | "updated_at">>) {
  const { data, error } = await supabase.from("teams").update(updates).eq("id", id).select().single()

  if (error) {
    console.error("Error updating team:", error)
    throw error
  }

  return data
}

export async function deleteTeam(id: string) {
  // Delete team members first (should cascade, but just to be safe)
  await supabase.from("team_members").delete().eq("team_id", id)

  // Delete team projects
  await supabase.from("team_projects").delete().eq("team_id", id)

  // Then delete the team
  const { error } = await supabase.from("teams").delete().eq("id", id)

  if (error) {
    console.error("Error deleting team:", error)
    throw error
  }
}

export async function addTeamMember(teamId: string, userId: string, role: string) {
  const { data, error } = await supabase
    .from("team_members")
    .insert({
      team_id: teamId,
      user_id: userId,
      role,
    })
    .select()
    .single()

  if (error) {
    console.error("Error adding team member:", error)
    throw error
  }

  return data
}

export async function updateTeamMemberRole(teamId: string, userId: string, role: string) {
  const { data, error } = await supabase
    .from("team_members")
    .update({ role })
    .match({ team_id: teamId, user_id: userId })
    .select()
    .single()

  if (error) {
    console.error("Error updating team member role:", error)
    throw error
  }

  return data
}

export async function removeTeamMember(teamId: string, userId: string) {
  const { error } = await supabase.from("team_members").delete().match({ team_id: teamId, user_id: userId })

  if (error) {
    console.error("Error removing team member:", error)
    throw error
  }
}

export async function addProjectToTeam(teamId: string, projectId: string) {
  const { data, error } = await supabase
    .from("team_projects")
    .insert({
      team_id: teamId,
      project_id: projectId,
    })
    .select()
    .single()

  if (error) {
    console.error("Error adding project to team:", error)
    throw error
  }

  return data
}

export async function removeProjectFromTeam(teamId: string, projectId: string) {
  const { error } = await supabase.from("team_projects").delete().match({ team_id: teamId, project_id: projectId })

  if (error) {
    console.error("Error removing project from team:", error)
    throw error
  }
}
