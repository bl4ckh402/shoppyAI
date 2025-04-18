import { supabase } from "@/lib/supabase"
import type { Database } from "@/types/supabase"

export type Project = Database["public"]["Tables"]["projects"]["Row"]
export type ProjectFile = Database["public"]["Tables"]["project_files"]["Row"]

export async function getProjects() {
  const { data, error } = await supabase.from("projects").select("*").order("updated_at", { ascending: false })

  if (error) {
    console.error("Error fetching projects:", error)
    throw error
  }

  return data
}

export async function getProject(id: string) {
  const { data, error } = await supabase.from("projects").select("*").eq("id", id).single()

  if (error) {
    console.error("Error fetching project:", error)
    throw error
  }

  return data
}

export async function createProject(project: Omit<Project, "id" | "created_at" | "updated_at">) {
  // Log usage
  await supabase.rpc("log_usage", {
    p_action: "create_project",
    p_metadata: { project_name: project.name },
  })

  const { data, error } = await supabase.from("projects").insert(project).select().single()

  if (error) {
    console.error("Error creating project:", error)
    throw error
  }

  return data
}

export async function updateProject(id: string, updates: Partial<Omit<Project, "id" | "created_at" | "updated_at">>) {
  const { data, error } = await supabase.from("projects").update(updates).eq("id", id).select().single()

  if (error) {
    console.error("Error updating project:", error)
    throw error
  }

  return data
}

export async function deleteProject(id: string) {
  const { error } = await supabase.from("projects").delete().eq("id", id)

  if (error) {
    console.error("Error deleting project:", error)
    throw error
  }
}

export async function getProjectFiles(projectId: string) {
  const { data, error } = await supabase
    .from("project_files")
    .select("*")
    .eq("project_id", projectId)
    .order("path", { ascending: true })

  if (error) {
    console.error("Error fetching project files:", error)
    throw error
  }

  return data
}

export async function createProjectFile(file: Omit<ProjectFile, "id" | "created_at" | "updated_at">) {
  const { data, error } = await supabase.from("project_files").insert(file).select().single()

  if (error) {
    console.error("Error creating project file:", error)
    throw error
  }

  return data
}

export async function updateProjectFile(
  id: string,
  updates: Partial<Omit<ProjectFile, "id" | "created_at" | "updated_at">>,
) {
  const { data, error } = await supabase.from("project_files").update(updates).eq("id", id).select().single()

  if (error) {
    console.error("Error updating project file:", error)
    throw error
  }

  return data
}

export async function deleteProjectFile(id: string) {
  const { error } = await supabase.from("project_files").delete().eq("id", id)

  if (error) {
    console.error("Error deleting project file:", error)
    throw error
  }
}
