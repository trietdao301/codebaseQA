export type DirectoryNode = {
    name: string;
    path: string;
    type: "file" | "directory";
    children?: DirectoryNode[];
};
