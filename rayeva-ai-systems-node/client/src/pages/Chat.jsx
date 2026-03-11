import { useState, useEffect, useRef } from 'react'
import { api } from '../api'

const QUICK_MSGS = [
  { label: 'Track Order', msg: 'Where is my order ORD-12345?' },
  { label: 'Returns', msg: 'How do I return a product?' },
  { label: 'Complaint', msg: 'I received a damaged item' },
  { label: 'Recommendations', msg: 'Recommend some sustainable products' },
  { label: 'General', msg: 'Hi, what can you help me with?' },
]

export default function Chat() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversations, setConversations] = useState([])
  const sessionId = useRef('session-' + Math.random().toString(36).slice(2, 11))
  const chatEndRef = useRef(null)

  const loadConversations = async () => {
    try {
      const data = await api('GET', '/api/v1/chat/conversations')
      setConversations(Array.isArray(data) ? data : [])
    } catch {}
  }

  useEffect(() => { loadConversations() }, [])
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const sendMessage = async (text) => {
    const msg = text || input.trim()
    if (!msg) return
    setInput('')
    setMessages(prev => [...prev, { text: msg, isUser: true }])
    setLoading(true)
    try {
      const data = await api('POST', '/api/v1/chat/message', { message: msg, session_id: sessionId.current })
      if (data.error) {
        setMessages(prev => [...prev, { text: 'Sorry, something went wrong: ' + data.error, isUser: false }])
      } else {
        setMessages(prev => [...prev, {
          text: data.bot_response,
          isUser: false,
          intent: data.intent,
          escalate: data.escalate,
        }])
        loadConversations()
      }
    } catch (err) {
      setMessages(prev => [...prev, { text: 'Error: ' + err.message, isUser: false }])
    }
    setLoading(false)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    sendMessage()
  }

  return (
    <>
      <div className="card">
        <h2 className="text-lg font-semibold mb-1">WhatsApp Support Bot</h2>
        <p className="text-sm text-gray-500 mb-5">Simulate a customer conversation. The AI detects intent and responds — or escalates to a human agent when needed.</p>

        {/* Chat box */}
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 min-h-[320px] max-h-[450px] overflow-y-auto mb-4">
          {messages.length === 0 && (
            <div className="text-center text-gray-400 text-sm py-12">
              Start a conversation below. Try asking about orders, returns, or products.
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i}>
              <div className={`flex mb-2 ${m.isUser ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  m.isUser
                    ? 'bg-gray-900 text-white rounded-br-md'
                    : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md shadow-sm'
                }`}>
                  {m.text}
                </div>
              </div>
              {!m.isUser && m.intent && (
                <div className={`flex mb-3 justify-start`}>
                  <div className="flex gap-1.5 text-[11px]">
                    <span className="chip chip-blue">{m.intent}</span>
                    {m.escalate && <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-600">Escalated</span>}
                  </div>
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex justify-start mb-2">
              <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            className="field-input flex-1"
            placeholder="Type a message... e.g. Where is my order ORD-12345?"
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={loading}
          />
          <button type="submit" disabled={loading || !input.trim()} className="btn-primary">
            Send
          </button>
        </form>

        {/* Quick replies */}
        <div className="flex gap-2 flex-wrap mt-3">
          {QUICK_MSGS.map(q => (
            <button
              key={q.label}
              className="btn-outline btn-sm"
              onClick={() => sendMessage(q.msg)}
              disabled={loading}
            >
              {q.label}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-semibold">Conversations</h2>
          <button className="btn-outline btn-sm" onClick={loadConversations}>Refresh</button>
        </div>
        <p className="text-sm text-gray-500 mb-4">All bot conversations with intent detection and escalation status.</p>
        {!conversations.length ? (
          <p className="text-sm text-gray-400 py-4">No conversations yet. Try the chat above.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  {['#', 'Session', 'Customer', 'Bot', 'Intent', 'Escalated', 'Time'].map(h => (
                    <th key={h} className="text-left py-2.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {conversations.map((c, i) => (
                  <tr key={c.id || i} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="py-2.5 px-3 text-gray-400">{i + 1}</td>
                    <td className="py-2.5 px-3 text-xs text-gray-400 font-mono">{(c.session_id || '').slice(0, 12)}</td>
                    <td className="py-2.5 px-3 max-w-[200px]">{(c.user_message || '').slice(0, 60)}</td>
                    <td className="py-2.5 px-3 max-w-[200px] text-gray-500">{(c.bot_response || '').slice(0, 60)}</td>
                    <td className="py-2.5 px-3"><span className="chip chip-blue">{c.intent_detected}</span></td>
                    <td className="py-2.5 px-3">
                      {c.escalated
                        ? <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-600">Yes</span>
                        : <span className="chip chip-green">No</span>}
                    </td>
                    <td className="py-2.5 px-3 text-gray-400">{new Date(c.created_at || Date.now()).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
