import { useState } from 'react'
import axios from 'axios'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

function CashFlowSimulator() {
  const [form, setForm] = useState({
    monthly_income: '',
    income_type: 'gig_worker',
    loan_amount: '',
    tenure_months: '',
    loan_interest_rate: 12,
    expected_sip_return_rate: 12
  })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const runSimulation = async () => {
    setLoading(true)
    setResult(null)
    try {
      const response = await axios.post('http://localhost:8000/api/simulate/loan', {
        monthly_income: parseFloat(form.monthly_income),
        income_type: form.income_type,
        loan_amount: parseFloat(form.loan_amount),
        tenure_months: parseInt(form.tenure_months),
        loan_interest_rate: parseFloat(form.loan_interest_rate),
        expected_sip_return_rate: parseFloat(form.expected_sip_return_rate)
      })
      setResult(response.data)
    } catch (error) {
      console.error(error)
    }
    setLoading(false)
  }

  const buildChartData = () => {
    if (!result) return []
    const loanSchedule = result.loan_path.schedule
    const sipSchedule = result.sip_path.schedule
    return loanSchedule.map((point, i) => ({
      month: point.month,
      loan_interest_paid: point.cumulative_interest_paid,
      sip_value: sipSchedule[i]?.value_so_far ?? 0
    }))
  }

  const isFormValid = form.monthly_income && form.loan_amount && form.tenure_months

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="font-display text-2xl text-slate-800 mb-2">Cash-Flow & Loan Decision Simulator</h1>
      <p className="text-gray-500 mb-6">See the real cost of a loan versus saving the same amount instead.</p>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Monthly Income (₹)</label>
          <input
            type="number"
            name="monthly_income"
            value={form.monthly_income}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-2"
            placeholder="e.g. 25000"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Income Type</label>
          <select
            name="income_type"
            value={form.income_type}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-2"
          >
            <option value="salaried">Salaried</option>
            <option value="gig_worker">Gig Worker</option>
            <option value="seasonal_farmer">Seasonal Farmer</option>
            <option value="business_owner">Business Owner</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Loan Amount (₹)</label>
          <input
            type="number"
            name="loan_amount"
            value={form.loan_amount}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-2"
            placeholder="e.g. 50000"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Tenure (months)</label>
          <input
            type="number"
            name="tenure_months"
            value={form.tenure_months}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-2"
            placeholder="e.g. 12"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Loan Interest Rate (% per year)</label>
          <input
            type="number"
            name="loan_interest_rate"
            value={form.loan_interest_rate}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-2"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Expected SIP Return (% per year)</label>
          <input
            type="number"
            name="expected_sip_return_rate"
            value={form.expected_sip_return_rate}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-2"
          />
        </div>
      </div>

      <button
        onClick={runSimulation}
        disabled={loading || !isFormValid}
        className="bg-teal-600 text-white px-6 py-2 rounded-lg disabled:opacity-50"
      >
        {loading ? 'Calculating...' : 'Compare My Options'}
      </button>

      {result && (
        <div className="mt-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-xl p-4">
              <p className="text-sm text-gray-500 mb-1">Take Loan</p>
              <p className="text-xl font-semibold text-gray-800">EMI: ₹{result.loan_path.emi}/mo</p>
              <p className="text-sm text-red-600 mt-1">Total interest: ₹{result.loan_path.total_interest}</p>
            </div>
            <div className="border border-gray-200 rounded-xl p-4">
              <p className="text-sm text-gray-500 mb-1">Save + SIP Instead</p>
              <p className="text-xl font-semibold text-gray-800">Final value: ₹{result.sip_path.final_value}</p>
              <p className="text-sm text-green-600 mt-1">Growth earned: ₹{result.sip_path.total_growth}</p>
            </div>
          </div>

          <div className="border border-gray-200 rounded-xl p-4">
            <p className="text-sm text-gray-500 mb-3">Cumulative interest paid (loan) vs. value grown (SIP), month by month</p>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={buildChartData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" label={{ value: 'Month', position: 'insideBottom', offset: -5 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="loan_interest_paid" name="Loan: interest paid" stroke="#ef4444" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="sip_value" name="SIP: value grown" stroke="#16a34a" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="border border-gray-200 rounded-xl p-4">
            <p className="text-sm text-gray-500 mb-2">What this means for you</p>
            <ul className="space-y-2 mb-3">
              {result.explanation.comparison_points.map((point, i) => (
                <li key={i} className="flex gap-2 text-gray-700">
                  <span className="text-gray-400">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-700">{result.explanation.recommendation}</p>
            </div>
          </div>

          {result.matched_schemes.length > 0 && (
            <div className="border border-gray-200 rounded-xl p-4">
              <p className="text-sm text-gray-500 mb-3">Government schemes you may be eligible for</p>
              <div className="space-y-3">
                {result.matched_schemes.map((scheme) => (
                  <div key={scheme.id} className="border-l-4 border-teal-600 pl-3">
                    <p className="font-medium text-gray-800">{scheme.name}</p>
                    <p className="text-sm text-gray-600">{scheme.description}</p>
                    <p className="text-sm text-teal-700 mt-1">{scheme.benefit}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default CashFlowSimulator