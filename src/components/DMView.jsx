import { useState, useEffect } from 'react'
import MessageList from './MessageList'
import MessageInput from './MessageInput'
import { apiJson } from '../lib/api'

function DMView({ conversationId, otherUser, user, cable, onMessage }) {
  const [messages, setMessages] = useState([])

  useEffect(() => {
    if (!conversationId) return
    setMessages([])
    apiJson(`/direct_conversations/${conversationId}/messages`).then(setMessages).catch(() => {})
  }, [conversationId])

  useEffect(() => {
    if (!conversationId) return
    const id = JSON.stringify({ channel: 'RoomChannel', stream_key: `dm_${conversationId}` })
    return cable.subscribe(id, (msg) => {
      if (msg?.type === 'message') {
        setMessages(prev => prev.some(x => x.id === msg.message.id) ? prev : [...prev, msg.message])
        if (onMessage) onMessage(msg.message)
      }
    })
  }, [conversationId, cable, onMessage])

  const handleSend = async (content) => {
    const msg = await apiJson(`/direct_conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content })
    })
    setMessages(prev => prev.some(x => x.id === msg.id) ? prev : [...prev, msg])
  }

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <div className="chat-header-left">
          <div className="dm-avatar-sm" style={{ background: otherUser?.avatar_color || '#8b5cf6' }}>
            {(otherUser?.name || '?')[0].toUpperCase()}
          </div>
          <span className="chat-room-name">{otherUser?.name}</span>
          <span className="chat-subtitle">Direct Message</span>
        </div>
      </div>
      <MessageList messages={messages} activeUser={user} />
      <MessageInput placeholder={`Message @${otherUser?.name}...`} onSend={handleSend} />
    </div>
  )
}

export default DMView
