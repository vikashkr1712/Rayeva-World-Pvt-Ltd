import { useState, useEffect } from 'react'
import { api } from '../api'

export default function Logs() {
  const [logs, setLogs] = useState([])

  const loadLogs = async () => {
    try {
      const data = await api('GET', '/api/v1/logs/')
      setLogs(Array.isArray(data) ? data : [])
    } catch {}
  }

  useEffect(() => { loadLogs() }, [])

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-lg font-semibold">Activity Log</h2>
        <button className="btn-outline btn-sm" onClick={loadLogs}>Refresh</button>
      </div>
      <p className="text-sm text-gray-500 mb-4">Every interaction is recorded with prompts, responses, tokens, and latency.</p>
      {!logs.length ? (
        <p className="text-sm text-gray-400 py-4">No logs yet. Categorize a product or generate a proposal to get started.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                {['#', 'Module', 'Model', 'Status', 'Tokens', 'Latency', 'Time'].map(h => (
                  <th key={h} className="text-left py-2.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map((l, i) => (
                <tr key={l.id || i} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="py-2.5 px-3 text-gray-400">{i + 1}</td>
                  <td className="py-2.5 px-3"><span className="chip chip-gray">{l.module}</span></td>
                  <td className="py-2.5 px-3 text-gray-500">{l.model_used || '-'}</td>
                  <td className="py-2.5 px-3">
                    {l.success
                      ? <span className="chip chip-green">OK</span>
                      : <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-600">Error</span>}
                  </td>
                  <td className="py-2.5 px-3">{l.tokens_used || '-'}</td>
                  <td className="py-2.5 px-3">{l.latency_ms ? l.latency_ms + 'ms' : '-'}</td>
                  <td className="py-2.5 px-3 text-gray-400">{new Date(l.created_at || l.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
