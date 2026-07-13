import { useState, useEffect, useRef, useCallback } from 'react'
import { apiJson } from '../lib/api'

function MessageInput({ placeholder, onSend, currentUserId }) {
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [users, setUsers] = useState([])
  const [mentionOpen, setMentionOpen] = useState(false)
  const [mentionQuery, setMentionQuery] = useState('')
  const [mentionIndex, setMentionIndex] = useState(0)
  const [cursorPos, setCursorPos] = useState(0)
  const inputRef = useRef(null)
  const dropdownRef = useRef(null)

  useEffect(() => { apiJson('/users').then(setUsers).catch(() => {}) }, [])

  const filtered = users.filter(u => u.id !== currentUserId).filter(u =>
    u.name.toLowerCase().includes(mentionQuery.toLowerCase()) ||
    (u.username || '').toLowerCase().includes(mentionQuery.toLowerCase())
  )

  const handleChange = useCallback((e) => {
    const val = e.target.value
    const pos = e.target.selectionStart
    setInput(val)
    setCursorPos(pos)

    const before = val.slice(0, pos)
    const atIdx = before.lastIndexOf('@')
    if (atIdx !== -1 && (atIdx === 0 || before[atIdx - 1] === ' ')) {
      const query = before.slice(atIdx + 1)
      if (!query.includes(' ') && query.length >= 0) {
        setMentionQuery(query)
        setMentionOpen(true)
        setMentionIndex(0)
        return
      }
    }
    setMentionOpen(false)
  }, [])

  const insertMention = useCallback((user) => {
    const before = input.slice(0, cursorPos)
    const atIdx = before.lastIndexOf('@')
    const after = input.slice(cursorPos)
    const newVal = before.slice(0, atIdx) + '@' + user.username + ' ' + after
    setInput(newVal)
    setMentionOpen(false)
    setTimeout(() => {
      if (inputRef.current) {
        const pos = atIdx + user.username.length + 2
        inputRef.current.setSelectionRange(pos, pos)
        inputRef.current.focus()
      }
    }, 0)
  }, [input, cursorPos])

  const handleKeyDown = (e) => {
    if (!mentionOpen || filtered.length === 0) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setMentionIndex(i => Math.min(i + 1, filtered.length - 1)); return }
    if (e.key === 'ArrowUp') { e.preventDefault(); setMentionIndex(i => Math.max(i - 1, 0)); return }
    if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); insertMention(filtered[mentionIndex]); return }
    if (e.key === 'Escape') { setMentionOpen(false); return }
  }

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target) && e.target !== inputRef.current) {
        setMentionOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

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
      <div className="message-input-belt" style={{ position: 'relative' }}>
        <input
          ref={inputRef}
          value={input}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={() => setTimeout(() => setMentionOpen(false), 200)}
          placeholder={placeholder}
          autoFocus
        />
        <button className="send-btn" type="submit" disabled={!input.trim() || sending}>
          <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
            <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        {mentionOpen && filtered.length > 0 && (
          <div className="mention-dropdown" ref={dropdownRef}>
            {filtered.map((u, i) => (
              <div
                key={u.id}
                className={`mention-item ${i === mentionIndex ? 'active' : ''}`}
                onMouseDown={(e) => { e.preventDefault(); insertMention(u) }}
              >
                <div className="mention-avatar" style={{ background: u.avatar_color || '#2dd4bf' }}>
                  {u.name[0].toUpperCase()}
                </div>
                <div className="mention-info">
                  <span className="mention-name">{u.name}</span>
                  <span className="mention-username">@{u.username}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </form>
  )
}

export default MessageInput
