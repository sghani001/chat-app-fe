import { useState } from 'react'
import { apiJson } from '../lib/api'

function Sidebar({ user, channels, conversations, activeView, onSelectChannel, onSelectDM, onOpenSearch, onLogout, onChannelsChange, previews, highlights, unreadMessages }) {
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

  const sidebarItem = (key, icon, label, preview, isActive, unread, highlight, onClick) => (
    <button
      key={key}
      className={`sidebar-item ${isActive ? 'active' : ''} ${highlight ? 'highlight' : ''}`}
      onClick={onClick}
    >
      <span className="sidebar-item-icon">{icon}</span>
      <div className="sidebar-item-content">
        <span className="sidebar-item-label">{label}</span>
        {preview && <span className="sidebar-item-preview">{preview.user_name}: {preview.content}</span>}
      </div>
      {unread > 0 && <span className="unread-badge">{unread > 99 ? '99+' : unread}</span>}
    </button>
  )

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-logo">N</div>
        <div className="sidebar-brand-text">
          <span className="sidebar-brand-name">Nuro</span>
          <span className="sidebar-brand-version">v1.0.0</span>
        </div>
      </div>

      <div className="sidebar-section-header">Today</div>

      <nav className="sidebar-nav">
        {channels.map(ch => {
          const sk = `channel_${ch.id}`
          return sidebarItem(
            sk,
            '#',
            ch.name,
            previews?.[sk],
            activeView?.id === ch.id && activeView?.type === 'channel',
            unreadMessages?.[sk],
            highlights?.has(sk),
            () => onSelectChannel(ch)
          )
        })}
        {conversations.map(c => {
          const sk = `dm_${c.id}`
          return sidebarItem(
            sk,
            (c.other_user?.name || '?')[0].toUpperCase(),
            c.other_user?.name || 'Unknown',
            previews?.[sk],
            activeView?.id === c.id && activeView?.type === 'dm',
            unreadMessages?.[sk],
            highlights?.has(sk),
            () => onSelectDM(c)
          )
        })}
        <form className="sidebar-form" onSubmit={handleCreateChannel}>
          <input
            value={newChannelName}
            onChange={e => setNewChannelName(e.target.value)}
            placeholder="New channel..."
            disabled={creating}
          />
          <button type="submit" disabled={!newChannelName.trim() || creating}>+</button>
        </form>
      </nav>

      <div className="sidebar-bottom">
        <div className="sidebar-utility" onClick={onOpenSearch}>
          <span className="sidebar-utility-icon">+</span>
          New Channel / DM
        </div>
        <div className="sidebar-utility logout-btn" onClick={onLogout}>
          <span className="sidebar-utility-icon">&#10140;</span>
          Logout
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
