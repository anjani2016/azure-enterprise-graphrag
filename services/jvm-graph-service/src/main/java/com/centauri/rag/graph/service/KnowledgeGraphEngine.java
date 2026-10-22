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
 * High-performance in-memory Knowledge Graph engine for entity-relationship
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
        bootstrapEpcKnowledgeGraph();
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
        sb.append("=== KNOWLEDGE GRAPH ATTRIBUTED CONTEXT ===\n");
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
        sb.append("=== END KNOWLEDGE GRAPH CONTEXT ===\n");
        return sb.toString();
    }

    /**
     * Returns graph topology statistics.
     */
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

    private void bootstrapEpcKnowledgeGraph() {
        log.info("Bootstrapping baseline EPC Engineering Knowledge Graph...");
        EntityNode tenderDoc = new EntityNode("DOC-TENDER-GAIL-2026", "GAIL CBG Plant Panipat Tender",
                EntityType.DOCUMENT, Map.of("version", "R1", "pages", 480));
        EntityNode specCode = new EntityNode("STD-OISD-179", "OISD-179 Safety Requirements in Gas Processing",
                EntityType.STANDARD, Map.of("authority", "OISD", "status", "MANDATORY"));
        EntityNode pesoStd = new EntityNode("STD-PESO-SMPV", "PESO Static and Mobile Pressure Vessels Rules",
                EntityType.STANDARD, Map.of("authority", "PESO", "enacted", "2016"));
        EntityNode compressor = new EntityNode("EQ-C-101", "Feedstock Biogas Screw Compressor Package",
                EntityType.EQUIPMENT, Map.of("capacityNm3Hr", 1200, "dischargeBar", 16.5, "system", "COMPRESSION"));
        EntityNode ldClause = new EntityNode("CLS-GCC-24.1", "Liquidated Damages for Delay (0.5% per week, max 10%)",
                EntityType.CLAUSE, Map.of("riskLevel", "HIGH", "category", "COMMERCIAL_RISK"));
        EntityNode vendorA = new EntityNode("VND-KIRLOSKAR", "Kirloskar Pneumatic Company Ltd",
                EntityType.VENDOR, Map.of("tier", "TIER_1", "country", "India"));
        EntityNode dev1 = new EntityNode("DEV-001", "Discharge temperature deviation beyond OISD-179 limits",
                EntityType.DEVIATION, Map.of("severity", "UNACCEPTABLE_TECHNICAL", "clauseRef", "CLS-GCC-24.1"));

        List.of(tenderDoc, specCode, pesoStd, compressor, ldClause, vendorA, dev1).forEach(this::upsertNode);

        addEdge(new RelationshipEdge("DOC-TENDER-GAIL-2026", "CLS-GCC-24.1", RelationshipType.CONTAINS, Map.of("page", 42)));
        addEdge(new RelationshipEdge("CLS-GCC-24.1", "EQ-C-101", RelationshipType.SPECIFIES, Map.of("criticality", "HIGH")));
        addEdge(new RelationshipEdge("EQ-C-101", "STD-OISD-179", RelationshipType.GOVERNED_BY, Map.of("clause", "Section 4.3")));
        addEdge(new RelationshipEdge("EQ-C-101", "STD-PESO-SMPV", RelationshipType.GOVERNED_BY, Map.of("rule", "Rule 18")));
        addEdge(new RelationshipEdge("VND-KIRLOSKAR", "EQ-C-101", RelationshipType.QUOTES, Map.of("quoteRef", "KPCL-2026-Q4")));
        addEdge(new RelationshipEdge("DEV-001", "EQ-C-101", RelationshipType.AFFECTS, Map.of("costPenaltyInr", 450000)));
        addEdge(new RelationshipEdge("DEV-001", "STD-OISD-179", RelationshipType.VIOLATES, Map.of("clause", "4.3.2 Max temp 65C")));

        log.info("Baseline knowledge graph loaded: {} nodes, {} edges", nodeStore.size(), outgoingEdges.values().stream().mapToInt(List::size).sum());
    }
}
