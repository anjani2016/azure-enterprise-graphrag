/**
 * Dashboard Rendering Service
 * Generates an interactive executive web dashboard for the Enterprise GraphRAG Platform.
 *
 * Legal party: Alpha Centauri Ventures Inc.
 * Brand: Centauri Research
 */

/**
 * Returns the CSS stylesheet for the dashboard UI.
 */
function getDashboardStyles(): string {
  return `
    :root {
      --bg: #0f172a;
      --card-bg: #1e293b;
      --card-border: #334155;
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
      --accent: #38bdf8;
      --accent-hover: #0284c7;
      --success: #34d399;
      --warning: #fbbf24;
      --danger: #f87171;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: var(--bg);
      color: var(--text-main);
      line-height: 1.6;
      padding: 0 0 40px 0;
    }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
    header {
      background: rgba(15, 23, 42, 0.95);
      border-bottom: 1px solid var(--card-border);
      padding: 20px 0;
      position: sticky;
      top: 0;
      z-index: 50;
      backdrop-filter: blur(8px);
    }
    .header-content { display: flex; justify-content: space-between; align-items: center; }
    .logo-badge { display: flex; align-items: center; gap: 12px; }
    .logo-badge h1 { font-size: 1.25rem; font-weight: 700; color: #fff; letter-spacing: -0.02em; }
    .logo-badge span { font-size: 0.8rem; background: #0369a1; color: #bae6fd; padding: 2px 8px; border-radius: 9999px; }
    .pulse-dot { width: 10px; height: 10px; background: var(--success); border-radius: 50%; box-shadow: 0 0 10px var(--success); }
    .status-pill { display: flex; align-items: center; gap: 8px; background: #064e3b; color: #a7f3d0; padding: 6px 14px; border-radius: 9999px; font-size: 0.85rem; font-weight: 600; }
    .hero { padding: 48px 0 32px 0; text-align: center; }
    .hero h2 { font-size: 2.25rem; font-weight: 800; margin-bottom: 12px; background: linear-gradient(135deg, #fff 0%, #94a3b8 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .hero p { font-size: 1.1rem; color: var(--text-muted); max-width: 760px; margin: 0 auto; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px; margin-top: 32px; }
    .card { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 12px; padding: 24px; }
    .card h3 { font-size: 1.1rem; font-weight: 700; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between; }
    .stat-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 0.95rem; }
    .stat-row:last-child { border-bottom: none; }
    .stat-label { color: var(--text-muted); }
    .stat-val { font-family: monospace; font-weight: 600; color: var(--accent); }
    .tag-cloud { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
    .tag { background: rgba(56, 189, 248, 0.1); border: 1px solid rgba(56, 189, 248, 0.3); color: #7dd3fc; padding: 4px 10px; border-radius: 6px; font-size: 0.8rem; font-family: monospace; }
    .btn { display: inline-block; background: var(--accent); color: #0f172a; font-weight: 600; padding: 10px 20px; border-radius: 8px; text-decoration: none; border: none; cursor: pointer; transition: background 0.2s; font-size: 0.95rem; }
    .btn:hover { background: var(--accent-hover); color: #fff; }
    .btn-secondary { background: transparent; border: 1px solid var(--card-border); color: var(--text-main); }
    .btn-secondary:hover { background: rgba(255,255,255,0.05); }
    .interactive-panel { margin-top: 40px; }
    .panel-header { font-size: 1.4rem; font-weight: 700; margin-bottom: 16px; }
    .console-box { background: #090d16; border: 1px solid var(--card-border); border-radius: 8px; padding: 16px; font-family: monospace; font-size: 0.85rem; color: #38bdf8; max-height: 240px; overflow-y: auto; margin-top: 16px; }
    footer { margin-top: 60px; padding: 24px 0; border-top: 1px solid var(--card-border); text-align: center; color: var(--text-muted); font-size: 0.85rem; }
  `;
}

/**
 * Returns header HTML markup.
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
          <span>Cloud Run &amp; ACA Ingress: Active</span>
        </div>
      </div>
    </header>
  `;
}

/**
 * Returns hero section HTML markup.
 */
function renderHero(): string {
  return `
    <section class="hero container">
      <h2>Insurance Policy &amp; Claims GraphRAG Platform</h2>
      <p>High-throughput Java 21 / Spring Boot 3 property graph engine orchestrating with Node 22 API Gateway on Azure serverless infrastructure.</p>
    </section>
  `;
}

/**
 * Returns system architecture status cards HTML markup.
 */
function renderSystemCards(): string {
  return `
    <div class="grid container">
      <div class="card">
        <h3>Node.js API Gateway <span class="tag">Port 3000</span></h3>
        <div class="stat-row"><span class="stat-label">Runtime</span><span class="stat-val">Node.js 22 LTS / Express</span></div>
        <div class="stat-row"><span class="stat-label">Ingress Host</span><span class="stat-val">insrag.centauri-research.com</span></div>
        <div class="stat-row"><span class="stat-label">Protocol</span><span class="stat-val">HTTP/2 + TLS 1.3</span></div>
        <div class="stat-row"><span class="stat-label">Security Gates</span><span class="stat-val">OAuth 2.0 / Entra ID + RateLimit</span></div>
        <div style="margin-top: 16px; display: flex; gap: 8px;">
          <a href="/health/live" class="btn btn-secondary" target="_blank">Liveness Probe</a>
          <a href="/health/ready" class="btn btn-secondary" target="_blank">Readiness Probe</a>
        </div>
      </div>

      <div class="card">
        <h3>JVM Knowledge Graph Engine <span class="tag">Port 8081</span></h3>
        <div class="stat-row"><span class="stat-label">Engine</span><span class="stat-val">Spring Boot 3 / Java 21 LTS</span></div>
        <div class="stat-row"><span class="stat-label">Graph Traversal</span><span class="stat-val">Multi-Hop BFS + Cypher GraphRAG</span></div>
        <div class="stat-row"><span class="stat-label">Loaded Nodes</span><span class="stat-val">9 Entities</span></div>
        <div class="stat-row"><span class="stat-label">Loaded Edges</span><span class="stat-val">9 Relationships</span></div>
        <div class="tag-cloud">
          <span class="tag">POLICY</span><span class="tag">CLAIM</span><span class="tag">PERIL</span>
          <span class="tag">EXCLUSION</span><span class="tag">COVERAGE</span><span class="tag">CLAUSE</span>
        </div>
      </div>

      <div class="card">
        <h3>Enterprise Connectors &amp; HITL <span class="tag">Active</span></h3>
        <div class="stat-row"><span class="stat-label">HITL Workflow</span><span class="stat-val">Claims Adjudication Review</span></div>
        <div class="stat-row"><span class="stat-label">Document Engine</span><span class="stat-val">Apache PDFBox + HTML Adjudication</span></div>
        <div class="stat-row"><span class="stat-label">MCP Server</span><span class="stat-val">JSON-RPC 2.0 Protocol</span></div>
        <div class="stat-row"><span class="stat-label">Multi-Agent</span><span class="stat-val">A2A Autonomous Collaboration</span></div>
        <div style="margin-top: 16px;">
          <button onclick="previewReport()" class="btn">Preview Sample Adjudication Brief</button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Returns interactive demo and API quick reference HTML markup.
 */
function renderInteractiveSection(): string {
  return `
    <div class="container interactive-panel">
      <div class="card">
        <h3 class="panel-header">Interactive Graph Query &amp; Adjudication Console</h3>
        <p style="color: var(--text-muted); margin-bottom: 16px;">
          Execute a simulated GraphRAG exclusion screening against claim <code>CLM-2026-8801</code> (Wind &amp; Hail Peril):
        </p>
        <div style="display: flex; gap: 12px; flex-wrap: wrap;">
          <button onclick="runQueryTest()" class="btn">Execute Graph Traversal</button>
          <button onclick="fetchReadiness()" class="btn btn-secondary">Fetch Live Topology</button>
        </div>
        <div id="outputConsole" class="console-box">// Click "Execute Graph Traversal" or "Fetch Live Topology" to run real-time queries...</div>
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
      async function fetchReadiness() {
        const consoleEl = document.getElementById('outputConsole');
        consoleEl.textContent = 'Querying /health/ready endpoint...';
        try {
          const res = await fetch('/health/ready');
          const data = await res.json();
          consoleEl.textContent = JSON.stringify(data, null, 2);
        } catch (e) {
          consoleEl.textContent = 'Error connecting to service: ' + e.message;
        }
      }

      function runQueryTest() {
        const consoleEl = document.getElementById('outputConsole');
        consoleEl.textContent = 'Executing 2-hop BFS on Knowledge Graph:\\n' +
          '1. [Claim: CLM-2026-8801] -> (FILED_UNDER) -> [Policy: POL-2026-COMM-PROPERTY]\\n' +
          '2. [Policy: POL-2026-COMM-PROPERTY] -> (INCLUDES_COVERAGE) -> [Coverage: Building Physical Damage ($5,000,000)]\\n' +
          '3. [Coverage] -> (SUBJECT_TO_CONDITION) -> [Clause: Deductible $50,000]\\n' +
          '4. [Claim] -> (CAUSED_BY) -> [Peril: Wind & Hail Storm]\\n' +
          '5. [Peril] -> (SCREENED_AGAINST) -> [Exclusion: Unpatched Vulnerability Excl]\\n\\n' +
          'Status: COVERAGE_AFFIRMED | Risk Score: 22/100 | Statutory Attribution: NAIC-880 Compliant';
      }

      function previewReport() {
        window.open('/health/ready', '_blank');
      }
    </script>
  `;
}

/**
 * Returns footer HTML markup.
 */
function renderFooter(): string {
  return `
    <footer>
      <div class="container">
        <p>&copy; 2026 Centauri Research &bull; Legal Entity: Alpha Centauri Ventures Inc. All rights reserved.</p>
        <p style="margin-top: 6px; font-size: 0.8rem; color: #64748b;">Enterprise GraphRAG &bull; Azure Container Apps Ingress &bull; Spring Boot 3 &bull; Node 22</p>
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
  <title>Centauri Research - Insurance GraphRAG Platform</title>
  <style>${getDashboardStyles()}</style>
</head>
<body>
  ${renderHeader()}
  ${renderHero()}
  ${renderSystemCards()}
  ${renderInteractiveSection()}
  ${renderFooter()}
  ${renderClientScript()}
</body>
</html>`;
}
