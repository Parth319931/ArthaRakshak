import { useState, useRef } from 'react'
import axios from 'axios'
import { isSpeechRecognitionSupported, startListening, speakText, stopSpeaking } from '../utils/voice'

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिंदी (Hindi)' },
  { code: 'mr', label: 'मराठी (Marathi)' },
  { code: 'kn', label: 'ಕನ್ನಡ (Kannada)' }
]

function VoiceAssistant() {
  const [language, setLanguage] = useState('en')
  const [transcript, setTranscript] = useState('')
  const [typedMessage, setTypedMessage] = useState('')
  const [reply, setReply] = useState('')
  const [listening, setListening] = useState(false)
  const [loading, setLoading] = useState(false)
  const [speechSupported] = useState(isSpeechRecognitionSupported())
  const recognitionRef = useRef(null)

  const handleMicClick = () => {
    if (listening) {
      recognitionRef.current?.stop()
      setListening(false)
      return
    }

    setTranscript('')
    setListening(true)

    recognitionRef.current = startListening(
      language,
      (result) => {
        setTranscript(result)
        setListening(false)
        sendMessage(result)
      },
      (error) => {
        console.error(error)
        setListening(false)
      }
    )
  }

  const sendMessage = async (message) => {
    if (!message) return
    setLoading(true)
    setReply('')
    stopSpeaking()
    try {
      const response = await axios.post('http://localhost:8000/api/chat', {
        message,
        language
      })
      setReply(response.data.reply)
      speakText(response.data.reply, language)
    } catch (error) {
      console.error(error)
    }
    setLoading(false)
  }

  const handleTypedSubmit = () => {
    setTranscript(typedMessage)
    sendMessage(typedMessage)
    setTypedMessage('')
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-2">Voice Assistant</h1>
      <p className="text-gray-500 mb-6">Ask a financial question by voice or text, in your own language.</p>

      <div className="mb-4">
        <label className="block text-sm text-gray-600 mb-1">Language</label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-2"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>{lang.label}</option>
          ))}
        </select>
      </div>

      {speechSupported ? (
        <div className="flex flex-col items-center mb-6">
          <button
            onClick={handleMicClick}
            className={`w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl ${
              listening ? 'bg-red-500 animate-pulse' : 'bg-teal-600'
            }`}
          >
            🎤
          </button>
          <p className="text-sm text-gray-500 mt-2">
            {listening ? 'Listening...' : 'Tap to speak'}
          </p>
        </div>
      ) : (
        <p className="text-sm text-amber-600 bg-amber-50 rounded-lg p-3 mb-4">
          Voice input isn't supported in this browser. Please use Chrome, or type your question below.
        </p>
      )}

      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={typedMessage}
          onChange={(e) => setTypedMessage(e.target.value)}
          placeholder="Or type your question here..."
          className="flex-1 border border-gray-300 rounded-lg p-2"
          onKeyDown={(e) => e.key === 'Enter' && handleTypedSubmit()}
        />
        <button
          onClick={handleTypedSubmit}
          disabled={!typedMessage || loading}
          className="bg-teal-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
        >
          Send
        </button>
      </div>

      {transcript && (
        <div className="mb-4 bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-1">You said:</p>
          <p className="text-gray-700">{transcript}</p>
        </div>
      )}

      {loading && (
        <p className="text-gray-500">Thinking...</p>
      )}

      {reply && (
        <div className="border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-400">ArthaRakshak says:</p>
            <button
              onClick={() => speakText(reply, language)}
              className="text-teal-600 text-sm"
            >
              🔊 Replay
            </button>
          </div>
          <p className="text-gray-800">{reply}</p>
        </div>
      )}
    </div>
  )
}

export default VoiceAssistant