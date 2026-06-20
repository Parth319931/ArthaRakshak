import { useState, useEffect } from 'react'
import axios from 'axios'

const SEVERITY_STYLES = {
  danger: 'bg-rose-50 border-rose-200 text-rose-800',
  warning: 'bg-amber-50 border-amber-200 text-amber-800',
  info: 'bg-teal-50 border-teal-200 text-teal-800'
}

function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [simulating, setSimulating] = useState(false)

  const fetchSummary = async () => {
    setLoading(true)
    try {
      const response = await axios.get('http://localhost:8000/api/dashboard/summary')
      setSummary(response.data)
    } catch (error) {
      console.error(error)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchSummary()
  }, [])

  const simulateNextCycle = async () => {
    setSimulating(true)
    try {
      await axios.post('http://localhost:8000/api/dashboard/simulate-cycle')
      await fetchSummary()
    } catch (error) {
      console.error(error)
    }
    setSimulating(false)
  }

  if (loading) {
    return <div className="max-w-3xl mx-auto p-6 text-gray-500">Loading dashboard...</div>
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="font-display text-2xl text-slate-800 mb-2">Your Financial Dashboard</h1>
      <p className="text-gray-500 mb-8">A running view of your financial health and guardian activity.</p>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <div className="border border-gray-200 rounded-xl p-5">
          <p className="text-sm text-gray-500 mb-1">Financial Health Score</p>
          <p className="text-4xl font-display text-teal-700">{summary.health_score}</p>
        </div>
        <div className="border border-gray-200 rounded-xl p-5">
          <p className="text-sm text-gray-500 mb-1">Scam Checks Run</p>
          <p className="text-4xl font-display text-slate-800">{summary.total_scam_checks}</p>
        </div>
        <div className="border border-gray-200 rounded-xl p-5">
          <p className="text-sm text-gray-500 mb-1">Simulations Run</p>
          <p className="text-4xl font-display text-slate-800">{summary.total_simulations}</p>
        </div>
      </div>

      <div className="border border-gray-200 rounded-xl p-5 mb-8">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-gray-500">Proactive Guardian Alerts</p>
          <button
            onClick={simulateNextCycle}
            disabled={simulating}
            className="bg-teal-700 text-white text-sm px-4 py-2 rounded-lg disabled:opacity-50"
          >
            {simulating ? 'Checking signals...' : 'Simulate Next Cycle'}
          </button>
        </div>

        {summary.recent_alerts.length === 0 ? (
          <p className="text-sm text-gray-400">No alerts yet. Run a cycle to see how ArthaRakshak proactively reaches out.</p>
        ) : (
          summary.recent_alerts.map((alert, i) => (
            <div key={i} className={`border rounded-lg p-3 mb-2 ${SEVERITY_STYLES[alert.severity]}`}>
              <p className="text-sm">{alert.message}</p>
            </div>
          ))
        )}
      </div>

      <div className="border border-gray-200 rounded-xl p-5">
        <p className="text-sm text-gray-500 mb-3">Recent Activity</p>
        {summary.recent_activity.length === 0 ? (
          <p className="text-sm text-gray-400">No activity yet. Try the Scam Check or Cash-Flow Simulator.</p>
        ) : (
          <ul className="space-y-2">
            {summary.recent_activity.map((item, i) => (
              <li key={i} className="text-sm text-gray-700 flex justify-between">
                <span>{item.summary}</span>
                <span className="text-gray-400">{new Date(item.created_at).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default Dashboard