// import React from "react";
import { Link, useNavigate } from "react-router";

const LoginPage = () => {
  const navigate = useNavigate();

  const handleSubmit = (e: any) => {
    e.preventDefault();
    navigate("/practice");
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 font-sans selection:bg-cyan-500/30 overflow-x-hidden flex flex-col">
      {/* 1. Background - Ensures glow covers the absolute edges */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,_rgba(34,211,238,0.12)_0%,_transparent_50%)]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[60%] h-[60%] bg-blue-600/5 blur-[120px] rounded-full" />
      </div>

      {/* 2. Navigation - No max-width, uses viewport padding */}
      <nav className="relative z-50 flex items-center justify-between w-full px-[5vw] py-10 md:py-14">
        <Link
          to="/"
          className="text-3xl md:text-5xl font-black tracking-tighter text-white hover:opacity-80 transition-all"
        >
          SPEAK<span className="text-cyan-400">CODE</span>
        </Link>
        <div className="flex items-center gap-8">
          <Link
            to="/signup"
            className="hidden sm:block text-sm font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
          >
            Sign Up
          </Link>
          <Link
            to="/practice"
            className="px-8 py-4 bg-white text-slate-950 rounded-full font-black text-xs md:text-sm hover:bg-cyan-400 transition-all active:scale-95 shadow-xl shadow-white/5"
          >
            TRY DEMO
          </Link>
        </div>
      </nav>

      {/* 3. Main Container - Grid expanded to full width */}
      <main className="relative z-10 flex-1 flex items-center justify-center w-full px-[5vw] pb-24">
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-24 items-center h-full">
          {/* Left Column: Direct Heading */}
          <div className="hidden lg:flex flex-col space-y-8">
            <h1 className="text-[clamp(3.5rem,6vw,8rem)] font-extrabold text-white leading-[1] tracking-tighter">
              Ready to <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                start practicing?
              </span>
            </h1>
            <p className="text-2xl 2xl:text-4xl text-slate-400 max-w-2xl leading-relaxed font-medium">
              Log in to access your interview dashboard and track your
              communication metrics.
            </p>
          </div>

          {/* Right Column: The Form Card */}
          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-[650px] bg-slate-900/10 border border-slate-800/40 p-10 md:p-16 2xl:p-20 rounded-[3.5rem] backdrop-blur-md shadow-[0_30px_60px_rgba(0,0,0,0.6)]">
              <div className="mb-12 lg:hidden text-center">
                <h2 className="text-4xl font-bold text-white tracking-tight leading-none">
                  Sign In
                </h2>
              </div>

              <form className="space-y-10" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-xs md:text-sm font-black uppercase tracking-[0.3em] text-cyan-500 mb-4 ml-2">
                    Email Address
                  </label>
                  <input
                    required
                    type="email"
                    placeholder="you@example.com"
                    className="w-full px-8 py-6 md:py-7 bg-slate-950/50 border border-slate-800 rounded-3xl focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-slate-800 text-white text-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs md:text-sm font-black uppercase tracking-[0.3em] text-cyan-500 mb-4 ml-2">
                    Password
                  </label>
                  <input
                    required
                    type="password"
                    placeholder="••••••••"
                    className="w-full px-8 py-6 md:py-7 bg-slate-950/50 border border-slate-800 rounded-3xl focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-slate-800 text-white text-xl"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-6 md:py-8 bg-cyan-500 text-slate-950 font-black rounded-3xl text-xl md:text-2xl hover:bg-cyan-400 transition-all hover:shadow-[0_0_50px_rgba(34,211,238,0.4)] active:scale-[0.98]"
                >
                  LOG IN
                </button>
              </form>

              <div className="mt-12 text-center">
                <p className="text-slate-500 text-base md:text-lg">
                  Don't have an account?{" "}
                  <Link
                    to="/signup"
                    className="text-white font-bold hover:text-cyan-400 underline decoration-cyan-500/30 underline-offset-8 transition-colors"
                  >
                    Sign up for free
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 4. Footer - Centered Copyright */}
      <footer className="relative z-10 py-16 px-[5vw] text-center border-t border-slate-900/50">
        <p className="text-slate-700 text-sm font-bold tracking-[0.5em] uppercase">
          © 2026 SPEAKCODE
        </p>
      </footer>
    </div>
  );
};

export default LoginPage;
