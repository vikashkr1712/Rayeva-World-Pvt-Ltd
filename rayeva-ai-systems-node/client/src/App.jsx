import { useState, useEffect } from 'react'
import { api } from './api'
import Dashboard from './pages/Dashboard'
import Categorizer from './pages/Categorizer'
import Proposal from './pages/Proposal'
import Impact from './pages/Impact'
import Chat from './pages/Chat'
import Logs from './pages/Logs'
import ApiDocs from './pages/ApiDocs'

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'categorizer', label: 'Category Tagger' },
  { id: 'proposal', label: 'B2B Proposals' },
  { id: 'impact', label: 'Impact Reports' },
  { id: 'chat', label: 'WhatsApp Bot' },
  { id: 'logs', label: 'Logs' },
  { id: 'api', label: 'API' },
]

export default function App() {
  const [tab, setTab] = useState('overview')
  const [mode, setMode] = useState('...')

  useEffect(() => {
    api('GET', '/health')
      .then(h => setMode(h.mode === 'demo' ? 'Demo' : 'Live'))
      .catch(() => setMode('Offline'))
  }, [])

  const renderPanel = () => {
    switch (tab) {
      case 'overview': return <Dashboard onNavigate={setTab} />
      case 'categorizer': return <Categorizer />
      case 'proposal': return <Proposal />
      case 'impact': return <Impact />
      case 'chat': return <Chat />
      case 'logs': return <Logs />
      case 'api': return <ApiDocs onNavigate={setTab} />
      default: return null
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 h-[60px] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-green-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-[1.15rem] font-bold tracking-tight">Rayeva</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${mode === 'Offline' ? 'bg-red-500' : 'bg-green-500'}`} />
              {mode}
            </span>
            <span className="text-gray-200">|</span>
            <span>v1.0.0</span>
          </div>
        </div>
      </header>

      {/* Nav */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 flex gap-0 overflow-x-auto scrollbar-hide">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                tab === t.id
                  ? 'text-gray-900 border-gray-900'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-6xl mx-auto w-full p-6 flex-1">
        {renderPanel()}
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-xs text-gray-400 border-t border-gray-100 mt-8">
        Rayeva v1.0.0 &middot; Node.js &middot; Express &middot; Sequelize &middot; OpenAI &middot; &copy; 2026 Rayeva World Pvt Ltd
      </footer>
    </div>
  )
}
