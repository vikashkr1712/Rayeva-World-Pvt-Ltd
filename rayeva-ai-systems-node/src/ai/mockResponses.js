/**
 * Rayeva AI Systems – Mock AI Responses (Demo Mode)
 * Provides realistic mock responses when no OpenAI API key is configured.
 * This allows the full system to be demonstrated without API costs.
 */

const config = require("../config");

/**
 * Generate a mock AI response based on the prompt type.
 * @param {string} systemPrompt
 * @param {string} userPrompt
 * @returns {object} Mock result matching AIClient.generate() output format
 */
function getMockResponse(systemPrompt, userPrompt) {
  const startTime = Date.now();

  let parsed;

  if (systemPrompt.includes("categorization")) {
    parsed = buildMockCategorization(userPrompt);
  } else if (systemPrompt.includes("B2B")) {
    parsed = buildMockProposal(userPrompt);
  } else {
    parsed = { message: "Mock response" };
  }

  const responseText = JSON.stringify(parsed, null, 2);

  return {
    response_text: responseText,
    parsed_json: parsed,
    tokens_used: Math.floor(Math.random() * 500) + 200,
    latency_ms: Date.now() - startTime + Math.floor(Math.random() * 300) + 100,
    success: true,
    error: null,
  };
}

/**
 * Build a mock categorization response based on product details in the prompt.
 */
function buildMockCategorization(userPrompt) {
  const promptLower = userPrompt.toLowerCase();

  // Detect category from product description
  let primaryCategory = "Home & Living";
  let subCategory = "General";
  const tags = [];
  const filters = [];

  if (promptLower.includes("toothbrush") || promptLower.includes("soap") || promptLower.includes("shampoo") || promptLower.includes("hygiene")) {
    primaryCategory = "Personal Care & Hygiene";
    subCategory = "Oral Care";
    tags.push("eco-friendly toothbrush", "sustainable oral care", "bamboo toothbrush", "biodegradable toothbrush", "plastic-free hygiene", "zero waste bathroom", "natural toothbrush");
    filters.push("plastic-free", "biodegradable", "compostable", "zero-waste");
  } else if (promptLower.includes("kitchen") || promptLower.includes("food") || promptLower.includes("wrap") || promptLower.includes("plate") || promptLower.includes("cup")) {
    primaryCategory = "Kitchen & Dining";
    subCategory = "Food Storage & Prep";
    tags.push("eco kitchen", "sustainable dining", "plastic-free kitchen", "reusable food storage", "green kitchen essentials", "organic kitchen", "zero waste cooking");
    filters.push("plastic-free", "reusable", "organic", "zero-waste");
  } else if (promptLower.includes("bag") || promptLower.includes("cloth") || promptLower.includes("tote") || promptLower.includes("fashion") || promptLower.includes("wear")) {
    primaryCategory = "Fashion & Accessories";
    subCategory = "Bags & Carriers";
    tags.push("sustainable fashion", "eco-friendly bag", "organic cotton", "reusable shopping bag", "green fashion", "ethical fashion", "zero waste accessories");
    filters.push("organic", "reusable", "plastic-free", "fair-trade");
  } else if (promptLower.includes("notebook") || promptLower.includes("pen") || promptLower.includes("paper") || promptLower.includes("office") || promptLower.includes("stationery")) {
    primaryCategory = "Office & Stationery";
    subCategory = "Notebooks & Writing";
    tags.push("recycled notebook", "eco stationery", "sustainable office", "green supplies", "recycled paper", "eco-friendly journal", "zero waste office");
    filters.push("recycled", "plastic-free", "zero-waste");
  } else if (promptLower.includes("clean") || promptLower.includes("scrub") || promptLower.includes("detergent") || promptLower.includes("laundry")) {
    primaryCategory = "Cleaning & Laundry";
    subCategory = "Household Cleaning";
    tags.push("natural cleaner", "eco cleaning", "plastic-free cleaning", "compostable scrubber", "sustainable cleaning", "green household", "chemical-free clean");
    filters.push("plastic-free", "compostable", "chemical-free", "biodegradable");
  } else if (promptLower.includes("plant") || promptLower.includes("garden") || promptLower.includes("seed") || promptLower.includes("soil")) {
    primaryCategory = "Gardening & Agriculture";
    subCategory = "Garden Supplies";
    tags.push("organic gardening", "sustainable garden", "eco-friendly plants", "green gardening", "natural fertilizer", "compostable pots", "zero waste garden");
    filters.push("organic", "compostable", "chemical-free", "locally-sourced");
  } else if (promptLower.includes("bottle") || promptLower.includes("travel") || promptLower.includes("outdoor") || promptLower.includes("camping")) {
    primaryCategory = "Travel & Outdoor";
    subCategory = "Travel Essentials";
    tags.push("eco travel", "sustainable outdoor", "reusable bottle", "green travel", "eco-friendly camping", "zero waste travel", "sustainable adventure");
    filters.push("reusable", "plastic-free", "zero-waste");
  } else if (promptLower.includes("baby") || promptLower.includes("kid") || promptLower.includes("child") || promptLower.includes("toy")) {
    primaryCategory = "Baby & Kids";
    subCategory = "Kids Products";
    tags.push("eco-friendly kids", "sustainable baby", "organic kids", "natural toys", "safe baby products", "green parenting", "non-toxic kids");
    filters.push("organic", "chemical-free", "plastic-free", "cruelty-free");
  } else {
    // Default - analyze for common eco keywords
    tags.push("sustainable product", "eco-friendly", "green living", "environmentally conscious", "natural product", "plastic alternative", "zero waste lifestyle");
    filters.push("plastic-free", "biodegradable", "reusable");
  }

  return {
    primary_category: primaryCategory,
    sub_category: subCategory,
    seo_tags: tags,
    sustainability_filters: filters,
    confidence_score: parseFloat((Math.random() * 0.15 + 0.83).toFixed(2)),
    reasoning: `Product analyzed and categorized as "${primaryCategory} > ${subCategory}" based on its description, materials, and sustainability attributes. The product aligns with Rayeva's eco-friendly commerce mission.`,
  };
}

/**
 * Build a mock B2B proposal response based on client details in the prompt.
 */
function buildMockProposal(userPrompt) {
  // Extract budget from prompt
  const budgetMatch = userPrompt.match(/BUDGET LIMIT:\s*₹?([\d,]+)/);
  const budget = budgetMatch ? parseFloat(budgetMatch[1].replace(/,/g, "")) : 500000;

  // Extract client name
  const clientMatch = userPrompt.match(/CLIENT:\s*(.+)/);
  const clientName = clientMatch ? clientMatch[1].trim() : "Client";

  // Extract industry
  const industryMatch = userPrompt.match(/INDUSTRY:\s*(.+)/);
  const industry = industryMatch ? industryMatch[1].trim() : "General";

  // Generate realistic product mix based on budget
  const products = [
    { product_name: "Bamboo Toothbrush Set (Pack of 50)", category: "Personal Care", unit_price_estimate: 45, base_qty: 200, sustainability_tags: ["biodegradable", "plastic-free"] },
    { product_name: "Organic Cotton Hand Towels", category: "Home & Living", unit_price_estimate: 120, base_qty: 150, sustainability_tags: ["organic", "fair-trade"] },
    { product_name: "Recycled Paper Notebooks (A5)", category: "Office & Stationery", unit_price_estimate: 80, base_qty: 100, sustainability_tags: ["recycled", "plastic-free"] },
    { product_name: "Natural Coconut Coir Scrubbers (Pack of 5)", category: "Cleaning & Laundry", unit_price_estimate: 60, base_qty: 100, sustainability_tags: ["compostable", "locally-sourced"] },
    { product_name: "Beeswax Food Wrap Set", category: "Kitchen & Dining", unit_price_estimate: 250, base_qty: 80, sustainability_tags: ["reusable", "zero-waste"] },
    { product_name: "Stainless Steel Water Bottles (750ml)", category: "Travel & Outdoor", unit_price_estimate: 350, base_qty: 50, sustainability_tags: ["reusable", "plastic-free"] },
    { product_name: "Organic Cotton Tote Bags", category: "Fashion & Accessories", unit_price_estimate: 150, base_qty: 100, sustainability_tags: ["organic", "reusable"] },
    { product_name: "Biodegradable Bin Liners (Pack of 30)", category: "Cleaning & Laundry", unit_price_estimate: 90, base_qty: 60, sustainability_tags: ["biodegradable", "compostable"] },
  ];

  // Scale quantities to fit budget (products = ~85% of budget)
  const targetProductCost = budget * 0.82;
  const rawTotal = products.reduce((s, p) => s + p.unit_price_estimate * p.base_qty, 0);
  const scale = targetProductCost / rawTotal;

  const productMix = products.map((p) => {
    const qty = Math.max(1, Math.round(p.base_qty * scale));
    return {
      product_name: p.product_name,
      category: p.category,
      unit_price_estimate: p.unit_price_estimate,
      quantity: qty,
      total_price: Math.round(p.unit_price_estimate * qty * 100) / 100,
      sustainability_tags: p.sustainability_tags,
    };
  });

  const productCosts = productMix.reduce((s, p) => s + p.total_price, 0);
  const shipping = Math.round(productCosts * 0.08 * 100) / 100;
  const packaging = Math.round(productCosts * 0.04 * 100) / 100;
  const totalEstimated = Math.round((productCosts + shipping + packaging) * 100) / 100;

  // Budget allocation by category
  const categories = {};
  for (const p of productMix) {
    categories[p.category] = (categories[p.category] || 0) + p.total_price;
  }
  const budgetAllocation = Object.entries(categories).map(([cat, amt]) => ({
    category: cat,
    allocated_amount: Math.round(amt * 100) / 100,
    percentage: Math.round((amt / productCosts) * 10000) / 100,
  }));

  return {
    product_mix: productMix,
    budget_allocation: budgetAllocation,
    cost_breakdown: {
      product_costs: Math.round(productCosts * 100) / 100,
      shipping_estimate: shipping,
      packaging_costs: packaging,
      total_estimated: totalEstimated,
      remaining_budget: Math.max(0, Math.round((budget - totalEstimated) * 100) / 100),
    },
    impact_summary: `By partnering with Rayeva for sustainable procurement, ${clientName} in the ${industry} sector can eliminate an estimated ${Math.round(productMix.reduce((s, p) => s + p.quantity * 0.15, 0))} kg of single-use plastic annually, avoid approximately ${Math.round(productMix.reduce((s, p) => s + p.quantity * 0.3, 0))} kg of CO₂ emissions, and support local artisan communities. This transition positions ${clientName} as a sustainability leader in the ${industry} industry while maintaining cost efficiency with a budget utilization of ${Math.round((totalEstimated / budget) * 100)}%.`,
    key_selling_points: [
      `Eliminate ~${Math.round(productMix.reduce((s, p) => s + p.quantity * 0.15, 0))} kg of plastic waste annually`,
      `Reduce carbon footprint by ~${Math.round(productMix.reduce((s, p) => s + p.quantity * 0.3, 0))} kg CO₂`,
      "Enhance brand reputation as a sustainability-conscious organization",
      "Support local artisan communities and fair-trade practices",
      `Cost-effective transition within ₹${budget.toLocaleString("en-IN")} budget with ${Math.round(((budget - totalEstimated) / budget) * 100)}% savings`,
    ],
  };
}

module.exports = { getMockResponse };
