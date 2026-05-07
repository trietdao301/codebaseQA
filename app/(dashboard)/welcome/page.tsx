import Content from "./component/Content";
import HowItWorks from "./component/HowItWorks";
import Projects from "./component/Projects";
import TopBar from "./component/TopBar";
import { ScrollProvider } from "./context/ScrollContext";

export default function Welcome() {
  return (
    <div className="flex flex-col min-h-[700px] ">
      <ScrollProvider>
        <TopBar />
        <Content />
        <Projects />
        <HowItWorks />
        <BottomAside />
      </ScrollProvider>
    </div>
  );
}

function BottomAside() {
  return (
    <div className="flex flex-col gap-10 items-center justify-center bg-[#0D0D0F] p-20">
      <h2 className="text-xl text-md text-neutral-600 font-jetbrains">
        BUILT FOR THE MODERN STACK
      </h2>
      <p className="text-sm text-neutral-400 font-geist-sans">
        Works with frameworks like Nextjs, React, Angular, Flask, Django, etc.
      </p>
    </div>
  );
}
