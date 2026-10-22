package com.centauri.rag.graph.service;

import com.centauri.rag.graph.model.*;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * High-performance in-memory Knowledge Graph engine for insurance entity-relationship
 * modeling, multi-hop traversal, and GraphRAG prompt enrichment.
 */
@Service
public class KnowledgeGraphEngine {

    private static final Logger log = LoggerFactory.getLogger(KnowledgeGraphEngine.class);
    private static final int DEFAULT_MAX_DEPTH = 2;

    private final Map<String, EntityNode> nodeStore = new ConcurrentHashMap<>();
    private final Map<String, List<RelationshipEdge>> outgoingEdges = new ConcurrentHashMap<>();
    private final Map<String, List<RelationshipEdge>> incomingEdges = new ConcurrentHashMap<>();

    @PostConstruct
    public void initSeedData() {
        bootstrapInsuranceKnowledgeGraph();
    }

    /**
     * Stores or updates an entity node in the graph.
     */
    public EntityNode upsertNode(EntityNode node) {
        nodeStore.put(node.id(), node);
        outgoingEdges.putIfAbsent(node.id(), Collections.synchronizedList(new ArrayList<>()));
        incomingEdges.putIfAbsent(node.id(), Collections.synchronizedList(new ArrayList<>()));
        return node;
    }

    /**
     * Stores a directed relationship edge between two existing nodes.
     */
    public RelationshipEdge addEdge(RelationshipEdge edge) {
        if (!nodeStore.containsKey(edge.sourceId()) || !nodeStore.containsKey(edge.targetId())) {
            throw new IllegalArgumentException("Both source and target nodes must exist before adding an edge");
        }
        outgoingEdges.computeIfAbsent(edge.sourceId(), k -> Collections.synchronizedList(new ArrayList<>())).add(edge);
        incomingEdges.computeIfAbsent(edge.targetId(), k -> Collections.synchronizedList(new ArrayList<>())).add(edge);
        return edge;
    }

    /**
     * Performs a breadth-first multi-hop graph traversal from a root node.
     */
    public TraversalResult traverse(String originId, int maxDepth) {
        EntityNode startNode = nodeStore.get(originId);
        if (startNode == null) {
            return new TraversalResult(originId, maxDepth, Set.of(), List.of());
        }

        int depthLimit = (maxDepth <= 0) ? DEFAULT_MAX_DEPTH : maxDepth;
        Set<EntityNode> visitedNodes = new LinkedHashSet<>();
        List<RelationshipEdge> visitedEdges = new ArrayList<>();
        Set<String> visitedNodeIds = new HashSet<>();

        Queue<AbstractMap.SimpleEntry<String, Integer>> queue = new LinkedList<>();
        queue.add(new AbstractMap.SimpleEntry<>(originId, 0));
        visitedNodes.add(startNode);
        visitedNodeIds.add(originId);

        processQueue(queue, depthLimit, visitedNodes, visitedEdges, visitedNodeIds);

        return new TraversalResult(originId, depthLimit, visitedNodes, visitedEdges);
    }

    private void processQueue(Queue<AbstractMap.SimpleEntry<String, Integer>> queue,
                              int depthLimit,
                              Set<EntityNode> visitedNodes,
                              List<RelationshipEdge> visitedEdges,
                              Set<String> visitedNodeIds) {
        while (!queue.isEmpty()) {
            AbstractMap.SimpleEntry<String, Integer> current = queue.poll();
            String currentId = current.getKey();
            int currentDepth = current.getValue();

            if (currentDepth >= depthLimit) continue;

            List<RelationshipEdge> edges = outgoingEdges.getOrDefault(currentId, List.of());
            for (RelationshipEdge edge : edges) {
                visitedEdges.add(edge);
                String neighborId = edge.targetId();
                if (!visitedNodeIds.contains(neighborId)) {
                    visitedNodeIds.add(neighborId);
                    EntityNode neighbor = nodeStore.get(neighborId);
                    if (neighbor != null) {
                        visitedNodes.add(neighbor);
                        queue.add(new AbstractMap.SimpleEntry<>(neighborId, currentDepth + 1));
                    }
                }
            }
        }
    }

    /**
     * Synthesizes and serializes a GraphRAG context block for LLM prompt augmentation.
     */
    public GraphEnrichmentResponse enrichPromptContext(List<String> seedIds, String query) {
        List<TraversalResult> subgraphs = seedIds.stream()
                .map(id -> traverse(id, DEFAULT_MAX_DEPTH))
                .toList();

        Set<EntityNode> allNodes = subgraphs.stream()
                .flatMap(r -> r.visitedNodes().stream())
                .collect(Collectors.toCollection(LinkedHashSet::new));

        Set<RelationshipEdge> allEdges = subgraphs.stream()
                .flatMap(r -> r.visitedEdges().stream())
                .collect(Collectors.toCollection(LinkedHashSet::new));

        String formattedContext = buildFormattedContext(allNodes, allEdges);

        return new GraphEnrichmentResponse(
                query,
                allNodes.size(),
                allEdges.size(),
                formattedContext,
                subgraphs
        );
    }

    private String buildFormattedContext(Set<EntityNode> nodes, Set<RelationshipEdge> edges) {
        StringBuilder sb = new StringBuilder();
        sb.append("=== INSURANCE KNOWLEDGE GRAPH ATTRIBUTED CONTEXT ===\n");
        sb.append("Entities Identified:\n");
        for (EntityNode n : nodes) {
            sb.append(String.format(" - [%s] %s (%s) | Attributes: %s\n",
                    n.type(), n.name(), n.id(), n.properties()));
        }
        sb.append("\nGraph Relational Assertions:\n");
        for (RelationshipEdge e : edges) {
            sb.append(String.format(" - (%s) -[:%s]-> (%s) | %s\n",
                    e.sourceId(), e.type(), e.targetId(), e.properties()));
        }
        sb.append("=== END INSURANCE KNOWLEDGE GRAPH CONTEXT ===\n");
        return sb.toString();
    }

    public Map<String, Object> getStatistics() {
        Map<EntityType, Long> nodeCounts = nodeStore.values().stream()
                .collect(Collectors.groupingBy(EntityNode::type, Collectors.counting()));
        int totalEdges = outgoingEdges.values().stream().mapToInt(List::size).sum();

        return Map.of(
                "totalNodes", nodeStore.size(),
                "totalEdges", totalEdges,
                "nodeBreakdown", nodeCounts
        );
    }

    public Optional<EntityNode> getNode(String id) {
        return Optional.ofNullable(nodeStore.get(id));
    }

    public List<EntityNode> getAllNodes() {
        return new ArrayList<>(nodeStore.values());
    }

    private void bootstrapInsuranceKnowledgeGraph() {
        log.info("Bootstrapping baseline Insurance Policy & Claims Knowledge Graph...");
        loadInsuranceEntities();
        loadInsuranceEdges();
        log.info("Insurance knowledge graph loaded: {} nodes, {} edges",
                nodeStore.size(), outgoingEdges.values().stream().mapToInt(List::size).sum());
    }

    private void loadInsuranceEntities() {
        EntityNode policy = new EntityNode("POL-CYBER-PROP-2026-99", "GlobalTech Enterprise Combined Cyber & Property Policy",
                EntityType.POLICY, Map.of("effectiveDate", "2026-01-01", "aggregateLimitUsd", 10000000, "policyholder", "GlobalTech Solutions Inc"));
        EntityNode covBI = new EntityNode("COV-BI", "Business Interruption & Contingent Business Interruption",
                EntityType.COVERAGE, Map.of("limitUsd", 5000000, "waitingPeriodHours", 72, "category", "BUSINESS_INTERRUPTION"));
        EntityNode covExt = new EntityNode("COV-CYBER-EXT", "Cyber Extortion & Ransom Reimbursement",
                EntityType.COVERAGE, Map.of("limitUsd", 2000000, "subLimitUsd", 1000000, "category", "CYBER_EXTORTION"));
        EntityNode waitClause = new EntityNode("CLS-COND-WAIT-72H", "Condition 8.1: 72-Hour Waiting Period on Interruption Losses",
                EntityType.CLAUSE, Map.of("clauseNumber", "8.1", "strictness", "MANDATORY", "deductibleHours", 72));
        EntityNode exclCve = new EntityNode("EXCL-UNPATCHED-CVE", "Exclusion 4.2: Critical Known Vulnerability Unpatched > 30 Days",
                EntityType.EXCLUSION, Map.of("code", "SEC-EX-4.2", "severity", "TOTAL_BAR", "gracePeriodDays", 30));
        EntityNode assetDc = new EntityNode("ASSET-DC-01", "Virginia Primary Cloud Data Center & Colocation",
                EntityType.INSURED_ASSET, Map.of("declaredValueUsd", 15000000, "location", "Ashburn, VA"));
        EntityNode perilRansom = new EntityNode("PERIL-RANSOMWARE", "BlackCat Ransomware Encryption & Operational Disruption",
                EntityType.PERIL, Map.of("perilClass", "MALICIOUS_CYBER_ATTACK", "initialVector", "Compromised VPN"));
        EntityNode claim = new EntityNode("CLM-2026-8801", "GlobalTech Datacenter Cyber Lockout Loss Claim",
                EntityType.CLAIM, Map.of("claimedLossUsd", 3200000, "incidentDate", "2026-03-12", "status", "UNDER_ADJUDICATION"));
        EntityNode naicStd = new EntityNode("STD-NAIC-MDL-668", "NAIC Insurance Data Security Model Law (Model 668)",
                EntityType.REGULATORY_STANDARD, Map.of("authority", "NAIC", "enacted", "2022"));

        List.of(policy, covBI, covExt, waitClause, exclCve, assetDc, perilRansom, claim, naicStd)
                .forEach(this::upsertNode);
    }

    private void loadInsuranceEdges() {
        addEdge(new RelationshipEdge("POL-CYBER-PROP-2026-99", "COV-BI", RelationshipType.CONTAINS_COVERAGE, Map.of("section", "Section II")));
        addEdge(new RelationshipEdge("POL-CYBER-PROP-2026-99", "COV-CYBER-EXT", RelationshipType.CONTAINS_COVERAGE, Map.of("section", "Section IV")));
        addEdge(new RelationshipEdge("COV-BI", "CLS-COND-WAIT-72H", RelationshipType.GOVERNED_BY, Map.of("conditionType", "WAITING_PERIOD")));
        addEdge(new RelationshipEdge("COV-CYBER-EXT", "EXCL-UNPATCHED-CVE", RelationshipType.SUBJECT_TO, Map.of("strictApplication", true)));
        addEdge(new RelationshipEdge("CLM-2026-8801", "POL-CYBER-PROP-2026-99", RelationshipType.FILED_UNDER, Map.of("claimantNoticeDays", 4)));
        addEdge(new RelationshipEdge("CLM-2026-8801", "PERIL-RANSOMWARE", RelationshipType.CAUSED_BY, Map.of("forensicStatus", "CONFIRMED")));
        addEdge(new RelationshipEdge("CLM-2026-8801", "ASSET-DC-01", RelationshipType.INVOLVES_ASSET, Map.of("impactType", "TOTAL_OUTAGE")));
        addEdge(new RelationshipEdge("CLM-2026-8801", "EXCL-UNPATCHED-CVE", RelationshipType.TRIGGERS_EXCLUSION, Map.of("unpatchedVulnCve", "CVE-2026-2189")));
        addEdge(new RelationshipEdge("POL-CYBER-PROP-2026-99", "STD-NAIC-MDL-668", RelationshipType.EVALUATED_AGAINST, Map.of("complianceTier", "TIER_1")));
    }
}
