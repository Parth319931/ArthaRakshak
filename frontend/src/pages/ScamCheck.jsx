import { useState } from 'react'
import axios from 'axios'

function ScamCheck() {
  const [mode, setMode] = useState('text')
  const [text, setText] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleImageSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const checkText = async () => {
    setLoading(true)
    setResult(null)
    try {
      const response = await axios.post('http://localhost:8000/api/scam/check-text', {
        message: text
      })
      setResult(response.data)
    } catch (error) {
      console.error(error)
    }
    setLoading(false)
  }

  const checkImage = async () => {
    if (!imageFile) return
    setLoading(true)
    setResult(null)
    try {
      const formData = new FormData()
      formData.append('file', imageFile)
      const response = await axios.post('http://localhost:8000/api/scam/check-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setResult(response.data)
    } catch (error) {
      console.error(error)
    }
    setLoading(false)
  }

  const getScoreColor = (score) => {
    if (score >= 66) return 'bg-red-500'
    if (score >= 31) return 'bg-amber-500'
    return 'bg-green-500'
  }

  const getVerdictBadge = (verdict) => {
    if (verdict === 'SCAM') return 'bg-red-100 text-red-800'
    if (verdict === 'SUSPICIOUS') return 'bg-amber-100 text-amber-800'
    return 'bg-green-100 text-green-800'
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-2">Scam Check</h1>
      <p className="text-gray-500 mb-6">Paste a suspicious message or upload a screenshot to check if it's a scam.</p>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setMode('text')}
          className={`px-4 py-2 rounded-lg ${mode === 'text' ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-600'}`}
        >
          Paste Text
        </button>
        <button
          onClick={() => setMode('image')}
          className={`px-4 py-2 rounded-lg ${mode === 'image' ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-600'}`}
        >
          Upload Screenshot
        </button>
      </div>

      {mode === 'text' && (
        <div>
          <textarea
            className="w-full border border-gray-300 rounded-lg p-3 mb-3"
            rows="5"
            placeholder="Paste the suspicious message here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button
            onClick={checkText}
            disabled={loading || !text}
            className="bg-teal-600 text-white px-6 py-2 rounded-lg disabled:opacity-50"
          >
            {loading ? 'Analyzing...' : 'Check for Scam'}
          </button>
        </div>
      )}

      {mode === 'image' && (
        <div>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="mb-3 block"
          />
          {imagePreview && (
            <img src={imagePreview} alt="preview" className="max-w-xs rounded-lg mb-3 border border-gray-200" />
          )}
          <button
            onClick={checkImage}
            disabled={loading || !imageFile}
            className="bg-teal-600 text-white px-6 py-2 rounded-lg disabled:opacity-50 block"
          >
            {loading ? 'Scanning...' : 'Check for Scam'}
          </button>
        </div>
      )}

      {result && (
        <div className="mt-8 border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getVerdictBadge(result.verdict)}`}>
              {result.verdict}
            </span>
            <span className="text-3xl font-semibold text-gray-800">{result.scam_score}%</span>
          </div>

          <div className="w-full bg-gray-100 rounded-full h-3 mb-4">
            <div
              className={`h-3 rounded-full ${getScoreColor(result.scam_score)}`}
              style={{ width: `${result.scam_score}%` }}
            />
          </div>

          {result.pattern_name && result.pattern_name !== 'None' && (
            <p className="text-sm text-gray-500 mb-3">
              Pattern detected: <span className="font-medium text-gray-700">{result.pattern_name}</span>
            </p>
          )}

          <ul className="space-y-2 mb-4">
            {result.reasons && result.reasons.map((reason, i) => (
              <li key={i} className="flex gap-2 text-gray-700">
                <span className="text-gray-400">•</span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>

          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-700">{result.advice}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default ScamCheck