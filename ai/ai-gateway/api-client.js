// ═══════════════════════════════════════════════════════
//  api-client.js — Wires the AI Gateway UI to the live backend
//  Replaces hardcoded interactions with real API calls
// ═══════════════════════════════════════════════════════

(function () {
  'use strict';

  var API_BASE = '';

  // ───────── AGENT PLAYGROUND — Live Chat via Gateway ─────────

  var aeChatInput = document.getElementById('ae-chat-input');
  var aeSendBtn = document.getElementById('ae-send-btn');
  var aeChatArea = document.getElementById('ae-chat-area');

  // Get selected model from the agent editor
  function getSelectedModel() {
    var modelSelect = document.querySelector('.ae-model-select');
    if (modelSelect) return modelSelect.value;
    var modelLabel = document.querySelector('.ae-model-name');
    if (modelLabel) return modelLabel.textContent.trim();
    return 'gpt-5.2';
  }

  // Collect conversation history from chat area
  function collectMessages() {
    var messages = [];
    var systemEl = aeChatArea.querySelector('.ae-chat-system');
    if (systemEl) {
      messages.push({ role: 'system', content: systemEl.textContent.replace(/^System\s*/, '').trim() });
    }
    aeChatArea.querySelectorAll('.ae-chat-bubble').forEach(function (bubble) {
      if (bubble.classList.contains('user')) {
        messages.push({ role: 'user', content: bubble.textContent.trim() });
      } else if (bubble.classList.contains('assistant')) {
        var p = bubble.querySelector('p');
        if (p) messages.push({ role: 'assistant', content: p.textContent.trim() });
      }
    });
    return messages;
  }

  function sendChatMessage() {
    var text = aeChatInput.value.trim();
    if (!text) return;

    // Add user bubble
    var userBubble = document.createElement('div');
    userBubble.className = 'ae-chat-bubble user';
    userBubble.textContent = text;
    aeChatArea.appendChild(userBubble);
    aeChatInput.value = '';
    aeChatArea.scrollTop = aeChatArea.scrollHeight;

    // Show typing indicator
    var typingEl = document.createElement('div');
    typingEl.className = 'ae-chat-bubble assistant ae-typing';
    typingEl.innerHTML = '<p style="color:var(--muted);font-style:italic">⏳ Routing through AI Gateway...</p>';
    aeChatArea.appendChild(typingEl);
    aeChatArea.scrollTop = aeChatArea.scrollHeight;

    // Collect message history and include the new message
    var messages = collectMessages();
    messages.push({ role: 'user', content: text });

    var model = getSelectedModel();

    fetch(API_BASE + '/api/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: messages, model: model })
    })
    .then(function (resp) { return resp.json(); })
    .then(function (data) {
      // Remove typing indicator
      if (typingEl.parentNode) typingEl.parentNode.removeChild(typingEl);

      if (data.error) {
        // Gateway blocked/rate limited
        var errorBubble = document.createElement('div');
        errorBubble.className = 'ae-chat-bubble assistant';
        var errorType = data.error.code === 'content_filter' ? '🚫 Content Safety' : '⚠️ Gateway Error';
        errorBubble.innerHTML =
          '<p style="color:#ff8ea3"><strong>' + errorType + '</strong><br>' + escapeHtml(data.error.message) + '</p>' +
          buildGatewayBadges(data._gateway || {});
        aeChatArea.appendChild(errorBubble);
      } else {
        // Successful response
        var content = data.choices[0].message.content;
        var gw = data._gateway || {};
        var usage = data.usage || {};

        var assistBubble = document.createElement('div');
        assistBubble.className = 'ae-chat-bubble assistant';

        // Render markdown-like content
        var renderedContent = renderContent(content);
        assistBubble.innerHTML = renderedContent + buildGatewayBadges(gw, usage);
        aeChatArea.appendChild(assistBubble);
      }

      aeChatArea.scrollTop = aeChatArea.scrollHeight;
      updateLiveMetrics();
    })
    .catch(function (err) {
      if (typingEl.parentNode) typingEl.parentNode.removeChild(typingEl);
      var errBubble = document.createElement('div');
      errBubble.className = 'ae-chat-bubble assistant';
      errBubble.innerHTML = '<p style="color:#ff8ea3">⚠️ Network error: ' + escapeHtml(err.message) + '</p>';
      aeChatArea.appendChild(errBubble);
      aeChatArea.scrollTop = aeChatArea.scrollHeight;
    });
  }

  function buildGatewayBadges(gw, usage) {
    var latency = gw.latencyMs ? (gw.latencyMs / 1000).toFixed(1) + 's' : '—';
    var tokens = usage ? usage.total_tokens : (gw.tokensUsed || 0);
    var pii = gw.piiFields || 0;
    var safety = gw.contentSafety || 'PASSED';
    var cached = gw.cached ? '⚡ Cached' : '';
    var tool = gw.toolCall ? '🔧 ' + gw.toolCall : '';

    var badges = '<div class="ae-gateway-annotations">';
    badges += '<span class="ae-gateway-badge pii">🛡 PII: ' + pii + ' field' + (pii !== 1 ? 's' : '') + '</span>';
    badges += '<span class="ae-gateway-badge latency">⏱ ' + latency + '</span>';
    badges += '<span class="ae-gateway-badge tokens">📊 ' + tokens.toLocaleString() + ' tokens</span>';
    badges += '<span class="ae-gateway-badge content">' + (safety === 'PASSED' ? '✅' : '🚫') + ' Content: ' + safety + '</span>';
    if (cached) badges += '<span class="ae-gateway-badge cached">' + cached + '</span>';
    if (tool) badges += '<span class="ae-gateway-badge tool">' + tool + '</span>';
    badges += '</div>';
    return badges;
  }

  function renderContent(text) {
    // Basic markdown: bold, code blocks, tables, bullet points
    var html = escapeHtml(text);

    // Code blocks
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, function (m, lang, code) {
      return '<pre class="ae-code-block"><code>' + code.trim() + '</code></pre>';
    });

    // Bold
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    // Tables (simple)
    var lines = html.split('\n');
    var inTable = false;
    var tableHtml = '';
    var result = [];
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      if (line.match(/^\|.*\|$/)) {
        if (!inTable) {
          inTable = true;
          tableHtml = '<table class="ae-inline-table">';
        }
        if (line.match(/^\|[\s-|]+\|$/)) continue; // separator row
        var cells = line.split('|').filter(function (c) { return c.trim() !== ''; });
        tableHtml += '<tr>' + cells.map(function (c) { return '<td>' + c.trim() + '</td>'; }).join('') + '</tr>';
      } else {
        if (inTable) {
          tableHtml += '</table>';
          result.push(tableHtml);
          tableHtml = '';
          inTable = false;
        }
        result.push(line);
      }
    }
    if (inTable) {
      tableHtml += '</table>';
      result.push(tableHtml);
    }
    html = result.join('\n');

    // Newlines to <br> (but not inside tags)
    html = html.replace(/\n/g, '<br>');

    return '<div class="ae-response-content">' + html + '</div>';
  }

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // Override the existing send handler
  if (aeSendBtn && aeChatInput) {
    // Remove old event listeners by cloning
    var newSendBtn = aeSendBtn.cloneNode(true);
    aeSendBtn.parentNode.replaceChild(newSendBtn, aeSendBtn);
    aeSendBtn = newSendBtn;

    var newChatInput = aeChatInput.cloneNode(true);
    aeChatInput.parentNode.replaceChild(newChatInput, aeChatInput);
    aeChatInput = newChatInput;

    aeSendBtn.addEventListener('click', sendChatMessage);
    aeChatInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendChatMessage();
      }
    });
  }

  // ───────── OPERATE OVERVIEW — Live Metrics ─────────

  function updateLiveMetrics() {
    fetch(API_BASE + '/api/metrics')
      .then(function (r) { return r.json(); })
      .then(function (m) {
        // KPI: Behaviors prevented = blocked + rate limited
        var prevented = m.blockedRequests + m.rateLimitedRequests + m.piiDetections + m.promptInjectionBlocks;
        updateKpiValue('Behaviors prevented', prevented.toLocaleString());

        // KPI: Agent runs = total requests
        updateKpiValue('Agent runs', m.totalRequests.toLocaleString());

        // KPI: Agent success rate
        var successRate = m.totalRequests > 0
          ? ((m.successfulRequests / m.totalRequests) * 100).toFixed(1)
          : '0.0';
        updateKpiValue('Agent success rate', successRate);

        // Update issues count from activity log
        updateActivityLog();
      })
      .catch(function () {});
  }

  function updateKpiValue(label, value) {
    var cards = document.querySelectorAll('.ov-kpi-card');
    for (var i = 0; i < cards.length; i++) {
      var labelEl = cards[i].querySelector('.ov-kpi-label');
      if (labelEl && labelEl.textContent.trim() === label) {
        var valueEl = cards[i].querySelector('.ov-kpi-value');
        if (valueEl) valueEl.textContent = value;
        break;
      }
    }
  }

  function updateActivityLog() {
    fetch(API_BASE + '/api/activity')
      .then(function (r) { return r.json(); })
      .then(function (events) {
        if (!events.length) return;

        // Update the issues header count
        var criticals = events.filter(function (e) { return e.severity === 'critical'; }).length;
        var warnings = events.filter(function (e) { return e.severity === 'warning'; }).length;

        var issuesTitle = document.querySelector('.ov-issues-title strong');
        if (issuesTitle) {
          var totalIssues = Math.max(events.length, 10);
          issuesTitle.textContent = totalIssues + ' Issues';
        }

        // Add new activity entries to the issues table
        var tbody = document.querySelector('.ov-issues-table tbody');
        if (!tbody) return;

        // Add new gateway events as rows (prepend up to 3 newest)
        var newEvents = events.slice(0, 3);
        for (var i = newEvents.length - 1; i >= 0; i--) {
          var ev = newEvents[i];
          if (tbody.querySelector('[data-event-id="' + ev.id + '"]')) continue;
          var tr = document.createElement('tr');
          tr.setAttribute('data-event-id', ev.id);
          if (ev.severity === 'critical') tr.className = 'ov-issue-critical';

          var iconMap = { critical: '⊘', warning: '△', info: '💡' };
          var icon = iconMap[ev.severity] || '💡';
          var time = new Date(ev.timestamp).toLocaleTimeString();

          tr.innerHTML =
            '<td><span class="ov-alert-icon ' + ev.severity + '">' + icon + '</span> ' + escapeHtml(ev.message) + ' <span style="color:var(--muted);font-size:11px">(' + time + ')</span></td>' +
            '<td>' + escapeHtml(ev.model || 'Gateway') + '</td>' +
            '<td>' + (ev.type === 'violation' ? 'Security: <strong>Content Safety</strong>' : ev.type === 'rate_limit' ? 'Quota: <strong>Rate Limit</strong>' : ev.type === 'tool_call' ? 'Tool: <strong>Invocation</strong>' : 'Request: <strong>Gateway</strong>') + '</td>' +
            '<td><button class="ghost small">Review</button></td>';

          tbody.insertBefore(tr, tbody.firstChild);
        }
      })
      .catch(function () {});
  }

  // ───────── GOVERNANCE — Live Policy Status ─────────

  function loadPolicies() {
    fetch(API_BASE + '/api/policies')
      .then(function (r) { return r.json(); })
      .then(function (pols) {
        // Update violation counts in the governance table
        var rows = document.querySelectorAll('[data-page="observe-governance"] .gv-table tbody tr, .gv-policies-table tbody tr');
        // Also try to update guardrail cards in agent editor
        pols.forEach(function (pol) {
          // Update guardrail toggle states in agent editor
          var guardrailCards = document.querySelectorAll('.ae-guardrail-card');
          guardrailCards.forEach(function (card) {
            var label = card.querySelector('.ae-guardrail-label, h4');
            if (label && label.textContent.trim().toLowerCase().includes(pol.name.toLowerCase().split(' ')[0])) {
              var sw = card.querySelector('.ae-guardrail-switch');
              if (sw) {
                if (pol.enabled) sw.classList.add('on');
                else sw.classList.remove('on');
              }
            }
          });
        });
      })
      .catch(function () {});
  }

  // ───────── LIVE BANNER — Connection Status ─────────

  function addConnectionBanner() {
    var topbar = document.querySelector('.topbar');
    if (!topbar) return;

    var banner = document.createElement('div');
    banner.id = 'live-status-banner';
    banner.style.cssText = 'position:fixed;bottom:16px;right:16px;z-index:9999;background:#1e293b;border:1px solid #334155;border-radius:8px;padding:8px 14px;display:flex;align-items:center;gap:8px;font-size:12px;color:#94a3b8;box-shadow:0 4px 12px rgba(0,0,0,0.3);';
    banner.innerHTML = '<span style="width:8px;height:8px;border-radius:50%;background:#22c55e;display:inline-block"></span> <strong style="color:#e2e8f0">Live Backend</strong> · Gateway active';
    document.body.appendChild(banner);

    // Verify connection
    fetch(API_BASE + '/api/health')
      .then(function (r) { return r.json(); })
      .then(function (h) {
        banner.querySelector('strong').textContent = 'Live Backend';
        banner.querySelector('span').style.background = '#22c55e';
      })
      .catch(function () {
        banner.querySelector('strong').textContent = 'Static Mode';
        banner.querySelector('span').style.background = '#f59e0b';
        banner.innerHTML = '<span style="width:8px;height:8px;border-radius:50%;background:#f59e0b;display:inline-block"></span> <strong style="color:#e2e8f0">Static Mode</strong> · Start server: <code style="background:#0f172a;padding:2px 6px;border-radius:4px;color:#8ab4ff">npm start</code>';
      });
  }

  // ───────── PERIODIC REFRESH ─────────

  // Refresh metrics every 10s when on the Operate tab
  setInterval(function () {
    var observeShell = document.querySelector('.shell[data-tab="observe"]');
    if (observeShell && !observeShell.classList.contains('hidden')) {
      updateLiveMetrics();
    }
  }, 10000);

  // ───────── INIT ─────────

  addConnectionBanner();
  updateLiveMetrics();
  loadPolicies();

  // Add extra CSS for new elements
  var style = document.createElement('style');
  style.textContent = [
    '.ae-typing { opacity:0.7; }',
    '.ae-code-block { background:#0f172a; border:1px solid #334155; border-radius:6px; padding:12px; margin:8px 0; overflow-x:auto; font-family:"Cascadia Code","Fira Code",monospace; font-size:12px; white-space:pre; color:#e2e8f0; }',
    '.ae-inline-table { width:100%; border-collapse:collapse; margin:8px 0; font-size:12px; }',
    '.ae-inline-table td { padding:6px 10px; border:1px solid #334155; color:#e2e8f0; }',
    '.ae-inline-table tr:first-child td { font-weight:600; background:#1e293b; }',
    '.ae-response-content { line-height:1.6; }',
    '.ae-gateway-badge.cached { background:#065f46; color:#6ee7b7; }',
    '.ae-gateway-badge.tool { background:#1e1b4b; color:#a5b4fc; }',
  ].join('\n');
  document.head.appendChild(style);

})();
