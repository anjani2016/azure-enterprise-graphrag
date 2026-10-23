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

        // Policy 2: Commercial Property (ISO CP 00 10)
        EntityNode polProp = new EntityNode("POL-2026-COMM-PROPERTY", "Apex Logistics Commercial Property Policy",
                EntityType.POLICY, Map.of("effectiveDate", "2026-03-01", "aggregateLimitUsd", 25000000, "policyholder", "Apex Logistics & Warehousing Ltd"));
        EntityNode covBldg = new EntityNode("COV-BLDG", "Building and Structure Direct Physical Loss",
                EntityType.COVERAGE, Map.of("limitUsd", 18000000, "category", "PROPERTY_DAMAGE"));
        EntityNode covBpp = new EntityNode("COV-BPP", "Business Personal Property & Stock in Warehouse",
                EntityType.COVERAGE, Map.of("limitUsd", 5000000, "category", "CONTENTS"));
        EntityNode exclFlood = new EntityNode("EXCL-FLOOD-SURFACE", "Exclusion 7.1: Surface Water & Flood Intrusion",
                EntityType.EXCLUSION, Map.of("code", "CP-EX-7.1", "severity", "TOTAL_BAR"));
        EntityNode clsSprinkler = new EntityNode("CLS-SPRINKLER", "Condition 4.5: Automatic Sprinkler System Maintenance",
                EntityType.CLAUSE, Map.of("clauseNumber", "4.5", "strictness", "MANDATORY"));
        List.of(polProp, covBldg, covBpp, exclFlood, clsSprinkler).forEach(this::upsertNode);

        // Policy 3: Equipment Breakdown (ISO BM 00 20)
        EntityNode polMach = new EntityNode("POL-MACH-2026-04", "Quantum Clean Energy Turbomachinery Breakdown Policy",
                EntityType.POLICY, Map.of("effectiveDate", "2026-05-01", "aggregateLimitUsd", 15000000, "policyholder", "Quantum Clean Energy GenCorp"));
        EntityNode covTurbine = new EntityNode("COV-TURBINE", "High-Pressure Turbine & Compressor Breakdown",
                EntityType.COVERAGE, Map.of("limitUsd", 10000000, "category", "MACHINERY"));
        EntityNode exclCorrosion = new EntityNode("EXCL-CORROSION", "Exclusion 2.4: Chemical Corrosion & Cavitation",
                EntityType.EXCLUSION, Map.of("code", "BM-EX-2.4", "severity", "TOTAL_BAR"));
        EntityNode clsOem = new EntityNode("CLS-OEM-SERVICE", "Warranty 9.1: Annual OEM Certified Maintenance",
                EntityType.CLAUSE, Map.of("clauseNumber", "9.1", "strictness", "MANDATORY"));
        List.of(polMach, covTurbine, exclCorrosion, clsOem).forEach(this::upsertNode);

        // Policy 4: Commercial General Liability (ISO CG 00 01)
        EntityNode polGl = new EntityNode("POL-GL-2026-55", "Vanguard Construction Commercial General Liability Policy",
                EntityType.POLICY, Map.of("effectiveDate", "2026-07-01", "aggregateLimitUsd", 10000000, "policyholder", "Vanguard Construction & Engineering Corp"));
        EntityNode covBipd = new EntityNode("COV-BIPD", "Bodily Injury & Property Damage Third-Party Liability",
                EntityType.COVERAGE, Map.of("limitUsd", 2000000, "category", "GENERAL_LIABILITY"));
        EntityNode exclPoll = new EntityNode("EXCL-POLLUTION-TOTAL", "Exclusion f: Total Environmental Pollution Exclusion",
                EntityType.EXCLUSION, Map.of("code", "CG-EX-F", "severity", "TOTAL_BAR"));
        EntityNode clsNotice = new EntityNode("CLS-NOTICE-10D", "Condition 2.a: 10-Day Written Occurrence Notice",
                EntityType.CLAUSE, Map.of("clauseNumber", "2.a", "strictness", "MANDATORY"));
        List.of(polGl, covBipd, exclPoll, clsNotice).forEach(this::upsertNode);

        // Policy 5: Directors & Officers (D&O)
        EntityNode polDo = new EntityNode("POL-DO-2026-12", "Horizon Autonomous Robotics Directors & Officers Executive Form",
                EntityType.POLICY, Map.of("effectiveDate", "2026-02-15", "aggregateLimitUsd", 20000000, "policyholder", "Horizon Autonomous Robotics Inc"));
        EntityNode covSideA = new EntityNode("COV-SIDE-A", "Side A Non-Indemnifiable Individual Director/Officer DIC",
                EntityType.COVERAGE, Map.of("limitUsd", 10000000, "category", "EXECUTIVE_RISK"));
        EntityNode exclFraud = new EntityNode("EXCL-FRAUD-JUDICIAL", "Exclusion 3.1: Deliberate Fraud (Final Judicial Adjudication Standard)",
                EntityType.EXCLUSION, Map.of("code", "DO-EX-3.1", "severity", "TOTAL_BAR"));
        List.of(polDo, covSideA, exclFraud).forEach(this::upsertNode);

        // Policy 6: Commercial Inland Marine & Cargo (ISO CM 00 20)
        EntityNode polCargo = new EntityNode("POL-CARGO-2026-77", "Pacifica Global Inland Marine & Cargo Transit Policy",
                EntityType.POLICY, Map.of("effectiveDate", "2026-04-01", "aggregateLimitUsd", 12000000, "policyholder", "Pacifica Global Freight Forwarders LLC"));
        EntityNode covTransit = new EntityNode("COV-TRANSIT", "Multi-Modal Freight & Cargo in Ordinary Course of Transit",
                EntityType.COVERAGE, Map.of("limitUsd", 12000000, "category", "CARGO"));
        EntityNode covReefer = new EntityNode("COV-REEFER", "Refrigerated Cargo Temperature Deviation & Spoilage",
                EntityType.COVERAGE, Map.of("limitUsd", 4000000, "category", "PERISHABLES"));
        EntityNode exclPacking = new EntityNode("EXCL-INSUFFICIENT-PACKING", "Exclusion 4.1: Insufficient Packing & Inadequate Stowage",
                EntityType.EXCLUSION, Map.of("code", "CM-EX-4.1", "severity", "TOTAL_BAR"));
        List.of(polCargo, covTransit, covReefer, exclPacking).forEach(this::upsertNode);
    }

    private void loadInsuranceEdges() {
        // Policy 1 edges
        addEdge(new RelationshipEdge("POL-CYBER-PROP-2026-99", "COV-BI", RelationshipType.CONTAINS_COVERAGE, Map.of("section", "Section II")));
        addEdge(new RelationshipEdge("POL-CYBER-PROP-2026-99", "COV-CYBER-EXT", RelationshipType.CONTAINS_COVERAGE, Map.of("section", "Section IV")));
        addEdge(new RelationshipEdge("COV-BI", "CLS-COND-WAIT-72H", RelationshipType.GOVERNED_BY, Map.of("conditionType", "WAITING_PERIOD")));
        addEdge(new RelationshipEdge("COV-CYBER-EXT", "EXCL-UNPATCHED-CVE", RelationshipType.SUBJECT_TO, Map.of("strictApplication", true)));
        addEdge(new RelationshipEdge("CLM-2026-8801", "POL-CYBER-PROP-2026-99", RelationshipType.FILED_UNDER, Map.of("claimantNoticeDays", 4)));
        addEdge(new RelationshipEdge("CLM-2026-8801", "PERIL-RANSOMWARE", RelationshipType.CAUSED_BY, Map.of("forensicStatus", "CONFIRMED")));
        addEdge(new RelationshipEdge("CLM-2026-8801", "ASSET-DC-01", RelationshipType.INVOLVES_ASSET, Map.of("impactType", "TOTAL_OUTAGE")));
        addEdge(new RelationshipEdge("CLM-2026-8801", "EXCL-UNPATCHED-CVE", RelationshipType.TRIGGERS_EXCLUSION, Map.of("unpatchedVulnCve", "CVE-2026-2189")));
        addEdge(new RelationshipEdge("POL-CYBER-PROP-2026-99", "STD-NAIC-MDL-668", RelationshipType.EVALUATED_AGAINST, Map.of("complianceTier", "TIER_1")));

        // Policy 2 edges
        addEdge(new RelationshipEdge("POL-2026-COMM-PROPERTY", "COV-BLDG", RelationshipType.CONTAINS_COVERAGE, Map.of("coverageType", "BUILDING")));
        addEdge(new RelationshipEdge("POL-2026-COMM-PROPERTY", "COV-BPP", RelationshipType.CONTAINS_COVERAGE, Map.of("coverageType", "CONTENTS")));
        addEdge(new RelationshipEdge("COV-BLDG", "EXCL-FLOOD-SURFACE", RelationshipType.SUBJECT_TO, Map.of("exclusionCode", "CP-EX-7.1")));
        addEdge(new RelationshipEdge("POL-2026-COMM-PROPERTY", "CLS-SPRINKLER", RelationshipType.GOVERNED_BY, Map.of("mandatoryService", true)));

        // Policy 3 edges
        addEdge(new RelationshipEdge("POL-MACH-2026-04", "COV-TURBINE", RelationshipType.CONTAINS_COVERAGE, Map.of("coverageType", "TURBOMACHINERY")));
        addEdge(new RelationshipEdge("COV-TURBINE", "EXCL-CORROSION", RelationshipType.SUBJECT_TO, Map.of("exclusionCode", "BM-EX-2.4")));
        addEdge(new RelationshipEdge("POL-MACH-2026-04", "CLS-OEM-SERVICE", RelationshipType.GOVERNED_BY, Map.of("maintenanceSchedule", "ANNUAL")));

        // Policy 4 edges
        addEdge(new RelationshipEdge("POL-GL-2026-55", "COV-BIPD", RelationshipType.CONTAINS_COVERAGE, Map.of("coverageType", "BODILY_INJURY_PROPERTY_DAMAGE")));
        addEdge(new RelationshipEdge("COV-BIPD", "EXCL-POLLUTION-TOTAL", RelationshipType.SUBJECT_TO, Map.of("exclusionCode", "CG-EX-F")));
        addEdge(new RelationshipEdge("POL-GL-2026-55", "CLS-NOTICE-10D", RelationshipType.GOVERNED_BY, Map.of("noticeDays", 10)));

        // Policy 5 edges
        addEdge(new RelationshipEdge("POL-DO-2026-12", "COV-SIDE-A", RelationshipType.CONTAINS_COVERAGE, Map.of("coverageType", "SIDE_A_DIC")));
        addEdge(new RelationshipEdge("COV-SIDE-A", "EXCL-FRAUD-JUDICIAL", RelationshipType.SUBJECT_TO, Map.of("trigger", "FINAL_JUDGMENT")));

        // Policy 6 edges
        addEdge(new RelationshipEdge("POL-CARGO-2026-77", "COV-TRANSIT", RelationshipType.CONTAINS_COVERAGE, Map.of("coverageType", "TRANSIT_FREIGHT")));
        addEdge(new RelationshipEdge("POL-CARGO-2026-77", "COV-REEFER", RelationshipType.CONTAINS_COVERAGE, Map.of("coverageType", "PERISHABLES_REEFER")));
        addEdge(new RelationshipEdge("COV-TRANSIT", "EXCL-INSUFFICIENT-PACKING", RelationshipType.SUBJECT_TO, Map.of("exclusionCode", "CM-EX-4.1")));
    }
}
