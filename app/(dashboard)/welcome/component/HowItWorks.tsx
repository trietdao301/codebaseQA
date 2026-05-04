import { Braces, Code, Waypoints } from "lucide-react";
import { FaArrowRightLong, FaPython } from "react-icons/fa6";
import { TbAdjustmentsSearch, TbVirusSearch } from "react-icons/tb";
import { SiTypescript } from "react-icons/si";
import { DiPython } from "react-icons/di";
import { LuTextSearch } from "react-icons/lu";
import { FaRobot } from "react-icons/fa6";

export default function HowItWorks() {
  return (
    <section className="flex flex-col items-center justify-center pb-30 pt-30 mx-50 ">
      <div className="text-center max-w-2xl mb-10">
        <h2 className="text-2xl font-medium text-white">How It Works</h2>
      </div>

      <div className="grid grid-cols-9 items-center  justify-center gap-5 rounded-2xl p-5 w-[90%] text-[#f2faeb]"> 
        <div className="col-span-6 bg-[#171A1C] border hover:border-[#f2faeb]/20 transition-colors border-neutral-800 rounded-2xl px-8 pt-8 pb-5 ">
          <div className="flex justify-between">
            <div className="p-2.5 bg-green-950 rounded-lg">
              <Braces size={22} className="text-green-300" />
            </div>
            <Waypoints size={20} className="text-neutral-200 hover:text-neutral-400 opacity-50" />
          </div>
          <div className=" flex flex-col gap-7 mt-5 mr-70">
            <h3 className="text-lg font-medium">Deep AST Parsing</h3>
            <p> Use tree-sitter ast to select meaningful nodes from the codebase and create their 
              corresponding vector embeddings, preparing for semantic search. </p>
            <div className="flex items-center gap-2 text-green-200 pt-5">
              <div className="flex items-center gap-2 px-3 bg-green-950 rounded-sm border border-green-800/40">
                <img
                  src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg"
                  width={15}
                  height={15}
                  alt="Python"
                  style={{ display: "block" }}
                />
                Python
              </div>
              <div className="flex items-center gap-2 px-3 bg-green-950 rounded-sm border border-green-800/40">
                <img
                  src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-original.svg"
                  width={15}
                  height={15}
                  alt="TypeScript"
                  style={{ display: "block" }}
                />
                Typescript
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-3 border-neutral-900 border rounded-2xl px-10 pt-10 pb-6 flex flex-col gap-5 bg-[#1d2023] hover:border-[#f9b9fd]/20 transition-colors">
          <TbAdjustmentsSearch size={22} color="#f9b9fd" className="hover:text-neutral-400" />
          <h3 className="text-lg font-medium">Semantic Search</h3>
          <p className="text-neutral-400 text-sm"> Vectorized symbols with OpenAI model for natural language code querying. Find logic, not just strings.</p>
          <div className="mt-10 border-t border-neutral-800" />
          <div className="flex justify-between text-sm">
            <h3 className="text-neutral-400">Vector dimension</h3>
            <p>1536</p>
          </div>
        </div>

        <div className="flex flex-col gap-5 bg-[#171A1C] col-span-3 border border-neutral-900 rounded-2xl px-8 pr-10 py-8 pb-5 hover:border-[#00bba7]/30 transition-colors">
          <div className="flex">
            <div className="p-2.5 bg-[#061E29] rounded-lg">
              <TbVirusSearch size={22} color="#00d5be" className="hover:text-neutral-400" />
            </div>
          </div>
      
          <h3 className="text-lg font-medium">Keyword search</h3>
          <p className="text-neutral-400 text-sm">Tokenize and store lines of code in postgres. <br />
            Use pg_trgm extension to perform grep-like search throughout the codebase. </p>
          <div className="flex gap-2 mt-8">
            <div className="flex items-center gap-2">
               <h2 className="text-sm font-sm text-[#00d5be] border border-[#00d5be]/10 bg-[#061E29] rounded-sm px-2 py-1">Tokenize</h2>
               <FaArrowRightLong size={10} />
            </div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-sm text-[#F7B980] border border-[#FFD8DF]/10 bg-neutral-800 rounded-sm px-2 py-1">Index</h2>
              <FaArrowRightLong size={10} />
            </div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-sm text-[#FF8383] border border-[#FF8383]/10 bg-neutral-800 rounded-sm px-2 py-1">Postgres</h2>
            </div>
          </div>
        </div>
        <div className="col-span-6 border border-neutral-900 rounded-2xl p-8 pt-9 pb-4 flex flex-col gap-5 bg-[#1d2023] hover:border-[#FFA95A]/20 transition-colors">
          <FaRobot size={25} color="#FFA95A" className="hover:text-neutral-400" />
          <h3 className="text-lg font-medium">Smart AI Assistant</h3>
          <p className="text-neutral-400 text-sm">Use OpenAI model to analysis and generate responses to user queries. <br/>Equip AI up to 5+ tools to perform tasks like grep-like search, semantic search, and more  on its own using langgraph framework.</p>
          <div className="flex gap-2 mt-11 items-center">
            <h2 className="text-sm font-sm text-neutral-400">Question Scope</h2>
            <FaArrowRightLong size={10} className="text-neutral-600" />

            <div className="bg-purple-950/60 rounded-sm border border-purple-700/30 px-2 py-1 text-sm text-purple-300">Architecture</div>
            <div className="bg-blue-950/60 rounded-sm border border-blue-700/30 px-2 py-1 text-sm text-blue-300">Keyword</div>
            <div className="bg-teal-950/60 rounded-sm border border-teal-700/30 px-2 py-1 text-sm text-teal-300">Explanation</div>
            <div className="bg-amber-950/60 rounded-sm border border-amber-700/30 px-2 py-1 text-sm text-amber-300">Logic</div>
          </div>
        </div>
        <div className="col-span-9 border border-neutral-900 rounded-2xl p-10 flex flex-col gap-5 items-center justify-center bg-[#171A1C]">
          <h3 className="text-3xl font-medium">2 languages supported</h3>
          <div className="flex gap-10">
            <LanguageBox text="Python" icon={<FaPython size={20} />} />
            <LanguageBox text="TypeScript" icon={<SiTypescript size={20} />} />
          </div>
        </div>


      </div>
    </section>
  );
}

function LanguageBox({text, icon}: {text: string, icon: React.ReactNode}){
  return (
    <div className="flex items-center gap-2">
      {icon}
      <p>{text}</p>
    </div>
  );
}