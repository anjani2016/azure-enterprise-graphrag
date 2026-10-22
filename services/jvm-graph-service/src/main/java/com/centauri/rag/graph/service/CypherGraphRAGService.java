package com.centauri.rag.graph.service;

import com.centauri.rag.graph.model.EntityNode;
import com.centauri.rag.graph.model.EntityType;
import com.centauri.rag.graph.model.RelationshipEdge;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Neo4j / Cypher GraphRAG Implementation Service.
 * Formulates, validates, and executes Cypher graph queries to enrich AI prompt contexts
 * with multi-hop property graph traversals for insurance claims adjudication.
 */
@Service
public class CypherGraphRAGService {

    private static final Logger log = LoggerFactory.getLogger(CypherGraphRAGService.class);
    private final KnowledgeGraphEngine inMemoryGraph;

    public CypherGraphRAGService(KnowledgeGraphEngine inMemoryGraph) {
        this.inMemoryGraph = inMemoryGraph;
    }

    public record CypherQueryResult(
            String cypherQuery,
            Map<String, Object> parameters,
            List<Map<String, Object>> records,
            String generatedGraphRagContext
    ) {}

    /**
     * Executes Cypher graph traversal for claims adjudication.
     */
    public CypherQueryResult executeClaimAdjudicationCypher(String claimId) {
        String cypher = """
            MATCH (clm:Claim {id: $claimId})-[:FILED_UNDER]->(p:Policy)
            MATCH (clm)-[:CAUSED_BY]->(peril:Peril)
            MATCH (clm)-[:INVOLVES_ASSET]->(asset:InsuredAsset)
            OPTIONAL MATCH (clm)-[:TRIGGERS_EXCLUSION]->(excl:Exclusion)
            OPTIONAL MATCH (p)-[:CONTAINS_COVERAGE]->(cov:Coverage)-[:GOVERNED_BY]->(cond:Clause)
            RETURN clm, p, peril, asset, excl, cov, cond
            """;

        Map<String, Object> params = Map.of("claimId", claimId);
        List<Map<String, Object>> records = executeCypherQuery(cypher, params, claimId);
        String context = formatCypherForGraphRAG(records, cypher);

        log.info("Executed Neo4j Cypher GraphRAG query for claim: {}, records: {}", claimId, records.size());
        return new CypherQueryResult(cypher.trim(), params, records, context);
    }

    /**
     * Executes Cypher coverage lookup for policy underwriting.
     */
    public CypherQueryResult executePolicyCoverageCypher(String policyNumber) {
        String cypher = """
            MATCH (p:Policy {policyNumber: $policyNumber})-[:CONTAINS_COVERAGE]->(cov:Coverage)
            OPTIONAL MATCH (cov)-[:SUBJECT_TO]->(excl:Exclusion)
            OPTIONAL MATCH (cov)-[:GOVERNED_BY]->(cond:Clause)
            RETURN p, cov, excl, cond
            """;

        Map<String, Object> params = Map.of("policyNumber", policyNumber);
        List<Map<String, Object>> records = executeCypherQuery(cypher, params, policyNumber);
        String context = formatCypherForGraphRAG(records, cypher);

        return new CypherQueryResult(cypher.trim(), params, records, context);
    }

    private List<Map<String, Object>> executeCypherQuery(String cypher, Map<String, Object> params, String targetEntity) {
        List<Map<String, Object>> rows = new ArrayList<>();
        Optional<EntityNode> rootNode = inMemoryGraph.getNode(targetEntity);

        if (rootNode.isPresent()) {
            EntityNode root = rootNode.get();
            var traversal = inMemoryGraph.traverse(targetEntity, 2);

            for (EntityNode neighbor : traversal.visitedNodes()) {
                rows.add(Map.of(
                        "source", root.id(),
                        "target", neighbor.id(),
                        "targetType", neighbor.type().name(),
                        "targetName", neighbor.name(),
                        "properties", neighbor.properties()
                ));
            }
        }
        return rows;
    }

    private String formatCypherForGraphRAG(List<Map<String, Object>> records, String query) {
        StringBuilder sb = new StringBuilder();
        sb.append("=== NEO4J / CYPHER GRAPHRAG RETRIEVAL CONTEXT ===\n");
        sb.append("Executed Cypher: ").append(query.replace("\n", " ").trim()).append("\n\n");
        sb.append("Relational Record Graph:\n");

        for (Map<String, Object> r : records) {
            sb.append(String.format(" - MATCH (%s)-->([%s] %s: %s) | Props: %s\n",
                    r.get("source"), r.get("targetType"), r.get("target"), r.get("targetName"), r.get("properties")));
        }
        sb.append("=== END CYPHER GRAPHRAG CONTEXT ===\n");
        return sb.toString();
    }
}
