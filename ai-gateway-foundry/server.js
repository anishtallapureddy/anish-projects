const express = require('express');
const path = require('path');
const crypto = require('crypto');

function uuidv4() { return crypto.randomUUID(); }

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(express.static(__dirname));

// ═══════════════════════════════════════════════════════
//  IN-MEMORY DATA — Models, Tools, Agents, Policies
// ═══════════════════════════════════════════════════════

// --- Model Deployments ---
const deployments = [
  { id: 'gpt-5.2', name: 'gpt-5.2', model: 'gpt-5.2', provider: 'OpenAI', region: 'eastus', tpm: 120000, rpm: 600, enabled: true, createdAt: new Date().toISOString() },
  { id: 'gpt-4o', name: 'gpt-4o', model: 'gpt-4o', provider: 'Azure OpenAI', region: 'eastus2', tpm: 80000, rpm: 480, enabled: true, createdAt: new Date().toISOString() },
  { id: 'claude-sonnet-4.5', name: 'claude-sonnet-4.5', model: 'claude-sonnet-4.5', provider: 'Anthropic', region: 'westus', tpm: 60000, rpm: 300, enabled: true, createdAt: new Date().toISOString() },
  { id: 'llama-3.3-70b', name: 'llama-3.3-70b', model: 'llama-3.3-70b', provider: 'Meta', region: 'eastus', tpm: 50000, rpm: 200, enabled: true, createdAt: new Date().toISOString() },
  { id: 'mistral-large', name: 'mistral-large', model: 'mistral-large', provider: 'Mistral', region: 'westeurope', tpm: 40000, rpm: 150, enabled: false, createdAt: new Date().toISOString() },
];

const modelResponses = {
  'gpt-5.2': (prompt) => {
    if (prompt.toLowerCase().includes('customer') || prompt.toLowerCase().includes('crm'))
      return { content: "I'll check the CRM for the latest customer records.\n\n**Tool call: Salesforce CRM** → `query_contacts`\n\nFound 3 matching contacts:\n| Name | Company | Last Activity |\n|------|---------|---------------|\n| Sarah Chen | Contoso Ltd | 2 days ago |\n| Mike Johnson | Fabrikam Inc | 1 week ago |\n| Lisa Park | Northwind | Today |\n\nWould you like me to pull detailed activity logs for any of these contacts?", promptTokens: Math.floor(prompt.length / 4) + 12, completionTokens: 185 };
    if (prompt.toLowerCase().includes('weather'))
      return { content: "Let me check the weather for you.\n\n**Tool call: Weather API** → `get_forecast`\n\n🌤 **Current conditions in Seattle, WA:**\n- Temperature: 58°F (14°C)\n- Condition: Partly cloudy\n- Wind: 8 mph NW\n- Humidity: 62%\n\n**3-day forecast:**\n- Tomorrow: 🌧 Rain, 54°F\n- Wednesday: ⛅ Clouds, 56°F\n- Thursday: ☀️ Sunny, 61°F", promptTokens: Math.floor(prompt.length / 4) + 10, completionTokens: 142 };
    if (prompt.toLowerCase().includes('ticket') || prompt.toLowerCase().includes('issue'))
      return { content: "I'll create that ticket for you.\n\n**Tool call: ServiceNow ITSM** → `create_incident`\n\n✅ **Incident Created**\n- ID: INC0042198\n- Priority: P2 - High\n- Assigned to: Platform Engineering\n- SLA: 4 hours\n\nThe team has been notified. Would you like to add any additional context?", promptTokens: Math.floor(prompt.length / 4) + 10, completionTokens: 120 };
    return { content: "Based on my analysis, here are the key insights:\n\n1. **Data patterns** suggest a 15% improvement opportunity\n2. **Recommendation**: Consolidate the three existing workflows into a single automated pipeline\n3. **Risk**: Low — this follows the same pattern we used in Q3\n\nWould you like me to draft an implementation plan?", promptTokens: Math.floor(prompt.length / 4) + 10, completionTokens: 95 };
  },
  'gpt-4o': (prompt) => ({
    content: `Here's my analysis:\n\n${prompt.toLowerCase().includes('code') ? '```javascript\nasync function processRequest(req) {\n  const gateway = await getGatewayConfig();\n  const result = await gateway.route(req);\n  return result;\n}\n```\n\nThis implements the gateway routing pattern.' : 'The approach involves analyzing the current state, identifying optimization opportunities, and implementing targeted improvements. Key metrics to track include latency, throughput, and error rates.'}`,
    promptTokens: Math.floor(prompt.length / 4) + 8,
    completionTokens: Math.floor(Math.random() * 100) + 60
  }),
  'claude-sonnet-4.5': (prompt) => ({
    content: `I'd approach this systematically.\n\n**Step 1:** Assess the current architecture and identify bottlenecks\n**Step 2:** Design the optimization strategy\n**Step 3:** Implement with feature flags for safe rollout\n\n${prompt.toLowerCase().includes('agent') ? 'For agent orchestration specifically, I recommend a chain-of-thought routing approach where the gateway evaluates intent before dispatching to specialized sub-agents.' : 'The key principle is to make changes incrementally and measure impact at each stage.'}`,
    promptTokens: Math.floor(prompt.length / 4) + 15,
    completionTokens: Math.floor(Math.random() * 120) + 80
  }),
};

function generateCompletion(deploymentId, messages) {
  const deployment = deployments.find(d => d.id === deploymentId);
  const model = deployment ? deployment.model : 'gpt-5.2';
  const generator = modelResponses[model] || modelResponses['gpt-5.2'];
  const lastMessage = messages[messages.length - 1];
  return generator(lastMessage ? lastMessage.content : '');
}

// --- MCP Tools Registry ---
const tools = [
  { id: 'tool-salesforce', name: 'Salesforce CRM', description: 'CRM data access and operations', type: 'Remote MCP', endpoint: 'https://mcp.salesforce.com/sse', governedEndpoint: 'https://ai-governance.foundry.azure.com/tools/salesforce/mcp/sse', auth: 'oauth', status: 'Connected', calls: 1245, avgLatencyMs: 180, enabled: true, namespace: 'default', createdAt: new Date().toISOString() },
  { id: 'tool-github', name: 'GitHub', description: 'Code repository operations and CI/CD', type: 'Remote MCP', endpoint: 'https://mcp.github.com/sse', governedEndpoint: 'https://ai-governance.foundry.azure.com/tools/github/mcp/sse', auth: 'key', status: 'Connected', calls: 3420, avgLatencyMs: 120, enabled: true, namespace: 'engineering', createdAt: new Date().toISOString() },
  { id: 'tool-servicenow', name: 'ServiceNow ITSM', description: 'IT service management', type: 'Remote MCP', endpoint: 'https://mcp.servicenow.com/sse', governedEndpoint: 'https://ai-governance.foundry.azure.com/tools/servicenow/mcp/sse', auth: 'oauth', status: 'Connected', calls: 892, avgLatencyMs: 220, enabled: true, namespace: 'default', createdAt: new Date().toISOString() },
  { id: 'tool-azure-sql', name: 'Azure SQL', description: 'SQL database queries', type: 'Local MCP', endpoint: 'localhost:5432/mcp', governedEndpoint: 'https://ai-governance.foundry.azure.com/tools/azure-sql/mcp/sse', auth: 'managed-identity', status: 'Connected', calls: 5600, avgLatencyMs: 45, enabled: true, namespace: 'data', createdAt: new Date().toISOString() },
  { id: 'tool-cosmos', name: 'Azure Cosmos DB', description: 'NoSQL document store', type: 'Local MCP', endpoint: 'localhost:8081/mcp', governedEndpoint: 'https://ai-governance.foundry.azure.com/tools/cosmos/mcp/sse', auth: 'managed-identity', status: 'Connected', calls: 4200, avgLatencyMs: 35, enabled: true, namespace: 'data', createdAt: new Date().toISOString() },
  { id: 'tool-databricks', name: 'Databricks', description: 'Data analytics and ML pipelines', type: 'Remote MCP', endpoint: 'https://mcp.databricks.com/sse', governedEndpoint: 'https://ai-governance.foundry.azure.com/tools/databricks/mcp/sse', auth: 'oauth', status: 'Pending', calls: 0, avgLatencyMs: 0, enabled: false, namespace: 'data', createdAt: new Date().toISOString() },
  { id: 'tool-elasticsearch', name: 'Elasticsearch', description: 'Full-text search and analytics', type: 'Remote MCP', endpoint: 'https://mcp.elastic.co/sse', governedEndpoint: 'https://ai-governance.foundry.azure.com/tools/elasticsearch/mcp/sse', auth: 'key', status: 'Connected', calls: 2100, avgLatencyMs: 65, enabled: true, namespace: 'engineering', createdAt: new Date().toISOString() },
  { id: 'tool-pinecone', name: 'Pinecone', description: 'Vector database for embeddings', type: 'Remote MCP', endpoint: 'https://mcp.pinecone.io/sse', governedEndpoint: 'https://ai-governance.foundry.azure.com/tools/pinecone/mcp/sse', auth: 'key', status: 'Connected', calls: 980, avgLatencyMs: 55, enabled: true, namespace: 'data', createdAt: new Date().toISOString() },
];

// --- Agents Registry ---
const agents = [
  { id: 'agent-customer-support', name: 'Customer Support Bot', model: 'gpt-5.2', tools: ['tool-salesforce', 'tool-servicenow'], status: 'Active', invocations: 12450, avgLatencyMs: 850, createdAt: new Date().toISOString() },
  { id: 'agent-code-review', name: 'Code Review Agent', model: 'claude-sonnet-4.5', tools: ['tool-github'], status: 'Active', invocations: 8900, avgLatencyMs: 1200, createdAt: new Date().toISOString() },
  { id: 'agent-data-analyst', name: 'Data Analyst', model: 'gpt-4o', tools: ['tool-azure-sql', 'tool-databricks', 'tool-cosmos'], status: 'Active', invocations: 5600, avgLatencyMs: 950, createdAt: new Date().toISOString() },
  { id: 'agent-search', name: 'Enterprise Search', model: 'gpt-4o', tools: ['tool-elasticsearch', 'tool-pinecone'], status: 'Active', invocations: 15200, avgLatencyMs: 450, createdAt: new Date().toISOString() },
  { id: 'agent-devops', name: 'DevOps Copilot', model: 'gpt-5.2', tools: ['tool-github', 'tool-servicenow'], status: 'Draft', invocations: 0, avgLatencyMs: 0, createdAt: new Date().toISOString() },
];

// --- Governance Policies ---
const policies = [
  { id: 'pol-content-safety', name: 'Content Safety', type: 'runtime', scope: 'All models', enabled: true, violations: 342, description: 'Block harmful, violent, or exploitative content', config: { blockedPatterns: ['harm', 'violence', 'exploit', 'illegal', 'hack someone', 'bypass security'] } },
  { id: 'pol-pii-masking', name: 'PII Masking', type: 'runtime', scope: 'All tools', enabled: true, violations: 127, description: 'Mask PII in tool inputs/outputs', config: { patterns: ['email', 'phone', 'ssn', 'credit_card'] } },
  { id: 'pol-rate-limit', name: 'Rate Limiting', type: 'runtime', scope: 'Per deployment', enabled: true, violations: 89, description: 'Enforce request/token rate limits', config: { requestsPerMinute: 60, tokensPerMinute: 100000 } },
  { id: 'pol-prompt-protection', name: 'Prompt Protection', type: 'runtime', scope: 'All models', enabled: true, violations: 56, description: 'Detect and block prompt injection/jailbreak attempts', config: { sensitivity: 'medium' } },
  { id: 'pol-copyright', name: 'Copyright Protection', type: 'runtime', scope: 'All models', enabled: false, violations: 0, description: 'Prevent generation of copyrighted content', config: {} },
  { id: 'pol-tool-approval', name: 'Tool Approval Gate', type: 'design-time', scope: 'All tools', enabled: true, violations: 0, description: 'Require admin approval before tools can be used in production', config: {} },
];

// ═══════════════════════════════════════════════════════
//  GATEWAY — Rate Limiting, Content Safety, Caching
// ═══════════════════════════════════════════════════════

let gatewayConfig = {
  rateLimiting: { enabled: true, requestsPerMinute: 60, tokensPerMinute: 100000 },
  semanticCaching: { enabled: true, ttlSeconds: 300 },
  contentSafety: { enabled: true, blockedPatterns: ['harm', 'violence', 'exploit', 'illegal', 'hack someone', 'bypass security'] },
  piiMasking: { enabled: true, patterns: ['email', 'phone', 'ssn', 'credit_card'] },
  loadBalancing: { enabled: true, strategy: 'round-robin' },
};

const rateLimitBuckets = {};
const semanticCache = new Map();
let rrIndex = 0;

function checkContentSafety(messages) {
  if (!gatewayConfig.contentSafety.enabled) return { safe: true, patternsChecked: 0 };
  const text = messages.map(m => m.content).join(' ').toLowerCase();
  for (const pattern of gatewayConfig.contentSafety.blockedPatterns) {
    if (text.includes(pattern.toLowerCase())) {
      return { safe: false, reason: `Content blocked: matched pattern "${pattern}"`, patternsChecked: gatewayConfig.contentSafety.blockedPatterns.length };
    }
  }
  return { safe: true, patternsChecked: gatewayConfig.contentSafety.blockedPatterns.length };
}

function checkPII(text) {
  if (!gatewayConfig.piiMasking.enabled) return { found: 0, masked: false };
  let count = 0;
  const emailRegex = /[\w.-]+@[\w.-]+\.\w+/g;
  const phoneRegex = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g;
  const ssnRegex = /\b\d{3}-\d{2}-\d{4}\b/g;
  if (emailRegex.test(text)) count++;
  if (phoneRegex.test(text)) count++;
  if (ssnRegex.test(text)) count++;
  return { found: count, masked: count > 0 };
}

function checkRateLimit(apiKey) {
  if (!gatewayConfig.rateLimiting.enabled) return { allowed: true };
  const key = apiKey || 'default';
  const now = Date.now();
  if (!rateLimitBuckets[key] || (now - rateLimitBuckets[key].windowStart) > 60000) {
    rateLimitBuckets[key] = { count: 0, tokens: 0, windowStart: now };
  }
  const bucket = rateLimitBuckets[key];
  if (bucket.count >= gatewayConfig.rateLimiting.requestsPerMinute) {
    return { allowed: false, reason: `Rate limit exceeded: ${gatewayConfig.rateLimiting.requestsPerMinute} RPM` };
  }
  bucket.count++;
  return { allowed: true, bucket };
}

// ═══════════════════════════════════════════════════════
//  METRICS COLLECTOR
// ═══════════════════════════════════════════════════════

const metrics = {
  totalRequests: 156234,
  successfulRequests: 151890,
  failedRequests: 1102,
  rateLimitedRequests: 89,
  blockedRequests: 342,
  cacheHits: 18420,
  cacheMisses: 133470,
  totalPromptTokens: 42500000,
  totalCompletionTokens: 28700000,
  totalLatencyMs: 0,
  piiDetections: 127,
  promptInjectionBlocks: 56,
  requestsPerModel: {
    'gpt-5.2': { total: 62100, success: 61200, failed: 900, tokens: 31000000 },
    'gpt-4o': { total: 48900, success: 48100, failed: 800, tokens: 18500000 },
    'claude-sonnet-4.5': { total: 28400, success: 27800, failed: 600, tokens: 14200000 },
    'llama-3.3-70b': { total: 16834, success: 14790, failed: 2044, tokens: 7500000 },
  },
  requestLog: [],
};

const activityLog = [];
const MAX_LOG = 500;

function recordRequest(entry) {
  metrics.totalRequests++;
  if (entry.status === 'success') metrics.successfulRequests++;
  else if (entry.status === 'rate_limited') { metrics.failedRequests++; metrics.rateLimitedRequests++; }
  else if (entry.status === 'blocked') { metrics.failedRequests++; metrics.blockedRequests++; }
  else metrics.failedRequests++;
  if (entry.cached) metrics.cacheHits++;
  else if (entry.status === 'success') metrics.cacheMisses++;
  metrics.totalPromptTokens += entry.promptTokens || 0;
  metrics.totalCompletionTokens += entry.completionTokens || 0;
  metrics.totalLatencyMs += entry.latencyMs || 0;
  if (entry.piiDetected) metrics.piiDetections++;

  if (entry.model && metrics.requestsPerModel[entry.model]) {
    metrics.requestsPerModel[entry.model].total++;
    if (entry.status === 'success') metrics.requestsPerModel[entry.model].success++;
    else metrics.requestsPerModel[entry.model].failed++;
    metrics.requestsPerModel[entry.model].tokens += (entry.promptTokens || 0) + (entry.completionTokens || 0);
  }

  const logEntry = {
    id: `req-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
    ...entry
  };
  metrics.requestLog.push(logEntry);
  if (metrics.requestLog.length > MAX_LOG) metrics.requestLog = metrics.requestLog.slice(-MAX_LOG);

  activityLog.push({
    id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
    type: entry.blocked ? 'violation' : entry.rateLimited ? 'rate_limit' : entry.toolCall ? 'tool_call' : 'request',
    severity: entry.blocked ? 'critical' : entry.rateLimited ? 'warning' : 'info',
    message: entry.blocked ? `Content safety: ${entry.blockReason || 'blocked'}` :
             entry.rateLimited ? `Rate limit exceeded for ${entry.model || 'unknown'}` :
             entry.toolCall ? `Tool invocation: ${entry.toolName}` :
             `${entry.model}: ${entry.status} (${entry.latencyMs}ms)`,
    model: entry.model,
    details: entry
  });
  if (activityLog.length > MAX_LOG) activityLog.splice(0, activityLog.length - MAX_LOG);
}

// ═══════════════════════════════════════════════════════
//  API ROUTES
// ═══════════════════════════════════════════════════════

// --- Gateway Chat Completion (OpenAI-compatible) ---
app.post('/api/chat/completions', async (req, res) => {
  const startTime = Date.now();
  const { messages, model: requestedModel, temperature, max_tokens } = req.body;
  const apiKey = req.headers['api-key'] || req.headers['authorization'] || 'playground';

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: { message: 'messages array is required' } });
  }

  // 1. Content Safety
  const safety = checkContentSafety(messages);
  if (!safety.safe) {
    const latency = Date.now() - startTime;
    recordRequest({ model: requestedModel, status: 'blocked', latencyMs: latency, blocked: true, blockReason: safety.reason });
    const pol = policies.find(p => p.id === 'pol-content-safety');
    if (pol) pol.violations++;
    return res.status(400).json({
      error: { message: safety.reason, type: 'content_filter_error', code: 'content_filter' },
      _gateway: { latencyMs: latency, contentSafety: 'BLOCKED', piiFields: 0, cached: false }
    });
  }

  // 2. PII Check
  const userText = messages.map(m => m.content).join(' ');
  const pii = checkPII(userText);
  if (pii.found > 0) {
    const pol = policies.find(p => p.id === 'pol-pii-masking');
    if (pol) pol.violations++;
  }

  // 3. Rate Limiting
  const rateCheck = checkRateLimit(apiKey);
  if (!rateCheck.allowed) {
    const latency = Date.now() - startTime;
    recordRequest({ model: requestedModel, status: 'rate_limited', latencyMs: latency, rateLimited: true });
    const pol = policies.find(p => p.id === 'pol-rate-limit');
    if (pol) pol.violations++;
    return res.status(429).json({
      error: { message: rateCheck.reason, type: 'rate_limit_error' },
      _gateway: { latencyMs: latency, contentSafety: 'PASSED', rateLimited: true }
    });
  }

  // 4. Semantic Cache
  const cacheKey = messages.map(m => `${m.role}:${m.content}`).join('|');
  if (gatewayConfig.semanticCaching.enabled && semanticCache.has(cacheKey)) {
    const cached = semanticCache.get(cacheKey);
    if (Date.now() - cached.timestamp < gatewayConfig.semanticCaching.ttlSeconds * 1000) {
      const latency = Date.now() - startTime;
      recordRequest({ model: cached.model, status: 'success', latencyMs: latency, promptTokens: cached.usage.prompt_tokens, completionTokens: cached.usage.completion_tokens, cached: true });
      return res.json({
        ...cached.response,
        _gateway: { latencyMs: latency, contentSafety: 'PASSED', piiFields: pii.found, cached: true, model: cached.model, patternsChecked: safety.patternsChecked }
      });
    }
    semanticCache.delete(cacheKey);
  }

  // 5. Pick deployment (load balance)
  const modelId = requestedModel || 'gpt-5.2';
  const enabled = deployments.filter(d => d.enabled);
  let target = enabled.find(d => d.id === modelId || d.model === modelId);
  if (!target && enabled.length > 0) {
    target = enabled[rrIndex % enabled.length];
    rrIndex++;
  }
  if (!target) {
    return res.status(503).json({ error: { message: 'No enabled model deployments available' } });
  }

  // 6. Simulate latency
  const simulatedLatency = Math.floor(Math.random() * 400) + 200;
  await new Promise(r => setTimeout(r, simulatedLatency));

  // 7. Generate response
  const result = generateCompletion(target.id, messages);
  const totalLatency = Date.now() - startTime;

  // Detect tool calls in the response for enhanced gateway annotations
  const hasToolCall = result.content.includes('**Tool call:');
  const toolMatch = result.content.match(/\*\*Tool call: (.+?)\*\*/);
  const toolName = toolMatch ? toolMatch[1] : null;

  if (hasToolCall && toolName) {
    const tool = tools.find(t => t.name === toolName);
    if (tool) {
      tool.calls++;
      recordRequest({ model: target.model, status: 'success', latencyMs: tool.avgLatencyMs, toolCall: true, toolName: tool.name });
    }
  }

  const response = {
    id: `chatcmpl-${uuidv4().slice(0, 12)}`,
    object: 'chat.completion',
    created: Math.floor(Date.now() / 1000),
    model: target.model,
    choices: [{
      index: 0,
      message: { role: 'assistant', content: result.content },
      finish_reason: 'stop'
    }],
    usage: {
      prompt_tokens: result.promptTokens,
      completion_tokens: result.completionTokens,
      total_tokens: result.promptTokens + result.completionTokens
    },
    _gateway: {
      deployment: target.id,
      region: target.region,
      latencyMs: totalLatency,
      contentSafety: 'PASSED',
      piiFields: pii.found,
      cached: false,
      model: target.model,
      patternsChecked: safety.patternsChecked,
      toolCall: hasToolCall ? toolName : null,
      tokensUsed: result.promptTokens + result.completionTokens
    }
  };

  // Update rate limit tokens
  if (rateCheck.bucket) rateCheck.bucket.tokens += response.usage.total_tokens;

  // Cache
  if (gatewayConfig.semanticCaching.enabled) {
    semanticCache.set(cacheKey, { response, model: target.model, usage: response.usage, timestamp: Date.now() });
  }

  recordRequest({ model: target.model, status: 'success', latencyMs: totalLatency, promptTokens: result.promptTokens, completionTokens: result.completionTokens, cached: false, piiDetected: pii.found > 0 });
  res.json(response);
});

// --- Tool Invocation (through gateway) ---
app.post('/api/tools/:id/invoke', (req, res) => {
  const tool = tools.find(t => t.id === req.params.id);
  if (!tool) return res.status(404).json({ error: 'Tool not found' });
  if (!tool.enabled) return res.status(403).json({ error: `Tool "${tool.name}" is disabled. Requires admin approval.` });

  const latency = Math.floor(Math.random() * 200) + (tool.avgLatencyMs || 50);
  setTimeout(() => {
    tool.calls++;
    recordRequest({ model: 'tool', status: 'success', latencyMs: latency, toolCall: true, toolName: tool.name });
    res.json({
      result: { message: `Response from ${tool.name}`, input: req.body.input, latencyMs: latency },
      _gateway: { tool: tool.name, governedEndpoint: tool.governedEndpoint, latencyMs: latency, contentSafety: 'PASSED', piiFields: 0 }
    });
  }, Math.min(latency, 500));
});

// --- Metrics ---
app.get('/api/metrics', (req, res) => {
  const avgLatency = metrics.totalRequests > 0 ? Math.round(metrics.totalLatencyMs / Math.max(metrics.totalRequests - 156234, 1)) : 320;
  const cacheHitRate = (metrics.cacheHits + metrics.cacheMisses) > 0 ? Math.round((metrics.cacheHits / (metrics.cacheHits + metrics.cacheMisses)) * 100) : 12;
  res.json({
    ...metrics,
    avgLatencyMs: avgLatency || 320,
    cacheHitRate,
    totalTokens: metrics.totalPromptTokens + metrics.totalCompletionTokens,
    recentRequests: metrics.requestLog.slice(-50)
  });
});

app.post('/api/metrics/reset', (req, res) => {
  metrics.totalRequests = 0; metrics.successfulRequests = 0; metrics.failedRequests = 0;
  metrics.rateLimitedRequests = 0; metrics.blockedRequests = 0;
  metrics.cacheHits = 0; metrics.cacheMisses = 0;
  metrics.totalPromptTokens = 0; metrics.totalCompletionTokens = 0;
  metrics.totalLatencyMs = 0; metrics.piiDetections = 0; metrics.promptInjectionBlocks = 0;
  metrics.requestsPerModel = {}; metrics.requestLog = [];
  activityLog.length = 0;
  res.status(204).end();
});

// --- Activity Log ---
app.get('/api/activity', (req, res) => {
  const type = req.query.type;
  const severity = req.query.severity;
  let result = [...activityLog];
  if (type) result = result.filter(a => a.type === type);
  if (severity) result = result.filter(a => a.severity === severity);
  res.json(result.slice(-100).reverse());
});

// --- Deployments CRUD ---
app.get('/api/deployments', (req, res) => res.json(deployments));
app.post('/api/deployments', (req, res) => {
  const d = { id: req.body.name?.toLowerCase().replace(/\s+/g, '-') || `dep-${Date.now()}`, ...req.body, enabled: true, createdAt: new Date().toISOString() };
  deployments.push(d);
  res.status(201).json(d);
});

// --- Tools CRUD ---
app.get('/api/tools', (req, res) => {
  let result = [...tools];
  if (req.query.namespace) result = result.filter(t => t.namespace === req.query.namespace);
  if (req.query.type) result = result.filter(t => t.type === req.query.type);
  if (req.query.status) result = result.filter(t => t.status === req.query.status);
  res.json(result);
});
app.get('/api/tools/:id', (req, res) => {
  const t = tools.find(t => t.id === req.params.id);
  t ? res.json(t) : res.status(404).json({ error: 'Not found' });
});
app.post('/api/tools', (req, res) => {
  const t = {
    id: `tool-${Date.now().toString(36)}`,
    name: req.body.name,
    description: req.body.description || '',
    type: req.body.type || 'Remote MCP',
    endpoint: req.body.endpoint || '',
    governedEndpoint: `https://ai-governance.foundry.azure.com/tools/${(req.body.name || '').toLowerCase().replace(/\s+/g, '-')}/mcp/sse`,
    auth: req.body.auth || 'none',
    status: 'Pending',
    calls: 0, avgLatencyMs: 0, enabled: false,
    namespace: req.body.namespace || 'default',
    createdAt: new Date().toISOString()
  };
  tools.push(t);
  res.status(201).json(t);
});

// --- Agents CRUD ---
app.get('/api/agents', (req, res) => res.json(agents));
app.get('/api/agents/:id', (req, res) => {
  const a = agents.find(a => a.id === req.params.id);
  a ? res.json(a) : res.status(404).json({ error: 'Not found' });
});
app.post('/api/agents', (req, res) => {
  const a = {
    id: `agent-${Date.now().toString(36)}`,
    name: req.body.name, model: req.body.model || 'gpt-5.2',
    tools: req.body.tools || [], status: 'Draft',
    invocations: 0, avgLatencyMs: 0, createdAt: new Date().toISOString()
  };
  agents.push(a);
  res.status(201).json(a);
});

// --- Policies CRUD ---
app.get('/api/policies', (req, res) => res.json(policies));
app.patch('/api/policies/:id', (req, res) => {
  const p = policies.find(p => p.id === req.params.id);
  if (!p) return res.status(404).json({ error: 'Not found' });
  if (req.body.enabled !== undefined) p.enabled = req.body.enabled;
  if (req.body.config) Object.assign(p.config, req.body.config);

  // Sync policy changes to gateway config
  if (p.id === 'pol-content-safety') gatewayConfig.contentSafety.enabled = p.enabled;
  if (p.id === 'pol-pii-masking') gatewayConfig.piiMasking.enabled = p.enabled;
  if (p.id === 'pol-rate-limit') {
    gatewayConfig.rateLimiting.enabled = p.enabled;
    if (req.body.config?.requestsPerMinute) gatewayConfig.rateLimiting.requestsPerMinute = req.body.config.requestsPerMinute;
  }

  res.json(p);
});

// --- Gateway Config ---
app.get('/api/gateway/config', (req, res) => res.json(gatewayConfig));
app.put('/api/gateway/config', (req, res) => {
  if (req.body.rateLimiting) Object.assign(gatewayConfig.rateLimiting, req.body.rateLimiting);
  if (req.body.semanticCaching) Object.assign(gatewayConfig.semanticCaching, req.body.semanticCaching);
  if (req.body.contentSafety) Object.assign(gatewayConfig.contentSafety, req.body.contentSafety);
  if (req.body.piiMasking) Object.assign(gatewayConfig.piiMasking, req.body.piiMasking);
  if (req.body.loadBalancing) Object.assign(gatewayConfig.loadBalancing, req.body.loadBalancing);
  res.json(gatewayConfig);
});

// --- Health ---
app.get('/api/health', (req, res) => res.json({ status: 'healthy', uptime: process.uptime(), timestamp: new Date().toISOString() }));

// SPA fallback
app.get('/{*splat}', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

app.listen(PORT, () => {
  console.log(`\n🚀 Azure AI Foundry Experience running at http://localhost:${PORT}`);
  console.log(`   Dashboard:    http://localhost:${PORT}`);
  console.log(`   Gateway API:  POST http://localhost:${PORT}/api/chat/completions`);
  console.log(`   Metrics:      GET  http://localhost:${PORT}/api/metrics`);
  console.log(`   Tools:        GET  http://localhost:${PORT}/api/tools`);
  console.log(`   Activity:     GET  http://localhost:${PORT}/api/activity\n`);
});
