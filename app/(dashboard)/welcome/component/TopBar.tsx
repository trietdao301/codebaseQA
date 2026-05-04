"use client";
export default function TopBar() {

  return (
    <div className="flex items-center fixed top-0 left-0 right-0 z-50 text-sm justify-between px-8 h-14 bg-[var(--color-background-primary)]/80 backdrop-blur-md border-b-[0.5px] border-[var(--color-border-tertiary)] text-[var(--color-text-primary)]">
      <h1 className="font-semibold tracking-tight text-white">CodebaseQA</h1>

      <Nav />

      <div>
        <button className="text-sm px-4 py-1.5 rounded-full border border-neutral-700 hover:border-neutral-500 text-neutral-300 hover:text-white transition-colors">
          Login
        </button>
      </div>
    </div>
  );
}

function Nav() {
  const toProjects = () => {
    window.scrollTo({ top: 800, behavior: "smooth" });
  };
  const toFeatures = () => {
    window.scrollTo({ top: 1800, behavior: "smooth" });
  };

  const toMain = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return (
    <div className="flex items-center gap-8">
      <button className="text-neutral-400 hover:text-white transition-colors" onClick={toMain}>Home</button>
      <button className="text-neutral-400 hover:text-white transition-colors" onClick={toProjects}>Projects</button>
      <button className="text-neutral-400 hover:text-white transition-colors" onClick={toFeatures}>Features</button>

    </div>
  );
}