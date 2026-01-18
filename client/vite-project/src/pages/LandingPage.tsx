import React from "react";
import { Link } from "react-router";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 selection:bg-cyan-500/30 font-sans selection:text-white overflow-x-hidden">
      {/* 1. Fluid Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,_rgba(34,211,238,0.12)_0%,_transparent_50%)]" />
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-cyan-500/5 blur-[120px]" />
      </div>

      {/* 2. Navigation */}
      <nav className="relative z-50 flex items-center justify-between max-w-[1600px] mx-auto px-6 md:px-12 2xl:px-20 py-8 md:py-12">
        <div className="text-2xl md:text-4xl font-black tracking-tighter text-white">
          SPEAK<span className="text-cyan-400">CODE</span>
        </div>
        <div className="flex items-center gap-6 md:gap-12">
          <a
            href="#features"
            className="text-sm font-bold tracking-widest uppercase hover:text-cyan-400 transition-colors hidden lg:block text-slate-500"
          >
            Process
          </a>
          <Link
            to="/practice"
            className="px-6 py-3 md:px-10 md:py-5 bg-white text-slate-950 rounded-full font-black text-xs md:text-base hover:bg-cyan-400 transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.1)]"
          >
            GET STARTED
          </Link>
        </div>
      </nav>

      {/* 3. Hero Section */}
      <main className="relative z-10 max-w-[1600px] mx-auto px-6 md:px-12 2xl:px-20 pt-12 md:pt-20 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-24 items-center">
          {/* Left Content */}
          <div className="lg:col-span-8 2xl:col-span-7">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-cyan-500/20 bg-cyan-500/5 mb-8">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
              </span>
              <span className="text-[10px] md:text-xs font-black tracking-[0.2em] uppercase text-cyan-400">
                Low Time • High Pressure
              </span>
            </div>

            <h1 className="text-[clamp(2.5rem,7.5vw,9rem)] font-extrabold text-white tracking-tighter leading-[1.05] md:leading-[0.85] mb-10">
              Coding is only <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-500">
                half the battle.
              </span>
            </h1>

            <p className="text-xl md:text-3xl 2xl:text-4xl text-slate-400 leading-relaxed max-w-4xl mb-12 font-medium">
              SpeakCode listens to your verbal reasoning while you code, scoring
              your clarity and confidence under interview pressure.
            </p>

            <div className="flex flex-col sm:flex-row gap-6">
              <Link
                to="/practice"
                className="group px-10 py-5 md:px-14 md:py-6 bg-cyan-500 text-slate-950 font-black rounded-2xl text-lg md:text-2xl flex items-center justify-center gap-3 hover:bg-cyan-400 transition-all hover:shadow-[0_0_50px_rgba(34,211,238,0.4)]"
              >
                Start Practice Session
                <svg
                  className="w-6 h-6 md:w-8 md:h-8 group-hover:translate-x-2 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="3"
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Link>
            </div>
          </div>

          {/* Right Visual */}
          <div className="hidden lg:flex lg:col-span-4 2xl:col-span-5 justify-end relative">
            <div className="w-full aspect-square max-w-[500px] 2xl:max-w-[600px] border-2 border-slate-800 rounded-full flex items-center justify-center relative">
              <div className="w-[85%] h-[85%] border border-cyan-500/20 rounded-full animate-[spin_15s_linear_infinite]" />
              <div className="absolute w-[65%] h-[65%] border-t-2 border-cyan-400 rounded-full animate-[spin_5s_linear_infinite]" />
              <div className="absolute text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">
                <svg
                  className="w-24 h-24 2xl:w-32 2xl:h-32 animate-pulse"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1"
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Feature Grid */}
        <div
          id="features"
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 2xl:gap-12 mt-48 md:mt-64"
        >
          <Feature
            title="Voice Intelligence"
            desc="AI analysis of your pacing and tone to ensure you sound as confident as your code looks."
          />
          <Feature
            title="Pressure Simulation"
            desc="Timed technical screenings that evaluate your ability to think out loud while solving puzzles."
          />
          <Feature
            title="Technical Clarity"
            desc="Detailed scoring on how well you explain data structures and your overall solution path."
          />
        </div>
      </main>

      {/* 5. Footer - Centered Copyright */}
      <footer className="border-t border-slate-900/50 py-16 px-6 2xl:px-20 max-w-[1600px] mx-auto">
        <div className="flex items-center justify-center w-full">
          <p className="text-slate-600 text-sm font-bold tracking-[0.3em] uppercase">
            © 2026 SPEAKCODE
          </p>
        </div>
      </footer>
    </div>
  );
};

const Feature = ({ title, desc }) => (
  <div className="p-10 md:p-14 2xl:p-16 rounded-[3rem] bg-slate-900/10 border border-slate-800/40 hover:border-cyan-500/50 transition-all group backdrop-blur-md">
    <div className="w-16 h-2 bg-cyan-500 mb-8 group-hover:w-full transition-all duration-700 ease-in-out" />
    <h3 className="text-white font-black text-3xl 2xl:text-4xl mb-6 tracking-tight">
      {title}
    </h3>
    <p className="text-slate-400 text-xl leading-relaxed">{desc}</p>
  </div>
);

export default LandingPage;
