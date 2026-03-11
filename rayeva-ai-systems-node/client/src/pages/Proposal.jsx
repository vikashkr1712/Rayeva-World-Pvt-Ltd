import { useState, useEffect } from 'react'
import { api } from '../api'

const SAMPLES = [
  { client: 'GreenStay Heritage Hotels', industry: 'Hospitality', budget: '500000', focus: 'high', requirements: 'Replace all single-use plastic amenities across 12 hotel properties. Need eco-friendly toiletries, room amenities, cleaning supplies, and restaurant disposables.' },
  { client: 'Sunrise Montessori Schools', industry: 'Education', budget: '200000', focus: 'high', requirements: 'Sustainable school supplies and cafeteria items for 8 campuses. Reusable lunch containers, bamboo stationery, cloth napkins, and eco-friendly art supplies.' },
  { client: 'FreshBite Restaurant Chain', industry: 'Food & Beverage', budget: '350000', focus: 'medium', requirements: 'Sustainable packaging for takeaway orders. Compostable containers, paper straws, wooden cutlery, and biodegradable carry bags for 2000 orders/day.' },
  { client: 'UrbanNest Co-living Spaces', industry: 'Real Estate', budget: '750000', focus: 'medium', requirements: 'Furnishing 50 co-living units with sustainable home essentials — organic bedding, bamboo towels, natural cleaning supplies, recycled glassware.' },
  { client: 'PureGlow Wellness Spa', industry: 'Health & Wellness', budget: '180000', focus: 'high', requirements: 'Upgrade spa consumables to organic alternatives — natural body scrubs, organic cotton robes, bamboo slippers, essential oil diffusers.' },
  { client: 'TechVista Corporate Office', industry: 'Technology', budget: '300000', focus: 'low', requirements: 'Green office initiative for 500 employees. Reusable bottles, desk plants in recycled pots, bamboo organizers, recycled paper supplies.' },
]

export default function Proposal() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [proposals, setProposals] = useState([])
  const [form, setForm] = useState({ client: '', industry: '', budget: '', focus: 'medium', requirements: '' })

  const loadProposals = async () => {
    try {
      const data = await api('GET', '/api/v1/proposals/')
      setProposals(Array.isArray(data) ? data : [])
    } catch {}
  }

  useEffect(() => { loadProposals() }, [])

  const fillSample = () => {
    const s = SAMPLES[Math.floor(Math.random() * SAMPLES.length)]
    setForm({ client: s.client, industry: s.industry, budget: s.budget, focus: s.focus, requirements: s.requirements })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    try {
      const body = {
        client_name: form.client,
        client_industry: form.industry,
        budget_limit: parseFloat(form.budget),
        sustainability_priority: form.focus || undefined,
        requirements: form.requirements || undefined,
      }
      const data = await api('POST', '/api/v1/proposals/generate', body)
      setResult(data)
      if (!data.error) loadProposals()
    } catch (err) {
      setResult({ error: err.message })
    }
    setLoading(false)
  }

  const pd = result?.proposal || {}
  const cost = pd.cost_breakdown || {}

  return (
    <>
      <div className="card">
        <h2 className="text-lg font-semibold mb-1">Generate a Proposal</h2>
        <p className="text-sm text-gray-500 mb-5">Fill in client details to create a budget-aware, sustainable procurement proposal.</p>
        <form onSubmit={handleSubmit}>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="field-label">Client Name</label>
              <input className="field-input" placeholder="GreenCorp Enterprises" required value={form.client} onChange={e => setForm(f => ({ ...f, client: e.target.value }))} />
            </div>
            <div>
              <label className="field-label">Industry</label>
              <input className="field-input" placeholder="Hospitality" required value={form.industry} onChange={e => setForm(f => ({ ...f, industry: e.target.value }))} />
            </div>
            <div>
              <label className="field-label">Budget</label>
              <input className="field-input" type="number" placeholder="500000" required value={form.budget} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))} />
            </div>
            <div>
              <label className="field-label">Sustainability Priority</label>
              <select className="field-input" value={form.focus} onChange={e => setForm(f => ({ ...f, focus: e.target.value }))}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="field-label">Requirements</label>
              <textarea className="field-input min-h-[72px] resize-y" placeholder="Describe what the client needs..." value={form.requirements} onChange={e => setForm(f => ({ ...f, requirements: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-3 mt-5">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? <><span className="spinner" /> Working...</> : 'Generate'}
            </button>
            <button type="button" className="btn-outline" onClick={fillSample}>Try a sample</button>
          </div>
        </form>

        {result && (
          <div className={`mt-5 border rounded-xl p-5 ${result.error ? 'border-red-200 border-l-4 border-l-red-500 bg-red-50/30' : 'border-green-200 border-l-4 border-l-green-500 bg-green-50/20'}`}>
            {result.error ? (
              <>
                <h3 className="font-semibold text-red-700 mb-1">Something went wrong</h3>
                <p className="text-sm text-gray-600">{result.error}</p>
              </>
            ) : (
              <>
                <h3 className="font-semibold text-green-800 mb-4">Proposal ready</h3>
                {/* Summary stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                  <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="text-lg font-bold">{Number(cost.total_estimated || 0).toLocaleString('en-IN')}</div>
                    <div className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mt-0.5">Total Cost</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="text-lg font-bold">{cost.total_estimated && result.budget_limit ? ((cost.total_estimated / result.budget_limit) * 100).toFixed(1) : 0}%</div>
                    <div className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mt-0.5">Budget Used</div>
                    <div className="mt-1.5 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gray-900 rounded-full transition-all" style={{ width: `${Math.min(100, cost.total_estimated && result.budget_limit ? (cost.total_estimated / result.budget_limit) * 100 : 0)}%` }} />
                    </div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="text-lg font-bold">{Number(cost.remaining_budget || 0).toLocaleString('en-IN')}</div>
                    <div className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mt-0.5">Remaining</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="text-lg font-bold">{(pd.product_mix || []).length}</div>
                    <div className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mt-0.5">Products</div>
                  </div>
                </div>
                {/* Product mix table */}
                <h4 className="text-sm font-semibold mb-2 text-gray-700">Product Mix</h4>
                <div className="overflow-x-auto mb-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">#</th>
                        <th className="text-left py-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Product</th>
                        <th className="text-left py-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Category</th>
                        <th className="text-left py-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Unit</th>
                        <th className="text-left py-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Qty</th>
                        <th className="text-left py-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Total</th>
                        <th className="text-left py-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Tags</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(pd.product_mix || []).map((p, i) => (
                        <tr key={i} className="border-b border-gray-50">
                          <td className="py-2 px-2 text-gray-400">{i + 1}</td>
                          <td className="py-2 px-2 font-medium">{p.product_name}</td>
                          <td className="py-2 px-2 text-gray-500">{p.category}</td>
                          <td className="py-2 px-2">{p.unit_price_estimate}</td>
                          <td className="py-2 px-2">{p.quantity}</td>
                          <td className="py-2 px-2">{Number(p.total_price).toLocaleString('en-IN')}</td>
                          <td className="py-2 px-2">
                            <div className="flex flex-wrap gap-1">{(p.sustainability_tags || []).map((t, j) => <span key={j} className="chip chip-green">{t}</span>)}</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {pd.impact_summary && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold mb-2 text-gray-700">Impact</h4>
                    <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 text-sm text-gray-600 leading-relaxed">{pd.impact_summary}</div>
                  </div>
                )}
                {(pd.key_selling_points || []).length > 0 && (
                  <div className="mb-3">
                    <h4 className="text-sm font-semibold mb-2 text-gray-700">Selling Points</h4>
                    <ul className="list-disc ml-5 text-sm text-gray-600 space-y-1">{pd.key_selling_points.map((s, i) => <li key={i}>{s}</li>)}</ul>
                  </div>
                )}
                <details className="mt-3">
                  <summary className="text-xs font-medium text-gray-400 cursor-pointer hover:text-gray-600">Raw JSON</summary>
                  <pre className="mt-2 bg-gray-900 text-gray-300 text-xs p-4 rounded-lg overflow-auto max-h-[300px]">{JSON.stringify(result, null, 2)}</pre>
                </details>
              </>
            )}
          </div>
        )}
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-semibold">Proposals</h2>
          <button className="btn-outline btn-sm" onClick={loadProposals}>Refresh</button>
        </div>
        <p className="text-sm text-gray-500 mb-4">All generated proposals.</p>
        {!proposals.length ? (
          <p className="text-sm text-gray-400 py-4">No proposals yet. Generate one above.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  {['#', 'Client', 'Industry', 'Budget', 'Total', 'Items', 'Date'].map(h => (
                    <th key={h} className="text-left py-2.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {proposals.map((p, i) => {
                  const pr = p.proposal || {}
                  const c = pr.cost_breakdown || p.cost_breakdown || {}
                  const mix = pr.product_mix || p.product_mix || []
                  return (
                    <tr key={p.id || i} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="py-2.5 px-3 text-gray-400">{i + 1}</td>
                      <td className="py-2.5 px-3 font-medium">{p.client_name}</td>
                      <td className="py-2.5 px-3 text-gray-500">{p.client_industry}</td>
                      <td className="py-2.5 px-3">{Number(p.budget_limit).toLocaleString('en-IN')}</td>
                      <td className="py-2.5 px-3">{c.total_estimated ? Number(c.total_estimated).toLocaleString('en-IN') : '-'}</td>
                      <td className="py-2.5 px-3">{mix.length || '-'}</td>
                      <td className="py-2.5 px-3 text-gray-400">{new Date(p.created_at || p.createdAt).toLocaleDateString()}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
