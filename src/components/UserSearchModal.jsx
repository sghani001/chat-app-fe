import { useState, useEffect } from 'react'
import { apiJson } from '../lib/api'

function UserSearchModal({ user, onSelect, onClose }) {
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    apiJson('/users').then(setUsers).catch(() => {})
  }, [])

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    (u.username || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>New Message</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          <input
            className="modal-search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search users..."
            autoFocus
          />

          <div className="modal-user-list">
            {filtered.map(u => (
              <button
                key={u.id}
                className="modal-user-item"
                onClick={() => onSelect(u)}
              >
                <div className="modal-user-avatar" style={{ background: u.avatar_color || '#14b8a6' }}>
                  {u.name[0].toUpperCase()}
                </div>
                <div className="modal-user-info">
                  <span className="modal-user-name">{u.name}</span>
                  <span className="modal-user-handle">@{u.username}</span>
                </div>
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="modal-empty">No users found</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserSearchModal
