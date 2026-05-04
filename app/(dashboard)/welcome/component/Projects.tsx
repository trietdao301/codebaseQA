"use client";

import { useProjects, useSelectedProjectStore } from "@/app/state/projects";
import { Project } from "@/lib/db/schema";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { FaGithub } from "react-icons/fa";
import { useRouter } from "next/navigation";

export default function Projects() {
  const { data, isPending, error } = useProjects();
  if (isPending) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data) return <div>No projects found</div>;
  const projects: Project[] = data;

  return (
    <section className="flex flex-col items-center justify-center mx-50 pt-10 pb-30">
      <div className="text-center  p-10">
        <h2 className="text-2xl font-medium text-white">Projects</h2>
        <div className="grid grid-cols-3 items-center justify-center py-10 gap-3">
          {projects.map((e) => {
            return <ProjectCard key={e.id} project={e} />;
          })}

          <AddProjectCard />
        </div>
      </div>
    </section>
  );
}

function AddProjectCard() {
  const handleAdd = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return (
    <div className="w-[280px] py-29 rounded-2xl border border-neutral-800 bg-neutral-900 p-5 shadow-lg transition-all duration-300 hover:border-neutral-700 hover:shadow-xl">
      <div className="flex items-center justify-center">
        <Plus
          size={20}
          className="text-neutral-200 hover:text-neutral-400 cursor-pointer"
          onClick={handleAdd}
        />
      </div>
    </div>
  );
}
function ProjectCard({ project }: { project: Project }) {
  const router = useRouter();
  const setSelectedProject = useSelectedProjectStore(
    (state: any) => state.setSelectedProject,
  );
  const handleOpenWorkspace = () => {
    setSelectedProject(project);
    router.push(`/workspace/${project.id}`);
  };
  return (
    <div className="w-[280px] rounded-2xl border border-neutral-800 bg-neutral-900 p-5 shadow-lg transition-all duration-300 hover:border-neutral-700 hover:shadow-xl">
      {/* Top */}
      <div className="flex items-start justify-between">
        <div className="flex gap-3">
          {/* Icon */}
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-neutral-700 bg-neutral-800">
            <FaGithub
              size={20}
              className="text-neutral-200 hover:text-neutral-400 cursor-pointer"
              onClick={() => window.open(project.repo_url, "_blank")}
            />
          </div>

          {/* Title */}
          <div>
            <h3 className="text-sm font-semibold text-white">
              {project.repo_url.split("/").pop()}
            </h3>
            <h2 className="text-xs text-neutral-400 ">
              {project.repo_url.split("/").at(-2)}
            </h2>
          </div>
        </div>

        {/* Status */}
        <div className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2">
          <span className="text-[11px] font-medium text-emerald-400">
            indexed
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="my-4 border-t border-neutral-800" />

      {/* Stats */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-neutral-400">Indexed Files</span>
          <span className="font-medium text-white">
            {project.number_of_files}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-neutral-400">Vectors</span>
          <span className="font-medium text-white">
            {project.number_of_indexed_lines}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-neutral-400">Indexed on</span>
          <span className="font-medium text-white">
            {new Date(project.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="my-4 border-t border-neutral-800" />

      {/* Actions */}
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={handleOpenWorkspace}
          className="flex items-center mx-auto px-9 py-1 justify-center rounded-md bg-white text-sm font-medium text-black transition hover:bg-neutral-200"
        >
          Open workspace
        </button>

        <button className="flex py-1.75 px-3 items-center justify-center rounded-md border border-neutral-700 bg-neutral-800 text-neutral-300 transition hover:bg-neutral-700">
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}
