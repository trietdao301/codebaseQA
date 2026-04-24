/** Serializable code unit for search / embedding (e.g. `auth/authenticator.py::authenticate_user`). */
export type ChunkType = "function" | "class" | "method" | "interface";

export type Chunk = {
  // Identity
  id: string; // "auth/authenticator.py::authenticate_user"
  type: ChunkType;
  language: string; // e.g. "python" | "javascript" | "go"

  // Location
  normalized_file_path: string; // "auth/authenticator.py"
  line_start: number; // 12
  line_end: number; // 34

  // Symbol info
  declaration_name: string; // "authenticate_user"
  docstring: string; // "Verify credentials and return user"

  // Enrichment 
  first_line_text: string; // "def authenticate_user(request: Request) -> User:"

  // Embedding payload
  text: string; // assembled from all above fields
  embedding: number[]; // voyage-code-2 output
};

