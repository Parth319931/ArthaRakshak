import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import ScamCheck from './pages/ScamCheck'
import CashFlowSimulator from './pages/CashFlowSimulator'

function Home() {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-semibold text-gray-800">ArthaRakshak</h1>
      <p className="text-gray-500 mt-2">Your proactive financial guardian AI</p>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex gap-6">
        <Link to="/" className="font-semibold text-teal-700">ArthaRakshak</Link>
        <Link to="/scam-check" className="text-gray-600 hover:text-teal-700">Scam Check</Link>
        <Link to="/cash-flow" className="text-gray-600 hover:text-teal-700">Cash-Flow Simulator</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/scam-check" element={<ScamCheck />} />
        <Route path="/cash-flow" element={<CashFlowSimulator />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App