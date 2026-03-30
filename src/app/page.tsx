export default function Home() {
  return (
    <div className="relative isolate px-6 pt-14 lg:px-8">
      <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl mb-6">
          Tarot for the <span className="text-pink-500">Psychological Mind</span>
        </h1>
        <p className="text-lg leading-8 text-slate-300 mb-10">
          Transform your story through narrative therapy and tarot. 
          Gifted insight meets professional psychology to help you 
          uncover the hidden narratives of your life.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <a
            href="/readings"
            className="rounded-full bg-pink-600 px-8 py-4 text-sm font-semibold text-white shadow-sm hover:bg-pink-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-600 transition-all transform hover:scale-105"
          >
            Book a Session
          </a>
          <a href="/courses" className="text-sm font-semibold leading-6 text-white hover:text-pink-400">
            Learn the Method <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
      
      {/* Featured Services Section */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 pb-32">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-2xl">
            <h3 className="text-xl font-semibold mb-4 text-pink-400">Narrative Readings</h3>
            <p className="text-slate-400">50-minute deep-dive sessions combining psychological insight with tarot archetypes.</p>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-2xl">
            <h3 className="text-xl font-semibold mb-4 text-pink-400">Signature Course</h3>
            <p className="text-slate-400">Master the art of psychological tarot at your own pace. Recorded modules and workbooks.</p>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-2xl">
            <h3 className="text-xl font-semibold mb-4 text-pink-400">Writing Workshops</h3>
            <p className="text-slate-400">Use tarot as a catalyst for creative writing and deep shadow work.</p>
          </div>
        </div>
      </div>
    </div>
  );
}