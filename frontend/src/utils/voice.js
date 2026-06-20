// Browser-native Speech Recognition (STT) and Speech Synthesis (TTS) helpers.
// Using browser-native Web Speech API instead of Bhashini for the live hackathon build —
// zero setup, zero API cost. Bhashini integration (22 languages, better accuracy) is the
// documented production roadmap, shown on the architecture slide only.

const LANGUAGE_TAGS = {
  en: 'en-IN',
  hi: 'hi-IN',
  mr: 'mr-IN',
  kn: 'kn-IN'
}

export function isSpeechRecognitionSupported() {
  return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window
}

export function startListening(languageCode, onResult, onError) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  if (!SpeechRecognition) {
    onError('Speech recognition is not supported in this browser. Please use Chrome or type instead.')
    return null
  }

  const recognition = new SpeechRecognition()
  recognition.lang = LANGUAGE_TAGS[languageCode] || 'en-IN'
  recognition.continuous = false
  recognition.interimResults = false
  recognition.maxAlternatives = 1

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript
    onResult(transcript)
  }

  recognition.onerror = (event) => {
    onError(event.error)
  }

  recognition.start()
  return recognition
}

export function speakText(text, languageCode) {
  if (!('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported in this browser.')
    return
  }

  window.speechSynthesis.cancel()

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = LANGUAGE_TAGS[languageCode] || 'en-IN'
  utterance.rate = 0.95

  window.speechSynthesis.speak(utterance)
}

export function stopSpeaking() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel()
  }
}