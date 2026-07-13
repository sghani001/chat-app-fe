import { useState, useEffect } from 'react'
import MessageList from './MessageList'
import MessageInput from './MessageInput'
import { apiJson } from '../lib/api'

function ChannelView({ channelId, channelName, user, cable, onMessage }) {
  const [messages, setMessages] = useState([])

  useEffect(() => {
    if (!channelId) return
    setMessages([])
    apiJson(`/channels/${channelId}/messages`).then(setMessages).catch(() => {})
  }, [channelId])

  useEffect(() => {
    if (!channelId) return
    const id = JSON.stringify({ channel: 'RoomChannel', stream_key: `channel_${channelId}` })
    return cable.subscribe(id, (msg) => {
      if (msg?.type === 'message') {
        setMessages(prev => prev.some(x => x.id === msg.message.id) ? prev : [...prev, msg.message])
        if (onMessage) onMessage(msg.message)
      }
    })
  }, [channelId, cable, onMessage])

  const handleSend = async (content) => {
    const msg = await apiJson(`/channels/${channelId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content })
    })
    setMessages(prev => prev.some(x => x.id === msg.id) ? prev : [...prev, msg])
  }

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <div className="chat-header-left">
          <span className="chat-hash">#</span>
          <span className="chat-room-name">{channelName}</span>
          <span className="chat-subtitle">Channel</span>
        </div>
      </div>
      <MessageList messages={messages} activeUser={user} />
      <MessageInput placeholder={`Message #${channelName}...`} onSend={handleSend} />
    </div>
  )
}

export default ChannelView
