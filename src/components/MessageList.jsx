import { useEffect, useRef } from 'react'

function MessageList({ messages, activeUser }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (messages.length === 0) {
    return (
      <div className="chat-messages">
        <div className="empty-chat">
          <span className="empty-icon">&#128172;</span>
          <p>No messages yet</p>
        </div>
      </div>
    )
  }

  return (
    <div className="chat-messages">
      {messages.map((m, i) => {
        const isMe = m.user?.id === activeUser?.id
        return (
          <div key={m.id ?? i} className={`msg-row ${isMe ? 'msg-me' : ''}`}>
            {!isMe && (
              <div className="msg-avatar-wrap">
                <div className="msg-avatar" style={{ background: m.user?.avatar_color || '#14b8a6' }}>
                  {(m.user?.name || '?')[0].toUpperCase()}
                </div>
              </div>
            )}
            <div className="msg-content-col">
              {!isMe && <span className="msg-author">{m.user?.name}</span>}
              <div className={`msg-bubble ${isMe ? 'bubble-me' : 'bubble-other'}`}>
                {m.content}
              </div>
              <span className="msg-time">
                {m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
              </span>
            </div>
          </div>
        )
      })}
      <div ref={bottomRef} />
    </div>
  )
}

export default MessageList
