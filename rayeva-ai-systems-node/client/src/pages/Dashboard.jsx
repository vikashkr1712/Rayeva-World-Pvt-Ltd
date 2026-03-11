import { useState, useEffect } from 'react'
import { api } from '../api'

const MODULES = [
  { num: '01', title: 'Category & Tag Generator', desc: "Classifies products into Rayeva's taxonomy and assigns SEO tags with sustainability filters." },
  { num: '02', title: 'B2B Proposal Generator', desc: 'Creates tailored procurement proposals with product mix, budget allocation, and impact reports.' },
  { num: '03', title: 'Impact Reporting', desc: 'Estimates plastic saved, carbon avoided, and local sourcing impact per order or buyer.' },
  { num: '04', title: 'WhatsApp Support', desc: 'Handles order status, return queries, and escalation with full conversation logging.' },
]

const TECH = [
  { name: 'Node.js + Express', desc: 'REST API framework' },
  { name: 'OpenAI GPT-4o', desc: 'Intelligent categorization & proposals' },
  { name: 'SQLite + Sequelize', desc: 'Lightweight ORM persistence' },
  { name: 'Joi', desc: 'Request validation' },
  { name: 'Winston', desc: 'Structured logging' },
  { name: 'Demo Mode', desc: 'Works without API key' },
]

export default function Dashboard() {
  const [kpis, setKpis] = useState({ products: '-', proposals: '-', logs: '-', impact: '-', chats: '-', health: '-' })

  useEffect(() => {
    Promise.all([
      api('GET', '/health'),
      api('GET', '/api/v1/categories/products'),
      api('GET', '/api/v1/proposals/'),
      api('GET', '/api/v1/logs/'),
      api('GET', '/api/v1/impact/'),
      api('GET', '/api/v1/chat/conversations'),
    ]).then(([h, p, pr, l, i, c]) => {
      setKpis({
        health: h.status === 'healthy' ? 'Online' : 'Offline',
        products: Array.isArray(p) ? p.length : 0,
        proposals: Array.isArray(pr) ? pr.length : 0,
        logs: Array.isArray(l) ? l.length : 0,
        impact: Array.isArray(i) ? i.length : 0,
        chats: Array.isArray(c) ? c.length : 0,
      })
    }).catch(() => setKpis(k => ({ ...k, health: 'Offline' })))
  }, [])

  const stats = [
    { label: 'Products', value: kpis.products, color: 'border-l-emerald-500' },
    { label: 'Proposals', value: kpis.proposals, color: 'border-l-blue-500' },
    { label: 'Interactions', value: kpis.logs, color: 'border-l-violet-500' },
    { label: 'Impact Reports', value: kpis.impact, color: 'border-l-amber-500' },
    { label: 'Chats', value: kpis.chats, color: 'border-l-pink-500' },
    { label: 'Server', value: kpis.health, color: 'border-l-gray-400' },
  ]

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {stats.map(k => (
          <div key={k.label} className={`bg-white border border-gray-200 border-l-4 ${k.color} rounded-xl p-4 shadow-sm`}>
            <div className="text-2xl font-bold">{k.value}</div>
            <div className="text-[11px] text-gray-400 uppercase tracking-wider font-medium mt-1">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold mb-1">Modules</h2>
        <p className="text-sm text-gray-500 mb-5">Four AI-powered modules drive the Rayeva platform — all fully implemented.</p>
        <div className="grid sm:grid-cols-2 gap-4">
          {MODULES.map(m => (
            <div key={m.num} className="border border-gray-200 rounded-xl p-5 hover:border-green-300 hover:shadow-sm transition-all group">
              <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Module {m.num}</div>
              <h3 className="font-semibold text-[15px] mb-1.5 group-hover:text-green-700 transition-colors">{m.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{m.desc}</p>
              <span className="inline-block mt-3 text-[11px] font-semibold px-2.5 py-1 rounded bg-green-50 text-green-600">
                Implemented
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold mb-1">Technology</h2>
        <p className="text-sm text-gray-500 mb-5">Built with modern, production-ready tools.</p>
        <div className="grid sm:grid-cols-3 gap-3">
          {TECH.map(t => (
            <div key={t.name} className="border border-gray-100 rounded-lg p-4 hover:border-gray-200 transition-colors">
              <div className="font-semibold text-sm">{t.name}</div>
              <div className="text-xs text-gray-400 mt-0.5">{t.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
