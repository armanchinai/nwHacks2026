import React from "react";
import { Link } from "react-router-dom";

const SignupPage = () => {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 font-sans selection:bg-cyan-500/30 overflow-x-hidden flex flex-col">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,_rgba(34,211,238,0.12)_0%,_transparent_50%)]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[60%] h-[60%] bg-blue-600/5 blur-[120px] rounded-full" />
      </div>

      <nav className="relative z-50 flex items-center justify-between w-full px-[5vw] py-10 md:py-14">
        <Link
          to="/"
          className="text-3xl md:text-5xl font-black tracking-tighter text-white hover:opacity-80 transition-all"
        >
          SPEAK<span className="text-cyan-400">CODE</span>
        </Link>
        <div className="flex items-center gap-8">
          <Link
            to="/login"
            className="hidden sm:block text-sm font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
          >
            Login
          </Link>
          <Link
            to="/practice"
            className="px-8 py-4 bg-white text-slate-950 rounded-full font-black text-xs md:text-sm hover:bg-cyan-400 transition-all active:scale-95 shadow-xl shadow-white/5"
          >
            TRY DEMO
          </Link>
        </div>
      </nav>

      <main className="relative z-10 flex-1 flex items-center justify-center w-full px-[5vw] pb-24">
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-24 items-center h-full">
          <div className="hidden lg:flex flex-col space-y-8">
            <h1 className="text-[clamp(3.5rem,6vw,8rem)] font-extrabold text-white leading-[1] tracking-tighter">
              Build your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                Confidence.
              </span>
            </h1>
            <p className="text-2xl 2xl:text-4xl text-slate-400 max-w-2xl leading-relaxed font-medium">
              Join SpeakCode to bridge the gap between solving problems and
              explaining them. Track your growth through every session.
            </p>
          </div>

          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-[650px] bg-slate-900/10 border border-slate-800/40 p-10 md:p-16 2xl:p-20 rounded-[3.5rem] backdrop-blur-md shadow-[0_30px_60px_rgba(0,0,0,0.6)]">
              <div className="mb-12 lg:hidden text-center">
                <h2 className="text-4xl font-bold text-white tracking-tight leading-none">
                  Get Started
                </h2>
              </div>

              <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
                <div>
                  <label className="block text-xs md:text-sm font-black uppercase tracking-[0.3em] text-cyan-500 mb-4 ml-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="Arsen Madi"
                    className="w-full px-8 py-6 md:py-7 bg-slate-950/50 border border-slate-800 rounded-3xl focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-slate-800 text-white text-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs md:text-sm font-black uppercase tracking-[0.3em] text-cyan-500 mb-4 ml-2">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="dev@example.com"
                    className="w-full px-8 py-6 md:py-7 bg-slate-950/50 border border-slate-800 rounded-3xl focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-slate-800 text-white text-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs md:text-sm font-black uppercase tracking-[0.3em] text-cyan-500 mb-4 ml-2">
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full px-8 py-6 md:py-7 bg-slate-950/50 border border-slate-800 rounded-3xl focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-slate-800 text-white text-xl"
                  />
                </div>

                <button className="w-full py-6 md:py-8 bg-cyan-500 text-slate-950 font-black rounded-3xl text-xl md:text-2xl hover:bg-cyan-400 transition-all hover:shadow-[0_0_50px_rgba(34,211,238,0.4)] active:scale-[0.98]">
                  CREATE ACCOUNT
                </button>
              </form>

              <div className="mt-12 text-center">
                <p className="text-slate-500 text-base md:text-lg">
                  Already a member?{" "}
                  <Link
                    to="/login"
                    className="text-white font-bold hover:text-cyan-400 underline decoration-cyan-500/30 underline-offset-8 transition-colors"
                  >
                    Login
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="relative z-10 py-16 px-[5vw] text-center border-t border-slate-900/50">
        <p className="text-slate-700 text-sm font-bold tracking-[0.5em] uppercase">
          © 2026 SPEAKCODE
        </p>
      </footer>
    </div>
  );
};

export default SignupPage;
