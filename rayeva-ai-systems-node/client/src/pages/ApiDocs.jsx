import { useState } from 'react'
import { api } from '../api'

const ENDPOINTS = [
  { method: 'GET', path: '/health', desc: 'Health check', run: true },
  { method: 'POST', path: '/api/v1/categories/categorize', desc: 'Categorize a product', tab: 'categorizer' },
  { method: 'GET', path: '/api/v1/categories/products', desc: 'List products', run: true },
  { method: 'POST', path: '/api/v1/proposals/generate', desc: 'Generate a proposal', tab: 'proposal' },
  { method: 'GET', path: '/api/v1/proposals/', desc: 'List proposals', run: true },
  { method: 'GET', path: '/api/v1/logs/', desc: 'View logs', run: true },
  { method: 'POST', path: '/api/v1/impact/generate', desc: 'Generate impact report', tab: 'impact' },
  { method: 'GET', path: '/api/v1/impact/', desc: 'List impact reports', run: true },
  { method: 'POST', path: '/api/v1/chat/message', desc: 'Send chat message', tab: 'chat' },
  { method: 'GET', path: '/api/v1/chat/conversations', desc: 'List conversations', run: true },
]

export default function ApiDocs({ onNavigate }) {
  const [response, setResponse] = useState('Select an endpoint above and click "Run" to see the response.')

  const tryApi = async (method, path) => {
    setResponse('Loading...')
    try {
      const data = await api(method, path)
      setResponse(JSON.stringify(data, null, 2))
    } catch (e) {
      setResponse('Error: ' + e.message)
    }
  }

  return (
    <>
      <div className="card">
        <h2 className="text-lg font-semibold mb-1">Endpoints</h2>
        <p className="text-sm text-gray-500 mb-4">Test any endpoint directly from here.</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                {['Method', 'Path', 'Description', ''].map(h => (
                  <th key={h} className="text-left py-2.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ENDPOINTS.map((ep, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="py-2.5 px-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      ep.method === 'GET' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
                    }`}>{ep.method}</span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-xs text-gray-600">{ep.path}</td>
                  <td className="py-2.5 px-3 text-gray-500">{ep.desc}</td>
                  <td className="py-2.5 px-3">
                    {ep.run ? (
                      <button className="btn-outline btn-sm" onClick={() => tryApi(ep.method, ep.path)}>Run</button>
                    ) : (
                      <button className="btn-outline btn-sm" onClick={() => onNavigate(ep.tab)}>Go</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold mb-3">Response</h2>
        <pre className="bg-gray-900 text-gray-300 text-xs p-4 rounded-lg overflow-auto max-h-[400px] min-h-[60px] font-mono leading-relaxed whitespace-pre-wrap break-words">
          {response}
        </pre>
      </div>
    </>
  )
}
