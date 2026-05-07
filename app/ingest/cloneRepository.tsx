import { spawn } from "child_process";

export function cloneRepository(
  repoUrl: string,
  destination: string,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn("git", ["clone", repoUrl, destination], {
      shell: process.platform === "win32",
    });

    let stderr = "";
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", (error) => {
      reject(error);
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(stderr || `git clone failed with code ${code}`));
      }
    });
  });
}
