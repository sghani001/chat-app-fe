import { useState } from 'react'
import { apiJson } from '../lib/api'

function Sidebar({ user, channels, conversations, activeView, onSelectChannel, onSelectDM, onOpenSearch, onLogout, unreadCount, onChannelsChange, previews, highlights, unreadMessages }) {
  const [newChannelName, setNewChannelName] = useState('')
  const [creating, setCreating] = useState(false)

  const handleCreateChannel = async (e) => {
    e.preventDefault()
    if (!newChannelName.trim()) return
    setCreating(true)
    try {
      const channel = await apiJson('/channels', {
        method: 'POST',
        body: JSON.stringify({ name: newChannelName.trim() })
      })
      onChannelsChange()
      onSelectChannel(channel)
      setNewChannelName('')
    } catch (_) {}
    setCreating(false)
  }

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon">&#9889;</div>
        <h1>LiveChat</h1>
        <span>AWS</span>
      </div>

      <div className="sidebar-inner">
        <div className="sidebar-section">
          <div className="section-header">
            <div className="user-card-mini" onClick={onOpenSearch}>
              <div className="user-avatar-sm" style={{ background: user.avatar_color || '#14b8a6' }}>
                {user.name[0].toUpperCase()}
              </div>
              <div className="user-meta">
                <span className="user-display-name">{user.name}</span>
                <span className="user-handle">@{user.username}</span>
              </div>
            </div>
            <button className="icon-btn" onClick={onLogout} title="Logout">
              <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
                <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="sidebar-divider" />

        <div className="sidebar-section">
          <div className="section-label-row">
            <span className="section-label">Channels</span>
            <span className="section-count">{channels.length}</span>
          </div>
          <div className="channel-list">
            {channels.map(ch => {
              const sk = `channel_${ch.id}`
              const prv = previews?.[sk]
              const isActive = activeView?.id === ch.id && activeView?.type === 'channel'
              const unread = unreadMessages?.[sk]
              return (
                <button
                  key={ch.id}
                  className={`sidebar-item ${isActive ? 'active' : ''} ${highlights?.has(sk) ? 'highlight' : ''}`}
                  onClick={() => onSelectChannel(ch)}
                >
                  <span className="sidebar-item-icon">#</span>
                  <div className="sidebar-item-text">
                    <span className="sidebar-item-name">{ch.name}</span>
                    {prv && <span className="sidebar-item-preview">{prv.user_name}: {prv.content}</span>}
                  </div>
                  {unread > 0 && <span className="sidebar-badge">{unread > 99 ? '99+' : unread}</span>}
                </button>
              )
            })}
          </div>
          <form className="sidebar-form" onSubmit={handleCreateChannel}>
            <input
              value={newChannelName}
              onChange={e => setNewChannelName(e.target.value)}
              placeholder="New channel..."
              disabled={creating}
            />
            <button type="submit" disabled={!newChannelName.trim() || creating}>+</button>
          </form>
        </div>

        <div className="sidebar-divider" />

        <div className="sidebar-section">
          <div className="section-label-row">
            <span className="section-label">Direct Messages</span>
            <button className="icon-btn" onClick={onOpenSearch} title="New DM">
              <svg viewBox="0 0 24 24" fill="none" width="14" height="14">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
          <div className="channel-list">
            {conversations.map(c => {
              const sk = `dm_${c.id}`
              const prv = previews?.[sk]
              const isActive = activeView?.id === c.id && activeView?.type === 'dm'
              const unread = unreadMessages?.[sk]
              return (
                <button
                  key={c.id}
                  className={`sidebar-item ${isActive ? 'active' : ''} ${highlights?.has(sk) ? 'highlight' : ''}`}
                  onClick={() => onSelectDM(c)}
                >
                  <div className="dm-avatar" style={{ background: c.other_user?.avatar_color || '#8b5cf6' }}>
                    {(c.other_user?.name || '?')[0].toUpperCase()}
                  </div>
                  <div className="sidebar-item-text">
                    <span className="sidebar-item-name">{c.other_user?.name || 'Unknown'}</span>
                    {prv && <span className="sidebar-item-preview">{prv.user_name}: {prv.content}</span>}
                  </div>
                  {unread > 0 && <span className="sidebar-badge">{unread > 99 ? '99+' : unread}</span>}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
