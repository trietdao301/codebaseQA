import { NextResponse } from "next/server";

export async function languageCheck(repoUrl: string): Promise<boolean> {
  // Extract owner/repo from URL
  const match = repoUrl
    .replace("https://", "")
    .match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) {
    return false;
  }
  const [, owner, repo] = match;

  // Check language via GitHub API
  const ghRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
    },
  });

  if (!ghRes.ok) {
    return false;
  }

  const ghData = await ghRes.json();
  const language = ghData.language as string | null; // GitHub's detected primary language

  const SUPPORTED_LANGUAGES = ["Python", "TypeScript", "JavaScript"];
  if (!language || !SUPPORTED_LANGUAGES.includes(language)) {
    return false;
  }
  return true;
}
