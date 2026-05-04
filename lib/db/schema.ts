export type Project = {
  id: string;
  github_repo_url: string;
  number_of_files: number;
  number_of_vectors: number;
  number_of_indexed_lines: number;
  created_at: string;
};

export type CodeLine = {
  id: string;
  github_repo_url: string;
  relative_path: string;
  line_no: number;
  content: string;
};

/** Serializable code unit for search / embedding (e.g. `auth/authenticator.py::authenticate_user`). */
export type ChunkType = "function" | "class" | "method" | "interface";

export type Chunk = {
  // Identity
  id: string; // uuid
  type: ChunkType;
  language: string; // e.g. "python" | "javascript" | "go"

  // Location
  github_repo_url: string; // "github.com/user/repo/blob"
  relative_file_path: string; // "auth/authenticator.py"
  line_start: number; // 12
  line_end: number; // 34

  // Symbol info
  declaration_name: string; // "authenticate_user"
  docstring: string; // "Verify credentials and return user"

  // Enrichment
  first_line_text: string; // "def authenticate_user(request: Request) -> User:"

  // Embedding payload
  text: string; // assembled from all above fields
};
