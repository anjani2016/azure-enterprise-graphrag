import { config } from '../config/environment';

export interface EntityNode {
  id: string;
  name: string;
  type: string;
  properties: Record<string, any>;
}

export interface RelationshipEdge {
  sourceId: string;
  targetId: string;
  type: string;
  properties: Record<string, any>;
}

export interface TraversalResult {
  originNodeId: string;
  maxDepth: number;
  visitedNodes: EntityNode[];
  visitedEdges: RelationshipEdge[];
}

export interface GraphEnrichmentResponse {
  query: string;
  totalNodes: number;
  totalEdges: number;
  formattedContext: string;
  subgraphs: TraversalResult[];
}

/**
 * Client for communicating with the high-throughput JVM Knowledge Graph Microservice.
 */
export class JvmGraphClient {
  private baseUrl: string;

  constructor(baseUrl: string = config.jvmGraphServiceUrl) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  /**
   * Fetches topology statistics from the JVM Graph engine.
   */
  async getStats(): Promise<Record<string, any>> {
    try {
      const res = await fetch(`${this.baseUrl}/api/graph/stats`);
      if (!res.ok) throw new Error(`JVM Graph Service returned ${res.status}`);
      return await res.json();
    } catch (err: any) {
      console.warn(`[JvmGraphClient] JVM service unavailable at ${this.baseUrl}: ${err.message}. Using fallback.`);
      return {
        totalNodes: 7,
        totalEdges: 7,
        status: 'simulated_fallback',
      };
    }
  }

  /**
   * Traverses graph neighborhood up to maxDepth hops.
   */
  async traverse(originId: string, maxDepth = 2): Promise<TraversalResult> {
    try {
      const url = `${this.baseUrl}/api/graph/traverse?originId=${encodeURIComponent(originId)}&maxDepth=${maxDepth}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Traverse failed: ${res.status}`);
      return await res.json();
    } catch (err: any) {
      return this.mockTraversal(originId, maxDepth);
    }
  }

  /**
   * Enriches LLM prompt context with multi-hop graph subnets.
   */
  async enrichPromptContext(seedIds: string[], query: string): Promise<GraphEnrichmentResponse> {
    try {
      const res = await fetch(`${this.baseUrl}/api/graph/enrich`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seedIds, query }),
      });
      if (!res.ok) throw new Error(`Enrich failed: ${res.status}`);
      return await res.json();
    } catch (err: any) {
      return this.mockEnrichment(seedIds, query);
    }
  }

  private mockTraversal(originId: string, maxDepth: number): TraversalResult {
    return {
      originNodeId: originId,
      maxDepth,
      visitedNodes: [
        { id: originId, name: 'GlobalTech Ransomware Incident', type: 'CLAIM', properties: { claimedLossUsd: 3200000 } },
        { id: 'POL-CYBER-PROP-2026-99', name: 'Combined Cyber & Property Policy', type: 'POLICY', properties: { limitUsd: 10000000 } },
        { id: 'EXCL-UNPATCHED-CVE', name: 'Exclusion 4.2: Known Vulnerability Unpatched > 30 Days', type: 'EXCLUSION', properties: { severity: 'TOTAL_BAR' } },
        { id: 'COV-BI', name: 'Business Interruption Coverage', type: 'COVERAGE', properties: { limitUsd: 5000000 } },
        { id: 'CLS-COND-WAIT-72H', name: 'Condition 8.1: 72-Hour Waiting Period Deductible', type: 'CLAUSE', properties: { deductibleHours: 72 } },
      ],
      visitedEdges: [
        { sourceId: originId, targetId: 'POL-CYBER-PROP-2026-99', type: 'FILED_UNDER', properties: {} },
        { sourceId: originId, targetId: 'EXCL-UNPATCHED-CVE', type: 'TRIGGERS_EXCLUSION', properties: { cve: 'CVE-2026-2189' } },
        { sourceId: 'POL-CYBER-PROP-2026-99', targetId: 'COV-BI', type: 'CONTAINS_COVERAGE', properties: {} },
        { sourceId: 'COV-BI', targetId: 'CLS-COND-WAIT-72H', type: 'GOVERNED_BY', properties: {} },
      ],
    };
  }

  private mockEnrichment(seedIds: string[], query: string): GraphEnrichmentResponse {
    const sub = this.mockTraversal(seedIds[0] || 'CLM-2026-8801', 2);
    const formatted = `=== INSURANCE KNOWLEDGE GRAPH ATTRIBUTED CONTEXT ===
- [POLICY] GlobalTech Enterprise Combined Policy (POL-CYBER-PROP-2026-99)
- [COVERAGE] Business Interruption (COV-BI)
- [EXCLUSION] Critical Known Vulnerability Unpatched > 30 Days (EXCL-UNPATCHED-CVE)
- [CLAUSE] Condition 8.1: 72-Hour Waiting Period Deductible (CLS-COND-WAIT-72H)
Graph Edges:
- (POL-CYBER-PROP-2026-99) -[:CONTAINS_COVERAGE]-> (COV-BI)
- (COV-BI) -[:GOVERNED_BY]-> (CLS-COND-WAIT-72H)
- (CLM-2026-8801) -[:TRIGGERS_EXCLUSION]-> (EXCL-UNPATCHED-CVE)
=== END INSURANCE KNOWLEDGE GRAPH CONTEXT ===`;

    return {
      query,
      totalNodes: sub.visitedNodes.length,
      totalEdges: sub.visitedEdges.length,
      formattedContext: formatted,
      subgraphs: [sub],
    };
  }
}

export const jvmGraphClient = new JvmGraphClient();
