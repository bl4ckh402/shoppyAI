import { supabase } from "@/lib/supabase"
import type { Database } from "@/types/supabase"

export type Snippet = Database["public"]["Tables"]["snippets"]["Row"]
export type Tag = Database["public"]["Tables"]["tags"]["Row"]

export async function getSnippets() {
  const { data, error } = await supabase
    .from("snippets")
    .select(`
      *,
      tags:snippet_tags(
        tag:tags(*)
      )
    `)
    .order("updated_at", { ascending: false })

  if (error) {
    console.error("Error fetching snippets:", error)
    throw error
  }

  // Transform the nested structure to a more usable format
  return data.map((snippet) => ({
    ...snippet,
    tags: snippet.tags.map((tagObj: any) => tagObj.tag),
  }))
}

export async function getSnippet(id: string) {
  const { data, error } = await supabase
    .from("snippets")
    .select(`
      *,
      tags:snippet_tags(
        tag:tags(*)
      )
    `)
    .eq("id", id)
    .single()

  if (error) {
    console.error("Error fetching snippet:", error)
    throw error
  }

  // Transform the nested structure
  return {
    ...data,
    tags: data.tags.map((tagObj: any) => tagObj.tag),
  }
}

export async function createSnippet(
  snippet: Omit<Snippet, "id" | "created_at" | "updated_at">,
  tagNames: string[] = [],
) {
  // Start a transaction
  const { data, error } = await supabase.from("snippets").insert(snippet).select().single()

  if (error) {
    console.error("Error creating snippet:", error)
    throw error
  }

  // Add tags if provided
  if (tagNames.length > 0) {
    // First, ensure all tags exist
    for (const tagName of tagNames) {
      // Check if tag exists
      const { data: existingTag } = await supabase.from("tags").select("*").eq("name", tagName).single()

      if (!existingTag) {
        // Create tag if it doesn't exist
        await supabase.from("tags").insert({ name: tagName })
      }
    }

    // Get all the tags
    const { data: tags } = await supabase.from("tags").select("*").in("name", tagNames)

    if (tags) {
      // Create the snippet-tag relationships
      const snippetTags = tags.map((tag) => ({
        snippet_id: data.id,
        tag_id: tag.id,
      }))

      const { error: tagError } = await supabase.from("snippet_tags").insert(snippetTags)

      if (tagError) {
        console.error("Error adding tags to snippet:", tagError)
      }
    }
  }

  // Log usage
  await supabase.rpc("log_usage", {
    p_action: "create_snippet",
    p_resource_type: "snippet",
    p_resource_id: data.id,
    p_metadata: { title: snippet.title },
  })

  return data
}

export async function updateSnippet(
  id: string,
  updates: Partial<Omit<Snippet, "id" | "created_at" | "updated_at">>,
  tagNames?: string[],
) {
  const { data, error } = await supabase.from("snippets").update(updates).eq("id", id).select().single()

  if (error) {
    console.error("Error updating snippet:", error)
    throw error
  }

  // Update tags if provided
  if (tagNames) {
    // First, remove all existing tags
    await supabase.from("snippet_tags").delete().eq("snippet_id", id)

    // Then add the new tags
    if (tagNames.length > 0) {
      // Ensure all tags exist
      for (const tagName of tagNames) {
        const { data: existingTag } = await supabase.from("tags").select("*").eq("name", tagName).single()

        if (!existingTag) {
          await supabase.from("tags").insert({ name: tagName })
        }
      }

      // Get all the tags
      const { data: tags } = await supabase.from("tags").select("*").in("name", tagNames)

      if (tags) {
        // Create the snippet-tag relationships
        const snippetTags = tags.map((tag) => ({
          snippet_id: id,
          tag_id: tag.id,
        }))

        await supabase.from("snippet_tags").insert(snippetTags)
      }
    }
  }

  return data
}

export async function deleteSnippet(id: string) {
  // Delete snippet tags first (should cascade, but just to be safe)
  await supabase.from("snippet_tags").delete().eq("snippet_id", id)

  // Then delete the snippet
  const { error } = await supabase.from("snippets").delete().eq("id", id)

  if (error) {
    console.error("Error deleting snippet:", error)
    throw error
  }
}

export async function getTags() {
  const { data, error } = await supabase.from("tags").select("*").order("name")

  if (error) {
    console.error("Error fetching tags:", error)
    throw error
  }

  return data
}
