import { useState, useEffect } from 'react'
import { api } from '../api'

const SAMPLES = [
  { name: 'Organic Coconut Coir Kitchen Scrubber', brand: 'GreenWash', desc: 'Pack of 3 biodegradable kitchen scrubbers made from organic coconut coir fibers. Natural antimicrobial properties, perfect for non-stick cookware. Plastic-free packaging, compostable after use.', materials: 'coconut coir, natural fiber, biodegradable, compostable', price: '129' },
  { name: 'Bamboo Toothbrush Set', brand: 'EcoSmile', desc: 'Set of 4 premium bamboo toothbrushes with charcoal-infused BPA-free bristles. Ergonomic handle design, naturally antibacterial. Wrapped in recycled kraft paper.', materials: 'bamboo, charcoal, BPA-free nylon', price: '249' },
  { name: 'Reusable Beeswax Food Wraps', brand: 'WrapNatural', desc: 'Set of 3 organic cotton wraps coated with beeswax, jojoba oil, and tree resin. Replaces plastic cling film. Washable and reusable for up to one year.', materials: 'organic cotton, beeswax, jojoba oil, tree resin', price: '399' },
  { name: 'Stainless Steel Water Bottle 750ml', brand: 'HydroEco', desc: 'Double-wall vacuum insulated stainless steel bottle. Keeps drinks cold 24h or hot 12h. Leak-proof bamboo cap. No plastic, no BPA.', materials: 'stainless steel, bamboo, silicone', price: '699' },
  { name: 'Natural Loofah Sponge Pack', brand: 'PureEarth', desc: 'Pack of 5 dried loofah sponges from organic farms. Perfect for kitchen cleaning and body exfoliation. Fully compostable.', materials: 'natural loofah, organic', price: '179' },
  { name: 'Jute Grocery Tote Bag', brand: 'CarryGreen', desc: 'Large capacity jute tote with reinforced cotton handles. Holds 15kg. Interior laminated with natural rubber. Replaces 500+ plastic bags.', materials: 'jute, cotton, natural rubber', price: '199' },
  { name: 'Neem Wood Comb', brand: 'RootCare', desc: 'Handcrafted wide-tooth comb from Indian neem wood. Anti-static, reduces breakage and dandruff. Natural neem oil promotes scalp health.', materials: 'neem wood, cotton', price: '149' },
  { name: 'Coconut Shell Candle Holder', brand: 'TropicCraft', desc: 'Decorative candle holder from upcycled coconut shells. Hand-polished with soy wax candle included. Burns 15 hours. Supports Kerala artisans.', materials: 'coconut shell, soy wax, cotton wick', price: '349' },
]

export default function Categorizer() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [products, setProducts] = useState([])
  const [form, setForm] = useState({ name: '', brand: '', desc: '', materials: '', price: '' })

  const loadProducts = async () => {
    try {
      const data = await api('GET', '/api/v1/categories/products')
      setProducts(Array.isArray(data) ? data : [])
    } catch {}
  }

  useEffect(() => { loadProducts() }, [])

  const fillSample = () => {
    const s = SAMPLES[Math.floor(Math.random() * SAMPLES.length)]
    setForm({ name: s.name, brand: s.brand, desc: s.desc, materials: s.materials, price: s.price })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    try {
      const body = {
        name: form.name,
        description: form.desc,
        brand: form.brand || undefined,
        material_tags: form.materials ? form.materials.split(',').map(s => s.trim()).filter(Boolean) : undefined,
        price: form.price ? parseFloat(form.price) : undefined,
      }
      const data = await api('POST', '/api/v1/categories/categorize', body)
      setResult(data)
      if (!data.error) loadProducts()
    } catch (err) {
      setResult({ error: err.message })
    }
    setLoading(false)
  }

  const cat = result?.categorization || {}

  return (
    <>
      <div className="card">
        <h2 className="text-lg font-semibold mb-1">Categorize a Product</h2>
        <p className="text-sm text-gray-500 mb-5">Enter product details and the system will classify it, generate SEO tags, and assign sustainability filters.</p>
        <form onSubmit={handleSubmit}>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="field-label">Product Name</label>
              <input className="field-input" placeholder="Bamboo Toothbrush" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className="field-label">Brand</label>
              <input className="field-input" placeholder="EcoSmile" value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} />
            </div>
            <div className="sm:col-span-2">
              <label className="field-label">Description</label>
              <textarea className="field-input min-h-[72px] resize-y" placeholder="Describe the product, its materials, and any sustainability features..." required value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))} />
            </div>
            <div>
              <label className="field-label">Material Tags</label>
              <input className="field-input" placeholder="bamboo, biodegradable, recyclable" value={form.materials} onChange={e => setForm(f => ({ ...f, materials: e.target.value }))} />
            </div>
            <div>
              <label className="field-label">Price</label>
              <input className="field-input" type="number" placeholder="149" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-3 mt-5">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? <><span className="spinner" /> Working...</> : 'Categorize'}
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
                <h3 className="font-semibold text-green-800 mb-3">Product categorized</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  <div><span className="text-xs text-gray-400 font-medium">Category</span><p className="text-sm font-semibold">{cat.primary_category}</p></div>
                  <div><span className="text-xs text-gray-400 font-medium">Sub-category</span><p className="text-sm font-semibold">{cat.sub_category}</p></div>
                  <div><span className="text-xs text-gray-400 font-medium">Confidence</span><p className="text-sm font-semibold">{cat.confidence_score ? (cat.confidence_score * 100).toFixed(0) + '%' : '-'}</p></div>
                  <div><span className="text-xs text-gray-400 font-medium">Product ID</span><p className="text-sm font-semibold">{result.id || '-'}</p></div>
                </div>
                <div className="mb-3">
                  <span className="text-xs text-gray-400 font-medium">SEO Tags</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">{(cat.seo_tags || []).map((t, i) => <span key={i} className="chip chip-blue">{t}</span>)}</div>
                </div>
                <div className="mb-3">
                  <span className="text-xs text-gray-400 font-medium">Sustainability Filters</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">{(cat.sustainability_filters || []).map((f, i) => <span key={i} className="chip chip-green">{f}</span>)}</div>
                </div>
                {cat.reasoning && (
                  <div>
                    <span className="text-xs text-gray-400 font-medium">Reasoning</span>
                    <p className="text-sm text-gray-600 mt-1">{cat.reasoning}</p>
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
          <h2 className="text-lg font-semibold">Products</h2>
          <button className="btn-outline btn-sm" onClick={loadProducts}>Refresh</button>
        </div>
        <p className="text-sm text-gray-500 mb-4">All categorized products in the database.</p>
        {!products.length ? (
          <p className="text-sm text-gray-400 py-4">No products yet. Categorize one above.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">#</th>
                  <th className="text-left py-2.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Product</th>
                  <th className="text-left py-2.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Category</th>
                  <th className="text-left py-2.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Tags</th>
                  <th className="text-left py-2.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Filters</th>
                  <th className="text-left py-2.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Score</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p, i) => (
                  <tr key={p.id || i} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="py-2.5 px-3 text-gray-400">{i + 1}</td>
                    <td className="py-2.5 px-3">
                      <div className="font-medium">{p.name}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{(p.description || '').slice(0, 55)}...</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <div>{p.primary_category}</div>
                      <div className="text-xs text-gray-400">{p.sub_category}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex flex-wrap gap-1">{(p.seo_tags || []).slice(0, 4).map((t, j) => <span key={j} className="chip chip-blue">{t}</span>)}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex flex-wrap gap-1">{(p.sustainability_filters || []).map((f, j) => <span key={j} className="chip chip-green">{f}</span>)}</div>
                    </td>
                    <td className="py-2.5 px-3">{p.confidence_score ? (p.confidence_score * 100).toFixed(0) + '%' : '-'}</td>
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
