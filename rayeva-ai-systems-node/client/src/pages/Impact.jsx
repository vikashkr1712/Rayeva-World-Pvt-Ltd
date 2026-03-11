import { useState, useEffect } from 'react'
import { api } from '../api'

const SAMPLES = [
  { order_id: 'ORD-2026-001', total: 1847, products: [
    { name: 'Bamboo Toothbrush Set (Pack of 4)', quantity: 2, price: 249, category: 'Personal Care & Hygiene' },
    { name: 'Organic Coconut Coir Kitchen Scrubber', quantity: 3, price: 129, category: 'Cleaning & Laundry' },
    { name: 'Beeswax Food Wraps Set', quantity: 1, price: 399, category: 'Kitchen & Dining' },
    { name: 'Reusable Cotton Mesh Bags (Set of 6)', quantity: 1, price: 329, category: 'Fashion & Accessories' },
    { name: 'Neem Wood Comb', quantity: 2, price: 149, category: 'Personal Care & Hygiene' },
  ]},
  { order_id: 'ORD-2026-002', total: 2576, products: [
    { name: 'Stainless Steel Water Bottle 750ml', quantity: 3, price: 699, category: 'Travel & Outdoor' },
    { name: 'Jute Grocery Tote Bag', quantity: 4, price: 199, category: 'Fashion & Accessories' },
    { name: 'Natural Loofah Sponge Pack', quantity: 2, price: 179, category: 'Cleaning & Laundry' },
  ]},
  { order_id: 'ORD-2026-003', total: 3456, products: [
    { name: 'Organic Cotton Bed Sheet Set', quantity: 1, price: 1899, category: 'Home & Living' },
    { name: 'Coconut Shell Candle Holder', quantity: 2, price: 349, category: 'Home & Living' },
    { name: 'Recycled Paper Notebook A5', quantity: 3, price: 189, category: 'Office & Stationery' },
    { name: 'Bamboo Pen Set', quantity: 2, price: 129, category: 'Office & Stationery' },
  ]},
]

export default function Impact() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [reports, setReports] = useState([])
  const [form, setForm] = useState({ order_id: '', total: '', products: '' })

  const loadReports = async () => {
    try {
      const data = await api('GET', '/api/v1/impact/')
      setReports(Array.isArray(data) ? data : [])
    } catch {}
  }

  useEffect(() => { loadReports() }, [])

  const fillSample = () => {
    const s = SAMPLES[Math.floor(Math.random() * SAMPLES.length)]
    setForm({ order_id: s.order_id, total: String(s.total), products: JSON.stringify(s.products, null, 2) })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    try {
      let products
      try { products = JSON.parse(form.products) }
      catch { throw new Error('Invalid JSON in products field. Use "Try a sample" for correct format.') }
      const body = { order_id: form.order_id, order_total: parseFloat(form.total), products }
      const data = await api('POST', '/api/v1/impact/generate', body)
      setResult(data)
      if (!data.error) loadReports()
    } catch (err) {
      setResult({ error: err.message })
    }
    setLoading(false)
  }

  const imp = result?.impact || {}

  return (
    <>
      <div className="card">
        <h2 className="text-lg font-semibold mb-1">Generate Impact Report</h2>
        <p className="text-sm text-gray-500 mb-5">Enter order details to estimate environmental impact — plastic saved, carbon avoided, and local sourcing benefits.</p>
        <form onSubmit={handleSubmit}>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="field-label">Order ID</label>
              <input className="field-input" placeholder="ORD-12345" required value={form.order_id} onChange={e => setForm(f => ({ ...f, order_id: e.target.value }))} />
            </div>
            <div>
              <label className="field-label">Order Total (₹)</label>
              <input className="field-input" type="number" placeholder="2500" required value={form.total} onChange={e => setForm(f => ({ ...f, total: e.target.value }))} />
            </div>
            <div className="sm:col-span-2">
              <label className="field-label">Products (JSON array)</label>
              <textarea className="field-input min-h-[100px] resize-y font-mono text-xs" placeholder='[{"name":"Bamboo Toothbrush","quantity":2,"price":249,"category":"Personal Care"}]' required value={form.products} onChange={e => setForm(f => ({ ...f, products: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-3 mt-5">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? <><span className="spinner" /> Working...</> : 'Generate Report'}
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
                <h3 className="font-semibold text-green-800 mb-4">Impact Report Generated</h3>
                <div className="grid grid-cols-3 gap-3 mb-5">
                  <div className="text-center p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                    <div className="text-xl font-bold text-emerald-700">{imp.plastic_saved_kg} kg</div>
                    <div className="text-[10px] text-emerald-600/70 uppercase tracking-wider font-medium mt-0.5">Plastic Saved</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="text-xl font-bold text-blue-700">{imp.carbon_avoided_kg} kg</div>
                    <div className="text-[10px] text-blue-600/70 uppercase tracking-wider font-medium mt-0.5">CO₂ Avoided</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="text-xl font-bold">{result.order_id}</div>
                    <div className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mt-0.5">Order ID</div>
                  </div>
                </div>
                {imp.human_readable_statement && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold mb-2 text-gray-700">Customer Impact Statement</h4>
                    <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 text-sm text-gray-600 leading-relaxed">{imp.human_readable_statement}</div>
                  </div>
                )}
                {imp.local_sourcing_summary && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold mb-2 text-gray-700">Local Sourcing</h4>
                    <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 text-sm text-gray-600 leading-relaxed">{imp.local_sourcing_summary}</div>
                  </div>
                )}
                {imp.methodology_notes && (
                  <div className="mb-3">
                    <h4 className="text-sm font-semibold mb-2 text-gray-700">Methodology</h4>
                    <p className="text-xs text-gray-400 leading-relaxed">{imp.methodology_notes}</p>
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
          <h2 className="text-lg font-semibold">Impact Reports</h2>
          <button className="btn-outline btn-sm" onClick={loadReports}>Refresh</button>
        </div>
        <p className="text-sm text-gray-500 mb-4">All generated environmental impact reports.</p>
        {!reports.length ? (
          <p className="text-sm text-gray-400 py-4">No impact reports yet. Generate one above.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  {['#', 'Order', 'Plastic Saved', 'CO₂ Avoided', 'Statement', 'Date'].map(h => (
                    <th key={h} className="text-left py-2.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reports.map((r, i) => (
                  <tr key={r.id || i} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="py-2.5 px-3 text-gray-400">{i + 1}</td>
                    <td className="py-2.5 px-3 font-medium">{r.order_id}</td>
                    <td className="py-2.5 px-3"><span className="chip chip-green">{r.plastic_saved_kg} kg</span></td>
                    <td className="py-2.5 px-3"><span className="chip chip-blue">{r.carbon_avoided_kg} kg</span></td>
                    <td className="py-2.5 px-3 max-w-[300px] text-gray-500">{(r.human_readable_statement || '').slice(0, 100)}...</td>
                    <td className="py-2.5 px-3 text-gray-400">{new Date(r.created_at || Date.now()).toLocaleDateString()}</td>
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
