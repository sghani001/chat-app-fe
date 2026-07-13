import { useEffect, useRef } from 'react'

function highlightMentions(text) {
  const parts = text.split(/(@\w+)/g)
  return parts.map((part, i) => {
    if (part.startsWith('@') && part.length > 1) {
      return <span key={i} className="mention-highlight">{part}</span>
    }
    return part
  })
}

function MessageList({ messages, activeUser }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (messages.length === 0) {
    return (
      <div className="messages-container">
        <div className="empty-chat">
          <span className="empty-icon">&#128172;</span>
          <p>No messages yet</p>
        </div>
      </div>
    )
  }

  return (
    <div className="messages-container">
      {messages.map((m, i) => {
        const isMe = m.user?.id === activeUser?.id
        return (
          <div key={m.id ?? i} className={`message ${isMe ? 'own' : ''}`}>
            <div className="message-avatar" style={{ background: m.user?.avatar_color || 'linear-gradient(135deg, #2dd4bf, #3b82f6)' }}>
              {(m.user?.name || '?')[0].toUpperCase()}
            </div>
            <div className="message-bubble">
              {!isMe && <div className="message-sender">{m.user?.name}</div>}
              <div className="message-text">{highlightMentions(m.content)}</div>
              <div className="message-time">
                {m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
              </div>
            </div>
          </div>
        )
      })}
      <div ref={bottomRef} />
    </div>
  )
}

export default MessageList
