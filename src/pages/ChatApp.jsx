import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import Sidebar from '../components/Sidebar'
import ChannelView from '../components/ChannelView'
import DMView from '../components/DMView'
import NotificationBell from '../components/NotificationBell'
import UserSearchModal from '../components/UserSearchModal'
import { useCable } from '../hooks/useCable'
import { apiJson } from '../lib/api'

function keyFor(type, id) {
  if (!type) return null
  return `${type.toLowerCase() === 'channel' ? 'channel' : 'dm'}_${id}`
}

function ChatApp({ user, onLogout }) {
  const [channels, setChannels] = useState([])
  const [conversations, setConversations] = useState([])
  const [activeView, setActiveView] = useState(null)
  const [showSearch, setShowSearch] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [previews, setPreviews] = useState({})
  const [highlights, setHighlights] = useState(new Set())
  const [toasts, setToasts] = useState([])
  const [unreadMessages, setUnreadMessages] = useState({})
  const toastId = useRef(0)
  const { subscribe: cableSubscribe } = useCable()
  const cable = useMemo(() => ({ subscribe: cableSubscribe }), [cableSubscribe])

  const activeKey = activeView ? keyFor(activeView.type, activeView.id) : null

  const fetchChannels = useCallback(async () => {
    try {
      const data = await apiJson('/channels')
      setChannels(data)
      const p = {}
      for (const ch of data) {
        if (ch.last_message) p[`channel_${ch.id}`] = ch.last_message
      }
      setPreviews(prev => ({ ...prev, ...p }))
    } catch (_) {}
  }, [])

  const fetchConversations = useCallback(async () => {
    try {
      const data = await apiJson('/direct_conversations')
      setConversations(data)
      const p = {}
      for (const c of data) {
        if (c.last_message) p[`dm_${c.id}`] = c.last_message
      }
      setPreviews(prev => ({ ...prev, ...p }))
    } catch (_) {}
  }, [])

  useEffect(() => {
    fetchChannels()
    fetchConversations()
  }, [fetchChannels, fetchConversations])

  const addToast = useCallback((title, body, notifiableType, notifiableId) => {
    const id = ++toastId.current
    setToasts(prev => [...prev, { id, title, body, notifiableType, notifiableId }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 8000)
  }, [])

  const markRead = useCallback((streamKey) => {
    setHighlights(prev => { const next = new Set(prev); next.delete(streamKey); return next })
    setUnreadMessages(prev => { const next = { ...prev }; delete next[streamKey]; return next })
  }, [])

  const navigateFromNotification = useCallback((notifiableType, notifiableId) => {
    if (notifiableType === 'Channel') {
      const ch = channels.find(c => c.id === notifiableId)
      if (ch) setActiveView({ type: 'channel', id: ch.id, name: ch.name, channel: ch })
    } else {
      const convo = conversations.find(c => c.id === notifiableId)
      if (convo) setActiveView({ type: 'dm', id: convo.id, otherUser: convo.other_user })
    }
  }, [channels, conversations])

  const updatePreview = useCallback((streamKey, preview) => {
    setPreviews(prev => ({ ...prev, [streamKey]: preview }))
  }, [])

  const msgToPreview = useCallback((msg) => ({
    content: msg.content,
    user_name: msg.user?.name,
    created_at: msg.created_at,
    conversation_type: msg.conversation_type,
    conversation_id: msg.conversation_id
  }), [])

  useEffect(() => {
    const subId = JSON.stringify({ channel: 'UserChannel' })
    return cable.subscribe(subId, (msg) => {
      if (msg?.type === 'notification' && msg.notification) {
        setUnreadCount(msg.unread_count)
        const n = msg.notification
        if (n.notifiable_type && n.notifiable_id) {
          const sk = keyFor(n.notifiable_type, n.notifiable_id)
          if (sk !== activeKey) {
            addToast(n.title, n.body, n.notifiable_type, n.notifiable_id)
            setHighlights(prev => new Set(prev).add(sk))
            setUnreadMessages(prev => ({ ...prev, [sk]: (prev[sk] || 0) + 1 }))
            setPreviews(p => ({ ...p, [sk]: { content: n.body, user_name: n.title.split(' in ')[0] || '', conversation_type: n.notifiable_type, conversation_id: n.notifiable_id } }))
          }
        }
      }
    })
  }, [cable, addToast, activeKey])

  const handleSelectChannel = useCallback((channel) => {
    const sk = `channel_${channel.id}`
    markRead(sk)
    setActiveView({ type: 'channel', id: channel.id, name: channel.name, channel })
  }, [markRead])

  const handleSelectDM = useCallback((convo) => {
    const sk = `dm_${convo.id}`
    markRead(sk)
    setActiveView({ type: 'dm', id: convo.id, otherUser: convo.other_user })
  }, [markRead])

  const handleStartDM = async (otherUser) => {
    try {
      const convo = await apiJson('/direct_conversations', {
        method: 'POST',
        body: JSON.stringify({ user_id: otherUser.id })
      })
      setConversations(prev => prev.some(c => c.id === convo.id) ? prev : [...prev, convo])
      handleSelectDM(convo)
      setShowSearch(false)
    } catch (_) {}
  }

  const handleNotificationUpdate = (count) => {
    setUnreadCount(count)
  }

  const handleMessageFromView = useCallback((msg) => {
    const sk = keyFor(msg.conversation_type, msg.conversation_id)
    if (!sk) return
    updatePreview(sk, msgToPreview(msg))
    if (sk !== activeKey) {
      setHighlights(prev => new Set(prev).add(sk))
      setUnreadMessages(prev => ({ ...prev, [sk]: (prev[sk] || 0) + 1 }))
    }
  }, [activeKey, updatePreview, msgToPreview])

  return (
    <div className="app">
      <Sidebar
        user={user}
        channels={channels}
        conversations={conversations}
        activeView={activeView}
        previews={previews}
        highlights={highlights}
        unreadMessages={unreadMessages}
        onSelectChannel={handleSelectChannel}
        onSelectDM={handleSelectDM}
        onOpenSearch={() => setShowSearch(true)}
        onLogout={onLogout}
        unreadCount={unreadCount}
        onChannelsChange={fetchChannels}
      />

      <main className="main">
        {activeView?.type === 'channel' ? (
          <ChannelView
            key={`ch-${activeView.id}`}
            channelId={activeView.id}
            channelName={activeView.name}
            user={user}
            cable={cable}
            onMessage={handleMessageFromView}
          />
        ) : activeView?.type === 'dm' ? (
          <DMView
            key={`dm-${activeView.id}`}
            conversationId={activeView.id}
            otherUser={activeView.otherUser}
            user={user}
            cable={cable}
            onMessage={handleMessageFromView}
          />
        ) : (
          <div className="welcome">
            <div className="welcome-glyph">&#128172;</div>
            <h2>Welcome, {user.name}</h2>
            <p>Select a channel or DM to start chatting</p>
          </div>
        )}

        <div className="aws-bar">
          <span className="aws-bar-label">AWS Services</span>
          <div className="aws-services">
            <div className="aws-service">
              <span className="aws-service-dot" />
              RDS PostgreSQL
            </div>
            <div className="aws-service">
              <span className="aws-service-dot mock" />
              SNS Notifications (mock)
            </div>
            <div className="aws-service">
              <span className="aws-service-dot mock" />
              DynamoDB Archive (mock)
            </div>
          </div>
        </div>
      </main>

      <NotificationBell
        user={user}
        onNotificationUpdate={handleNotificationUpdate}
        onNavigate={navigateFromNotification}
      />

      {showSearch && (
        <UserSearchModal
          user={user}
          onSelect={handleStartDM}
          onClose={() => setShowSearch(false)}
        />
      )}

      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className="toast" onClick={() => { navigateFromNotification(t.notifiableType, t.notifiableId); setToasts(prev => prev.filter(x => x.id !== t.id)) }}>
            <div className="toast-title">{t.title}</div>
            <div className="toast-body">{t.body}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ChatApp
