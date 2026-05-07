import { createClient } from "@/lib/client/supabase_client";
import { Project } from "@/lib/db/schema";
import { useQuery } from "@tanstack/react-query";

export const useProjects = () => {
  // no async
  const supabase = createClient();
  const { data, isPending, error } = useQuery({
    queryKey: ["projects"],
    queryFn: async (): Promise<Project[]> => {
      const { data, error } = await supabase.from("projects").select("*");
      if (error)
        throw new Error(
          `Supabase read failed: ${error.message} (code: ${error.code})`,
        );
      const projects: Project[] = data.map((project: Project) => ({
        id: project.id,
        github_repo_url: project.github_repo_url,
        number_of_files: project.number_of_files,
        number_of_vectors: project.number_of_vectors,
        number_of_indexed_lines: project.number_of_indexed_lines,
        created_at: project.created_at,
      }));
      return projects;
    },
  });

  return { data, isPending, error };
};

// store/currentProject.ts
import { create } from "zustand";

export const useSelectedProjectStore = create((set) => ({
  selectedProject: null,
  setSelectedProject: (project: Project | null) =>
    set({ selectedProject: project }),
  reset: () => set({ selectedProject: null }),
}));
