import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import ScamCheck from './pages/ScamCheck'
import CashFlowSimulator from './pages/CashFlowSimulator'
import VoiceAssistant from './pages/VoiceAssistant'
import Dashboard from './pages/Dashboard'

const NAV_LINKS = [
  { to: '/scam-check', label: 'Scam Check' },
  { to: '/cash-flow', label: 'Cash-Flow Simulator' },
  { to: '/voice', label: 'Voice Assistant' },
  { to: '/dashboard', label: 'Dashboard' }
]

function Nav() {
  const location = useLocation()

  return (
    <nav className="sticky top-0 bg-white/90 backdrop-blur border-b border-gray-200 px-6 py-4 flex items-center gap-6 z-10">
      <Link to="/" className="font-display text-lg text-teal-800">ArthaRakshak</Link>
      <div className="flex gap-5">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`text-sm ${
              location.pathname === link.to
                ? 'text-teal-700 font-medium'
                : 'text-gray-500 hover:text-teal-700'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/scam-check" element={<ScamCheck />} />
        <Route path="/cash-flow" element={<CashFlowSimulator />} />
        <Route path="/voice" element={<VoiceAssistant />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App