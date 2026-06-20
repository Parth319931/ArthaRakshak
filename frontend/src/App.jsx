import { useState } from 'react'
import axios from 'axios'

function App() {
  const [message, setMessage] = useState('')
  const [reply, setReply] = useState('')
  const [loading, setLoading] = useState(false)

  const sendMessage = async () => {
    setLoading(true)
    try {
      const response = await axios.post('http://localhost:8000/api/chat', {
        message: message
      })
      setReply(response.data.reply)
    } catch (error) {
      setReply('Error: could not reach the server')
      console.error(error)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">
        ArthaRakshak — connection test
      </h1>

      <textarea
        className="w-full max-w-md border border-gray-300 rounded-lg p-3 mb-3"
        rows="3"
        placeholder="Ask something, e.g. How do I save money on irregular income?"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      <button
        onClick={sendMessage}
        disabled={loading || !message}
        className="bg-teal-600 text-white px-6 py-2 rounded-lg disabled:opacity-50"
      >
        {loading ? 'Thinking...' : 'Send'}
      </button>

      {reply && (
        <div className="w-full max-w-md mt-6 bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-500 mb-1">ArthaRakshak says:</p>
          <p className="text-gray-800">{reply}</p>
        </div>
      )}
    </div>
  )
}

export default App