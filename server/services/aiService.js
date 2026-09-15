/**
 * CampusCare AI Analysis Service
 * 
 * Uses rule-based analysis as default (works without any API key).
 * Can be extended with Google Gemini or OpenAI by setting AI_PROVIDER in .env
 */

const CATEGORY_KEYWORDS = {
  'Electrical': ['light', 'lights', 'bulb', 'fan', 'switch', 'socket', 'plug', 'wire', 'wiring', 'power', 
                 'electricity', 'electrical', 'electric', 'circuit', 'breaker', 'fuse', 'short circuit',
                 'no power', 'blackout', 'flickering', 'sparks', 'shock'],
  'AC / Fan': ['ac', 'air conditioner', 'air conditioning', 'fan', 'cooling', 'hvac', 'ventilation',
               'hot', 'heating', 'cold', 'temperature', 'thermostat', 'blower'],
  'Plumbing': ['tap', 'faucet', 'pipe', 'pipes', 'leak', 'leaking', 'water leakage', 'flood', 'overflow',
               'drain', 'sink', 'toilet', 'flush', 'bathroom', 'plumbing', 'water pipe'],
  'Water Supply': ['water', 'no water', 'water supply', 'water pressure', 'drinking water', 'water tank',
                   'water shortage', 'hot water', 'cold water', 'water cooler'],
  'Sewage / Drainage': ['sewage', 'sewer', 'drainage', 'drain blocked', 'clog', 'clogged', 'smell',
                        'stench', 'odor', 'overflow', 'manhole', 'septic'],
  'Cleaning': ['dirty', 'unclean', 'cleaning', 'clean', 'dust', 'dusty', 'garbage', 'trash', 'waste',
               'washroom', 'toilet dirty', 'hygiene', 'stain', 'mess', 'filth'],
  'Furniture': ['chair', 'table', 'desk', 'bench', 'furniture', 'broken chair', 'damaged desk', 'cupboard',
                'shelf', 'shelves', 'door', 'window', 'board', 'blackboard', 'whiteboard', 'projector screen'],
  'Wi-Fi / Internet': ['wifi', 'wi-fi', 'internet', 'network', 'connectivity', 'connection', 'router',
                       'lan', 'ethernet', 'bandwidth', 'slow internet', 'no internet', 'disconnected'],
  'Security': ['security', 'cctv', 'camera', 'theft', 'stolen', 'missing', 'unauthorized', 'access',
               'lock', 'door lock', 'gate', 'guard', 'suspicious', 'dangerous'],
  'Construction': ['construction', 'repair', 'wall', 'crack', 'ceiling', 'roof', 'floor', 'building',
                   'maintenance', 'paint', 'painting', 'broken wall', 'structure'],
  'Garbage': ['garbage', 'trash', 'waste', 'bin', 'dustbin', 'litter', 'rubbish', 'overflow', 'collection'],
};

const PRIORITY_RULES = {
  Critical: {
    keywords: ['fire', 'flood', 'electrical shock', 'short circuit', 'sparks', 'accident', 'emergency',
               'dangerous', 'hazardous', 'sewage overflow', 'major leak', 'no water for days', 'urgent'],
    boost: 3
  },
  High: {
    keywords: ['not working', 'broken', 'failed', 'completely', 'severe', 'serious', 'bad', 'multiple',
               'entire', 'all', 'no power', 'blackout', 'blocked', 'foul smell', 'security breach'],
    boost: 2
  },
  Medium: {
    keywords: ['sometimes', 'intermittent', 'slow', 'weak', 'partial', 'minor leak', 'dirty', 'dusty'],
    boost: 1
  },
  Low: {
    keywords: ['small', 'minor', 'little', 'slightly', 'cosmetic', 'aesthetic'],
    boost: 0
  }
};

const DEPARTMENT_MAP = {
  'Electrical': 'Electrical Department',
  'AC / Fan': 'Electrical Department',
  'Plumbing': 'Plumbing & Civil Department',
  'Water Supply': 'Plumbing & Civil Department',
  'Sewage / Drainage': 'Plumbing & Civil Department',
  'Cleaning': 'Housekeeping Department',
  'Garbage': 'Housekeeping Department',
  'Furniture': 'Civil & Maintenance Department',
  'Construction': 'Civil & Maintenance Department',
  'Wi-Fi / Internet': 'IT Department',
  'Security': 'Security Department',
  'Other': 'General Maintenance'
};

function detectCategory(text) {
  const lowerText = text.toLowerCase();
  const scores = {};

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    scores[category] = 0;
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        scores[category] += keyword.split(' ').length; // multi-word keywords score more
      }
    }
  }

  const maxScore = Math.max(...Object.values(scores));
  if (maxScore === 0) return 'Other';

  return Object.entries(scores).find(([, score]) => score === maxScore)[0];
}

function detectPriority(text) {
  const lowerText = text.toLowerCase();
  let maxBoost = -1;
  let detectedPriority = 'Medium';

  for (const [priority, rule] of Object.entries(PRIORITY_RULES)) {
    for (const keyword of rule.keywords) {
      if (lowerText.includes(keyword)) {
        if (rule.boost > maxBoost) {
          maxBoost = rule.boost;
          detectedPriority = priority;
        }
      }
    }
  }

  return detectedPriority;
}

function generateSummary(title, description, category) {
  const maxLen = 120;
  const desc = description.length > 80 ? description.substring(0, 80) + '...' : description;
  return `${category} issue reported: ${desc}`;
}

function generateSuggestedAction(category, priority) {
  const actions = {
    'Electrical': priority === 'Critical'
      ? 'Immediately cut power to affected area and dispatch emergency electrician.'
      : 'Schedule electrician inspection within 24-48 hours.',
    'AC / Fan': priority === 'High' || priority === 'Critical'
      ? 'Dispatch HVAC technician immediately. Arrange temporary cooling if needed.'
      : 'Schedule HVAC maintenance within 3-5 days.',
    'Plumbing': priority === 'Critical'
      ? 'Shut off water supply immediately and dispatch emergency plumber.'
      : 'Assign plumber to inspect and repair within 24-48 hours.',
    'Water Supply': 'Inspect water supply line and tank. Arrange temporary water supply if needed.',
    'Sewage / Drainage': priority === 'Critical'
      ? 'Dispatch sanitation team immediately. Block affected area for safety.'
      : 'Schedule drainage cleaning and inspection within 24 hours.',
    'Cleaning': 'Schedule housekeeping team to clean and sanitize the area.',
    'Furniture': 'Assign maintenance team to assess and repair or replace damaged furniture.',
    'Wi-Fi / Internet': 'Dispatch IT team to check network equipment and connectivity.',
    'Security': 'Alert security supervisor immediately. Review CCTV footage if available.',
    'Construction': 'Inspect structural issue and assign civil maintenance team.',
    'Garbage': 'Schedule garbage collection and place additional bins if needed.',
    'Other': 'Assign to general maintenance team for assessment and resolution.'
  };

  return actions[category] || actions['Other'];
}

function generateReason(category, priority, text) {
  const reasons = {
    Critical: `This complaint has been flagged as Critical due to potential safety hazard or major service disruption. Immediate intervention is required.`,
    High: `This ${category.toLowerCase()} issue appears to be significantly impacting usability. Prompt action is needed to restore normal operations.`,
    Medium: `This ${category.toLowerCase()} issue affects comfort and productivity but does not pose an immediate safety risk. Should be resolved within standard SLA.`,
    Low: `This appears to be a minor ${category.toLowerCase()} issue with limited impact. Can be scheduled during routine maintenance.`
  };
  return reasons[priority] || reasons['Medium'];
}

/**
 * Rule-based AI analysis (works without any API key)
 */
function analyzeWithRules(title, description) {
  const combinedText = `${title} ${description}`;
  const category = detectCategory(combinedText);
  const priority = detectPriority(combinedText);
  const department = DEPARTMENT_MAP[category] || 'General Maintenance';
  const summary = generateSummary(title, description, category);
  const suggestedAction = generateSuggestedAction(category, priority);
  const reason = generateReason(category, priority, combinedText);

  return {
    category,
    priority,
    department,
    summary,
    suggestedAction,
    reason,
    confidence: 75, // Rule-based confidence
    method: 'rule-based'
  };
}

/**
 * Google Gemini AI analysis
 */
async function analyzeWithGemini(title, description, apiKey) {
  try {
    const fetch = (await import('node-fetch')).default;
    const prompt = `You are an expert campus maintenance coordinator. Analyze this maintenance complaint and provide structured analysis.

Complaint Title: "${title}"
Complaint Description: "${description}"

Respond with a JSON object with exactly these fields:
{
  "category": one of ["Electrical", "Plumbing", "Water Supply", "Sewage / Drainage", "Cleaning", "Furniture", "Wi-Fi / Internet", "AC / Fan", "Security", "Construction", "Garbage", "Other"],
  "priority": one of ["Low", "Medium", "High", "Critical"],
  "department": the responsible department name,
  "summary": a concise 1-2 sentence summary of the issue,
  "suggestedAction": specific recommended action for maintenance team,
  "reason": brief explanation of why this priority was assigned,
  "confidence": a number 0-100 representing your confidence
}

Respond ONLY with the JSON object, no other text.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 500 }
        })
      }
    );

    if (!response.ok) throw new Error(`Gemini API error: ${response.status}`);

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Empty response from Gemini');

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in Gemini response');

    const result = JSON.parse(jsonMatch[0]);
    result.method = 'gemini-ai';
    return result;
  } catch (error) {
    console.warn('Gemini AI failed, falling back to rule-based:', error.message);
    return analyzeWithRules(title, description);
  }
}

/**
 * Main analysis function - selects appropriate method based on config
 */
async function analyzeComplaint(title, description) {
  const aiProvider = process.env.AI_PROVIDER;
  const apiKey = process.env.AI_API_KEY;

  if (aiProvider === 'gemini' && apiKey) {
    return await analyzeWithGemini(title, description, apiKey);
  }

  // Default: rule-based analysis
  return analyzeWithRules(title, description);
}

module.exports = { analyzeComplaint };
