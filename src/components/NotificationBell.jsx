import { useState, useEffect, useRef } from 'react'
import { apiJson } from '../lib/api'

function NotificationBell({ user, onNotificationUpdate, onNavigate }) {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unread, setUnread] = useState(0)
  const ref = useRef(null)

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const fetchNotifs = async () => {
    try {
      const data = await apiJson('/notifications')
      setNotifications(data.notifications || [])
      setUnread(data.unread_count || 0)
      onNotificationUpdate(data.unread_count || 0)
    } catch (_) {}
  }

  useEffect(() => {
    if (!user) return
    fetchNotifs()
    const interval = setInterval(fetchNotifs, 15000)
    return () => clearInterval(interval)
  }, [user])

  const handleMarkRead = async (id) => {
    try {
      await apiJson(`/notifications/${id}/mark_read`, { method: 'PATCH' })
      fetchNotifs()
    } catch (_) {}
  }

  const handleMarkAllRead = async () => {
    try {
      await apiJson('/notifications/mark_all_read', { method: 'POST' })
      fetchNotifs()
    } catch (_) {}
  }

  return (
    <div className="notif-bell-container" ref={ref}>
      <button className="notif-bell" onClick={() => { setOpen(!open); if (!open) fetchNotifs() }}>
        <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
          <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6981 21.5547 10.4458 21.3031 10.27 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        {unread > 0 && <span className="notif-badge">{unread > 99 ? '99+' : unread}</span>}
      </button>

      {open && (
        <div className="notif-dropdown">
          <div className="notif-dropdown-header">
            <span>Notifications</span>
            {unread > 0 && (
              <button className="notif-mark-all" onClick={handleMarkAllRead}>Mark all read</button>
            )}
          </div>
          <div className="notif-dropdown-body">
            {notifications.length === 0 ? (
              <div className="notif-empty">No notifications</div>
            ) : notifications.map(n => (
              <div
                key={n.id}
                className={`notif-item ${n.read ? '' : 'unread'}`}
                onClick={() => {
                  if (!n.read) handleMarkRead(n.id)
                  if (onNavigate && n.notifiable_type && n.notifiable_id) onNavigate(n.notifiable_type, n.notifiable_id)
                }}
              >
                <div className="notif-item-title">{n.title}</div>
                <div className="notif-item-body">{n.body}</div>
                <div className="notif-item-time">
                  {new Date(n.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationBell
