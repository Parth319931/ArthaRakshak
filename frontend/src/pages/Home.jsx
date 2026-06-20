import { Link } from 'react-router-dom'

const FEATURES = [
  {
    eyebrow: 'Scam Protection',
    title: 'Scam Check',
    description: 'Paste a message or upload a screenshot. Get a verdict in seconds, in plain language.',
    to: '/scam-check'
  },
  {
    eyebrow: 'Cash-Flow Planning',
    title: 'Loan & Savings Simulator',
    description: 'See the real cost of a loan against saving the same amount instead, side by side.',
    to: '/cash-flow'
  },
  {
    eyebrow: 'Voice & Language',
    title: 'Voice Assistant',
    description: 'Ask a question out loud, in English, Hindi, Marathi, or Kannada, and hear the answer back.',
    to: '/voice'
  },
  {
    eyebrow: 'Your Dashboard',
    title: 'Financial Health',
    description: 'A running view of your financial health score and recent guardian activity.',
    to: '/dashboard'
  }
]

function Home() {
  return (
    <div className="bg-amber-50">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <p className="text-xs uppercase tracking-widest text-teal-700 font-medium mb-6">
          Nomura KakushIN Hackathon 2026 · Team Dynamic Duo
        </p>

        <div className="flex items-center gap-2 mb-8">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-teal-700 guardian-dot"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-700"></span>
          </span>
          <span className="text-sm text-teal-800">Guardian Active — watching in the background</span>
        </div>

        <h1 className="font-display text-4xl sm:text-5xl text-slate-800 leading-tight mb-6 max-w-3xl">
          Every financial mistake happens at one unguarded moment of decision.
        </h1>

        <p className="text-slate-600 text-lg max-w-2xl mb-10 leading-relaxed">
          ArthaRakshak is a proactive AI guardian that watches for financial risk in the background
          and steps in at that exact moment — before the scam is clicked, before the predatory loan
          is signed, before the cash-flow crisis hits. It does not wait to be asked.
        </p>

        <div className="flex flex-wrap gap-3 mb-16">
          <Link
            to="/scam-check"
            className="bg-teal-700 text-white px-5 py-2.5 rounded-lg hover:bg-teal-800 transition"
          >
            Check a message
          </Link>
          <Link
            to="/voice"
            className="bg-white text-teal-700 border border-teal-200 px-5 py-2.5 rounded-lg hover:bg-teal-50 transition"
          >
            Try the voice assistant
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {FEATURES.map((feature) => (
            <Link
              key={feature.to}
              to={feature.to}
              className="block bg-white border border-gray-200 rounded-xl p-5 hover:border-teal-300 hover:shadow-sm transition"
            >
              <p className="text-xs uppercase tracking-wide text-teal-700 font-medium mb-2">
                {feature.eyebrow}
              </p>
              <p className="font-display text-xl text-slate-800 mb-1">{feature.title}</p>
              <p className="text-sm text-slate-500">{feature.description}</p>
            </Link>
          ))}
        </div>

        <p className="text-sm text-slate-400 mt-16">
          Built for Priya, Rajesh, Kisan, and Divya — and everyone like them.
        </p>
      </div>
    </div>
  )
}

export default Home