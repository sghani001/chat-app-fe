function WelcomeScreen({ user }) {
  const features = [
    { icon: '#', color: 'teal', text: 'Channel Conversations', desc: 'Group discussions by topic' },
    { icon: '@', color: 'blue', text: 'Direct Messages', desc: 'Private one-on-one chats' },
    { icon: '!', color: 'teal', text: 'Real-time Notifications', desc: 'Instant alerts via WebSocket' },
    { icon: '~', color: 'blue', text: 'Unread Tracking', desc: 'Badges & highlights for new messages' },
  ]

  return (
    <div className="welcome-screen">
      <div className="welcome-logo">V</div>
      <h1>Welcome back, {user.name}</h1>
      <p className="welcome-sub">Select a conversation to start chatting</p>
      <div className="welcome-features">
        {features.map((f, i) => (
          <div key={i} className="welcome-feature-row">
            <div className={`welcome-feature-icon ${f.color}`}>{f.icon}</div>
            <div>
              <div className="welcome-feature-text">{f.text}</div>
              <div className="welcome-feature-desc">{f.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default WelcomeScreen
