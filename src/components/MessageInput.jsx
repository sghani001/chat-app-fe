import { useState } from 'react'

function MessageInput({ placeholder, onSend }) {
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim() || sending) return
    const text = input.trim()
    setInput('')
    setSending(true)
    try {
      await onSend(text)
    } finally {
      setSending(false)
    }
  }

  return (
    <form className="message-input-wrapper" onSubmit={handleSubmit}>
      <div className="message-input-belt">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={placeholder}
          autoFocus
        />
        <button className="send-btn" type="submit" disabled={!input.trim() || sending}>
          <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
            <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </form>
  )
}

export default MessageInput
