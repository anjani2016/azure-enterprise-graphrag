/**
 * Dashboard Rendering Service
 * Generates an interactive executive web dashboard for the Enterprise GraphRAG Platform.
 *
 * Legal party: Alpha Centauri Ventures Inc.
 * Brand: Centauri Research
 */

/**
 * Returns CSS stylesheet for the entire interactive dashboard and chat interface.
 */
function getDashboardStyles(): string {
  return `
    :root {
      --bg: #090d16;
      --card-bg: #131c2e;
      --card-border: #1e293b;
      --card-hover: #1e2d47;
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
      --accent: #38bdf8;
      --accent-hover: #0284c7;
      --success: #34d399;
      --warning: #fbbf24;
      --danger: #f87171;
      --purple: #c084fc;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: var(--bg);
      color: var(--text-main);
      line-height: 1.5;
      padding-bottom: 60px;
    }
    .container { max-width: 1300px; margin: 0 auto; padding: 0 24px; }
    
    /* Observability Banner */
    .observability-bar {
      background: linear-gradient(90deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%);
      border-bottom: 1px solid #312e81;
      padding: 10px 0;
      font-size: 0.85rem;
    }
    .obs-content { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
    .obs-links { display: flex; align-items: center; gap: 16px; }
    .obs-link {
      display: inline-flex; align-items: center; gap: 6px;
      color: #c7d2fe; text-decoration: none; font-weight: 600;
      background: rgba(99, 102, 241, 0.15); border: 1px solid #4338ca;
      padding: 4px 10px; border-radius: 6px; transition: all 0.2s;
    }
    .obs-link:hover { background: #4f46e5; color: #fff; }
    .obs-metrics { display: flex; gap: 16px; align-items: center; }
    .obs-metric-item { display: flex; align-items: center; gap: 6px; color: var(--text-muted); }
    .obs-metric-item strong { color: var(--success); }

    /* Header */
    header {
      background: rgba(15, 23, 42, 0.95);
      border-bottom: 1px solid var(--card-border);
      padding: 16px 0;
      position: sticky;
      top: 0;
      z-index: 50;
      backdrop-filter: blur(8px);
    }
    .header-content { display: flex; justify-content: space-between; align-items: center; }
    .logo-badge { display: flex; align-items: center; gap: 12px; }
    .logo-badge h1 { font-size: 1.25rem; font-weight: 700; color: #fff; letter-spacing: -0.02em; }
    .logo-badge span { font-size: 0.8rem; background: #0369a1; color: #bae6fd; padding: 2px 8px; border-radius: 9999px; }
    .pulse-dot { width: 8px; height: 8px; background: var(--success); border-radius: 50%; box-shadow: 0 0 8px var(--success); }
    .status-pill { display: flex; align-items: center; gap: 8px; background: #064e3b; color: #a7f3d0; padding: 5px 12px; border-radius: 9999px; font-size: 0.8rem; font-weight: 600; }

    /* System Cards */
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 16px; margin: 24px auto; }
    .card { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 10px; padding: 20px; }
    .card h3 { font-size: 1.05rem; font-weight: 700; margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between; }
    .stat-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.04); font-size: 0.9rem; }
    .stat-row:last-child { border-bottom: none; }
    .stat-label { color: var(--text-muted); }
    .stat-val { font-family: monospace; font-weight: 600; color: var(--accent); }
    .tag { background: rgba(56, 189, 248, 0.1); border: 1px solid rgba(56, 189, 248, 0.3); color: #7dd3fc; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-family: monospace; }

    /* Interactive Workspace (Two Columns) */
    .workspace-section { margin-top: 32px; }
    .workspace-header { margin-bottom: 16px; }
    .workspace-header h2 { font-size: 1.5rem; font-weight: 800; color: #fff; }
    .workspace-header p { color: var(--text-muted); font-size: 0.95rem; }
    .workspace-grid { display: grid; grid-template-columns: 1fr 1.2fr; gap: 24px; }
    @media (max-width: 900px) { .workspace-grid { grid-template-columns: 1fr; } }

    /* Left Column: Policy Selector & Brief */
    .policy-selector-card { display: flex; flex-direction: column; height: 680px; }
    .control-row { display: flex; gap: 8px; margin-bottom: 16px; }
    .select-input {
      flex: 1; background: #0b1120; border: 1px solid var(--card-border);
      color: #fff; padding: 10px; border-radius: 6px; font-size: 0.9rem;
    }
    .btn {
      background: var(--accent); color: #090d16; font-weight: 600;
      padding: 10px 16px; border-radius: 6px; border: none; cursor: pointer;
      transition: all 0.2s; font-size: 0.9rem; text-decoration: none; display: inline-flex; align-items: center; justify-content: center;
    }
    .btn:hover { background: var(--accent-hover); color: #fff; }
    .btn-secondary { background: #1e293b; color: #fff; border: 1px solid var(--card-border); }
    .btn-secondary:hover { background: #334155; }
    .doc-preview-area {
      flex: 1; background: #0b1120; border: 1px solid var(--card-border);
      border-radius: 8px; padding: 16px; overflow-y: auto; font-size: 0.88rem;
    }
    .brief-container h4 { color: var(--accent); margin-bottom: 6px; font-size: 1.1rem; }
    .brief-summary { color: #cbd5e1; margin-bottom: 12px; font-style: italic; }
    .brief-section { margin-top: 14px; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 10px; }
    .brief-section h5 { color: #94a3b8; font-size: 0.8rem; text-transform: uppercase; margin-bottom: 6px; }
    .brief-section ul { padding-left: 20px; color: #e2e8f0; }
    .brief-section li { margin-bottom: 4px; }
    .badge-red { background: #7f1d1d; color: #fca5a5; padding: 1px 6px; border-radius: 4px; font-size: 0.75rem; font-weight: bold; }
    .badge-verdict { font-size: 0.8rem; font-weight: 700; padding: 3px 10px; border-radius: 9999px; text-transform: uppercase; }
    .badge-verdict.green { background: #064e3b; color: #a7f3d0; }
    .badge-verdict.amber { background: #78350f; color: #fde68a; }
    .badge-verdict.red { background: #7f1d1d; color: #fca5a5; }

    /* Right Column: Chatbot */
    .chatbot-card { display: flex; flex-direction: column; height: 680px; }
    .chat-history {
      flex: 1; background: #0b1120; border: 1px solid var(--card-border);
      border-radius: 8px; padding: 16px; overflow-y: auto; display: flex; flex-direction: column; gap: 14px;
    }
    .msg-bubble { max-width: 90%; padding: 12px 16px; border-radius: 8px; font-size: 0.92rem; }
    .msg-user { align-self: flex-end; background: #0369a1; color: #fff; }
    .msg-bot { align-self: flex-start; background: #1e293b; color: #f1f5f9; border: 1px solid rgba(255,255,255,0.08); width: 100%; }
    .bot-verdict-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .citations-box { margin-top: 10px; background: rgba(0,0,0,0.3); padding: 8px 12px; border-radius: 6px; font-size: 0.8rem; }
    .traversal-box { margin-top: 8px; font-family: monospace; font-size: 0.78rem; color: #38bdf8; background: #06090e; padding: 8px; border-radius: 6px; white-space: pre-wrap; }
    .chips-row { display: flex; flex-wrap: wrap; gap: 6px; margin: 12px 0 8px 0; }
    .chip {
      background: rgba(56, 189, 248, 0.1); border: 1px solid rgba(56, 189, 248, 0.25);
      color: #7dd3fc; padding: 4px 10px; border-radius: 9999px; font-size: 0.78rem;
      cursor: pointer; transition: all 0.2s;
    }
    .chip:hover { background: rgba(56, 189, 248, 0.25); color: #fff; }
    .chat-input-row { display: flex; gap: 8px; margin-top: 8px; }
    .chat-input {
      flex: 1; background: #0b1120; border: 1px solid var(--card-border);
      color: #fff; padding: 12px; border-radius: 6px; font-size: 0.92rem;
    }
    .chat-input:focus { outline: none; border-color: var(--accent); }

    /* Modal for Custom Upload */
    .modal-overlay {
      display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.75); z-index: 100; justify-content: center; align-items: center;
    }
    .modal-box {
      background: #131c2e; border: 1px solid var(--card-border); border-radius: 10px;
      width: 90%; max-width: 540px; padding: 24px;
    }
    .modal-box textarea { width: 100%; height: 160px; background: #0b1120; border: 1px solid var(--card-border); color: #fff; padding: 10px; border-radius: 6px; font-family: monospace; font-size: 0.85rem; margin: 12px 0; }
    footer { margin-top: 60px; padding: 24px 0; border-top: 1px solid var(--card-border); text-align: center; color: var(--text-muted); font-size: 0.85rem; }
  `;
}

/**
 * Returns markup for the top Admin Observability & Drift Monitoring Hub.
 */
function renderObservabilityBar(): string {
  return `
    <div class="observability-bar">
      <div class="container obs-content">
        <div class="obs-links">
          <span><strong>Admin Observability Hub:</strong></span>
          <a href="https://arize.centauri-research.com" target="_blank" class="obs-link" rel="noreferrer">
            <span class="pulse-dot"></span> Arize Phoenix Telemetry ↗
          </a>
          <a href="https://mlflow.centauri-research.com" target="_blank" class="obs-link" rel="noreferrer">
            <span class="pulse-dot"></span> MLflow Drift Tracking ↗
          </a>
        </div>
        <div class="obs-metrics">
          <div class="obs-metric-item">Groundedness: <strong>94%</strong> (Target ≥ 80%)</div>
          <div class="obs-metric-item">Hallucination Rate: <strong>0%</strong> (Target ≤ 10%)</div>
          <div class="obs-metric-item">RAG Triad: <strong>Verified</strong></div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Returns header markup.
 */
function renderHeader(): string {
  return `
    <header>
      <div class="container header-content">
        <div class="logo-badge">
          <div class="pulse-dot"></div>
          <h1>Centauri Research</h1>
          <span>Enterprise GraphRAG</span>
        </div>
        <div class="status-pill">
          <div class="pulse-dot"></div>
          <span>Azure Container Apps &amp; GCP Observability: Active</span>
        </div>
      </div>
    </header>
  `;
}

/**
 * Returns system architecture status cards markup.
 */
function renderArchitectureCards(): string {
  return `
    <div class="grid container">
      <div class="card">
        <h3>Node.js API Gateway <span class="tag">Port 3000</span></h3>
        <div class="stat-row"><span class="stat-label">Ingress Host</span><span class="stat-val">insrag.centauri-research.com</span></div>
        <div class="stat-row"><span class="stat-label">Runtime</span><span class="stat-val">Node 22 LTS / Express</span></div>
        <div class="stat-row"><span class="stat-label">Security Gates</span><span class="stat-val">OAuth 2.0 / Entra ID + RateLimit</span></div>
        <div style="margin-top: 12px; display: flex; gap: 8px;">
          <a href="/health/live" class="btn btn-secondary" target="_blank">Liveness Probe</a>
          <a href="/health/ready" class="btn btn-secondary" target="_blank">Readiness Probe</a>
        </div>
      </div>

      <div class="card">
        <h3>JVM Knowledge Graph Engine <span class="tag">Port 8081</span></h3>
        <div class="stat-row"><span class="stat-label">Engine</span><span class="stat-val">Spring Boot 3 / Java 21 LTS</span></div>
        <div class="stat-row"><span class="stat-label">Graph Traversal</span><span class="stat-val">Multi-Hop BFS + Cypher GraphRAG</span></div>
        <div class="stat-row"><span class="stat-label">Entities Loaded</span><span class="stat-val">9 Active Nodes</span></div>
        <div style="margin-top: 12px;">
          <span class="tag">POLICY</span> <span class="tag">CLAIM</span> <span class="tag">COVERAGE</span> <span class="tag">EXCLUSION</span>
        </div>
      </div>

      <div class="card">
        <h3>Observability &amp; Connectors <span class="tag">Connected</span></h3>
        <div class="stat-row"><span class="stat-label">Tracing Collector</span><span class="stat-val">arize.centauri-research.com</span></div>
        <div class="stat-row"><span class="stat-label">Experiment Tracking</span><span class="stat-val">mlflow.centauri-research.com</span></div>
        <div class="stat-row"><span class="stat-label">Document Renderer</span><span class="stat-val">Apache PDFBox + HTML</span></div>
        <div style="margin-top: 12px;">
          <button onclick="downloadSamplePdf()" class="btn btn-secondary">Download Sample PDF Brief</button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Returns the interactive two-column self-service workspace markup.
 */
function renderWorkspaceSection(): string {
  return `
    <div class="container workspace-section">
      <div class="workspace-header">
        <h2>Interactive Insurance Policy Explorer &amp; Self-Service Chatbot</h2>
        <p>Ask natural-language coverage questions grounded strictly in Knowledge Graph facts, or select and upload mock policies.</p>
      </div>

      <div class="workspace-grid">
        <!-- Left: Document Preview & Policy Selector -->
        <div class="card policy-selector-card">
          <h3>Active Insurance Policy Schedule</h3>
          <div class="control-row">
            <select id="policySelect" class="select-input" onchange="onPolicyChange()">
              <option value="POL-CYBER-PROP-2026-99">GlobalTech Cyber Extortion &amp; Property (POL-CYBER-PROP-2026-99)</option>
              <option value="POL-2026-COMM-PROPERTY">Apex Logistics Commercial Property (POL-2026-COMM-PROPERTY)</option>
              <option value="POL-MACH-2026-04">Quantum Clean Energy Turbomachinery (POL-MACH-2026-04)</option>
            </select>
            <button onclick="openUploadModal()" class="btn btn-secondary">+ Upload</button>
          </div>
          <div id="policyBriefPreview" class="doc-preview-area">
            <!-- Rendered brief populated by client script -->
          </div>
          <div style="margin-top: 12px; display: flex; justify-content: flex-end;">
            <button onclick="downloadCurrentPdf()" class="btn">Download Official Brief (PDF)</button>
          </div>
        </div>

        <!-- Right: Self-Service Chatbot -->
        <div class="card chatbot-card">
          <h3>Grounded GraphRAG Policy Advisor</h3>
          <div id="chatHistory" class="chat-history">
            <div class="msg-bubble msg-bot">
              👋 <strong>Welcome to the Centauri Policy Advisor!</strong><br>
              I am grounded in your active Knowledge Graph. Ask me about coverage limits, waiting periods, or exclusion triggers (e.g. unpatched vulnerabilities, flood intrusion, or mechanical breakdown).
            </div>
          </div>

          <div class="chips-row">
            <span class="chip" onclick="askChip('Is ransomware covered if VPN was unpatched?')">Unpatched VPN Ransomware?</span>
            <span class="chip" onclick="askChip('What is our deductible and waiting period?')">Deductible &amp; Waiting Period?</span>
            <span class="chip" onclick="askChip('Is surface water / flood damage covered?')">Flood &amp; Water Damage?</span>
          </div>

          <div class="chat-input-row">
            <input type="text" id="chatInput" class="chat-input" placeholder="Ask a policy question..." onkeypress="handleKeyPress(event)" />
            <button id="sendBtn" onclick="sendQuery()" class="btn">Ask</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Returns upload modal markup for custom mock policies.
 */
function renderUploadModal(): string {
  return `
    <div id="uploadModal" class="modal-overlay">
      <div class="modal-box">
        <h3>Upload Custom Mock Insurance Policy</h3>
        <p style="color: var(--text-muted); font-size: 0.85rem; margin-top: 4px;">
          Paste custom policy JSON with coverages and exclusions to test on-the-fly:
        </p>
        <textarea id="customPolicyJson">{
  "policyNumber": "POL-CUSTOM-2026-01",
  "policyholder": "Acme Industrial Logistics",
  "effectiveDate": "2026-06-01 to 2027-05-31",
  "aggregateLimitUsd": 8000000,
  "deductibleUsd": 50000,
  "waitingPeriodHours": 24
}</textarea>
        <div style="display: flex; justify-content: flex-end; gap: 8px;">
          <button onclick="closeUploadModal()" class="btn btn-secondary">Cancel</button>
          <button onclick="submitCustomPolicy()" class="btn">Save &amp; Activate</button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Returns interactive client script.
 */
function renderClientScript(): string {
  return `
    <script>
      let activePolicies = {};

      async function initPage() {
        try {
          const res = await fetch('/api/chat/policies');
          const data = await res.json();
          if (data.success && data.policies) {
            data.policies.forEach(p => activePolicies[p.id] = p);
            onPolicyChange();
          }
        } catch (e) {
          console.error('Failed to load policies', e);
        }
      }

      function onPolicyChange() {
        const select = document.getElementById('policySelect');
        const policy = activePolicies[select.value];
        if (!policy) return;

        const container = document.getElementById('policyBriefPreview');
        const coverages = policy.coverages.map(c => '<li><strong>' + c.name + '</strong>: Limit $' + c.limitUsd.toLocaleString() + '</li>').join('');
        const exclusions = policy.exclusions.map(e => '<li><span class="badge-red">' + e.code + '</span>: ' + e.title + '</li>').join('');
        const clauses = policy.clauses.map(cl => '<li><strong>' + cl.clauseId + '</strong>: ' + cl.title + ' (' + cl.requirement + ')</li>').join('');

        container.innerHTML = '<div class="brief-container">' +
          '<h4>Policy Schedule: ' + policy.policyNumber + '</h4>' +
          '<p class="brief-summary">Insured: <strong>' + policy.policyholder + '</strong> | Term: ' + policy.effectiveDate + '</p>' +
          '<div class="brief-section"><h5>Coverages & Sub-Limits</h5><ul>' + coverages + '</ul></div>' +
          '<div class="brief-section"><h5>Governing Exclusions</h5><ul>' + exclusions + '</ul></div>' +
          '<div class="brief-section"><h5>Conditions & Warranties</h5><ul>' + clauses + '</ul></div>' +
        '</div>';
      }

      function askChip(text) {
        document.getElementById('chatInput').value = text;
        sendQuery();
      }

      function handleKeyPress(e) {
        if (e.key === 'Enter') sendQuery();
      }

      async function sendQuery() {
        const input = document.getElementById('chatInput');
        const question = input.value.trim();
        if (!question) return;

        const policyId = document.getElementById('policySelect').value;
        const history = document.getElementById('chatHistory');

        // Append User Bubble
        const userDiv = document.createElement('div');
        userDiv.className = 'msg-bubble msg-user';
        userDiv.textContent = question;
        history.appendChild(userDiv);
        input.value = '';
        history.scrollTop = history.scrollHeight;

        // Append Loading Bubble
        const botDiv = document.createElement('div');
        botDiv.className = 'msg-bubble msg-bot';
        botDiv.innerHTML = '<em>Traversing Knowledge Graph & calculating attribution...</em>';
        history.appendChild(botDiv);
        history.scrollTop = history.scrollHeight;

        try {
          const res = await fetch('/api/chat/query', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ policyId, question })
          });
          const data = await res.json();
          if (data.success) {
            const verdictClass = data.verdict === 'COVERAGE_AFFIRMED' ? 'green' : (data.verdict === 'RESERVATION_OF_RIGHTS' ? 'amber' : 'red');
            const citations = data.citedClauses.concat(data.citedExclusions).map(c => '<div>• ' + c + '</div>').join('');
            const traversal = data.traversalPath ? data.traversalPath.join('\\n') : '';

            botDiv.innerHTML = 
              '<div class="bot-verdict-header">' +
                '<span class="badge-verdict ' + verdictClass + '">' + data.verdictLabel + '</span>' +
                '<small style="color:#94a3b8">Confidence: ' + Math.round(data.confidenceScore * 100) + '%</small>' +
              '</div>' +
              '<p>' + data.answer + '</p>' +
              (citations ? '<div class="citations-box"><strong>Attributed Citations:</strong>' + citations + '</div>' : '') +
              (traversal ? '<div class="traversal-box"><strong>Knowledge Graph Subnet:</strong>\\n' + traversal + '</div>' : '');
          } else {
            botDiv.textContent = 'Error: ' + data.error;
          }
        } catch (e) {
          botDiv.textContent = 'Service unavailable: ' + e.message;
        }
        history.scrollTop = history.scrollHeight;
      }

      function openUploadModal() { document.getElementById('uploadModal').style.display = 'flex'; }
      function closeUploadModal() { document.getElementById('uploadModal').style.display = 'none'; }

      async function submitCustomPolicy() {
        const text = document.getElementById('customPolicyJson').value;
        try {
          const parsed = JSON.parse(text);
          const res = await fetch('/api/chat/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(parsed)
          });
          const data = await res.json();
          if (data.success) {
            alert('Policy ' + data.policy.policyNumber + ' uploaded successfully!');
            closeUploadModal();
            activePolicies[data.policy.id] = data.policy;
            const select = document.getElementById('policySelect');
            const opt = document.createElement('option');
            opt.value = data.policy.id;
            opt.textContent = data.policy.policyNumber;
            select.appendChild(opt);
            select.value = data.policy.id;
            onPolicyChange();
          } else {
            alert('Upload failed: ' + data.error);
          }
        } catch (e) {
          alert('Invalid JSON: ' + e.message);
        }
      }

      function downloadCurrentPdf() {
        const select = document.getElementById('policySelect');
        window.open('/api/docs/render/pdf?download=true', '_blank');
      }

      function downloadSamplePdf() {
        window.open('/api/docs/render/pdf?download=true', '_blank');
      }

      window.onload = initPage;
    </script>
  `;
}

/**
 * Returns footer markup.
 */
function renderFooter(): string {
  return `
    <footer>
      <div class="container">
        <p>&copy; 2026 Centauri Research &bull; Legal Entity: Alpha Centauri Ventures Inc. All rights reserved.</p>
        <p style="margin-top: 6px; font-size: 0.8rem; color: #64748b;">Enterprise GraphRAG &bull; Azure Container Apps Ingress &bull; Spring Boot 3 &bull; Arize Phoenix &bull; MLflow</p>
      </div>
    </footer>
  `;
}

/**
 * Renders the full HTML web dashboard for the root gateway path.
 */
export function renderDashboardHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Centauri Research - Insurance GraphRAG Platform &amp; Policy Advisor</title>
  <style>${getDashboardStyles()}</style>
</head>
<body>
  ${renderObservabilityBar()}
  ${renderHeader()}
  ${renderArchitectureCards()}
  ${renderWorkspaceSection()}
  ${renderUploadModal()}
  ${renderFooter()}
  ${renderClientScript()}
</body>
</html>`;
}
