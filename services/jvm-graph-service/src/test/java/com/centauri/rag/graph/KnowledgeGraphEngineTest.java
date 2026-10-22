package com.centauri.rag.graph;

import com.centauri.rag.graph.model.*;
import com.centauri.rag.graph.service.CypherGraphRAGService;
import com.centauri.rag.graph.service.DeterministicPdfBoxRenderer;
import com.centauri.rag.graph.service.EventSourcedWorkflowEngine;
import com.centauri.rag.graph.service.KnowledgeGraphEngine;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.time.Instant;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class KnowledgeGraphEngineTest {

    private KnowledgeGraphEngine engine;
    private CypherGraphRAGService cypherService;
    private DeterministicPdfBoxRenderer pdfBoxRenderer;
    private EventSourcedWorkflowEngine eventEngine;

    @BeforeEach
    void setUp() {
        engine = new KnowledgeGraphEngine();
        engine.initSeedData();
        cypherService = new CypherGraphRAGService(engine);
        pdfBoxRenderer = new DeterministicPdfBoxRenderer();
        eventEngine = new EventSourcedWorkflowEngine();
    }

    @Test
    void testBootstrapInsuranceNodesExist() {
        var stats = engine.getStatistics();
        assertTrue((int) stats.get("totalNodes") >= 8);
        assertTrue((int) stats.get("totalEdges") >= 8);
        assertTrue(engine.getNode("POL-CYBER-PROP-2026-99").isPresent());
        assertTrue(engine.getNode("CLM-2026-8801").isPresent());
        assertTrue(engine.getNode("EXCL-UNPATCHED-CVE").isPresent());
    }

    @Test
    void testTraversalReturnsConnectedNeighbors() {
        TraversalResult result = engine.traverse("CLM-2026-8801", 2);
        assertNotNull(result);
        assertEquals("CLM-2026-8801", result.originNodeId());
        assertTrue(result.visitedNodes().size() >= 4);
        assertTrue(result.visitedNodes().stream().anyMatch(n -> n.id().equals("EXCL-UNPATCHED-CVE")));
    }

    @Test
    void testCypherGraphRAGQueryExecution() {
        var cypherResult = cypherService.executeClaimAdjudicationCypher("CLM-2026-8801");
        assertNotNull(cypherResult);
        assertTrue(cypherResult.cypherQuery().contains("MATCH (clm:Claim"));
        assertTrue(cypherResult.records().size() >= 3);
        assertTrue(cypherResult.generatedGraphRagContext().contains("NEO4J / CYPHER GRAPHRAG"));
        assertTrue(cypherResult.generatedGraphRagContext().contains("EXCL-UNPATCHED-CVE"));
    }

    @Test
    void testDeterministicPdfBoxRenderingProducesValidPdf() throws IOException {
        var briefData = new DeterministicPdfBoxRenderer.AdjudicationBriefData(
                "CLM-2026-8801",
                "POL-CYBER-PROP-2026-99",
                "GlobalTech Solutions Inc",
                3200000.0,
                "RESERVATION_OF_RIGHTS",
                List.of("Exclusion 4.2: Critical Known Vulnerability Unpatched > 30 Days"),
                List.of("Condition 8.1: 72-Hour Waiting Period Deductible"),
                "Issue formal Reservation of Rights (RoR) notice pending root cause patch verification."
        );

        byte[] pdfBytes = pdfBoxRenderer.renderAdjudicationBrief(briefData);
        assertNotNull(pdfBytes);
        assertTrue(pdfBytes.length > 500);
        // Verify PDF Magic Bytes %PDF
        assertEquals('%', (char) pdfBytes[0]);
        assertEquals('P', (char) pdfBytes[1]);
        assertEquals('D', (char) pdfBytes[2]);
        assertEquals('F', (char) pdfBytes[3]);
    }

    @Test
    void testEventSourcedWorkflowAggregateReplay() {
        String claimId = "CLM-2026-9999";
        eventEngine.appendEvent(new EventSourcedWorkflowEngine.ClaimSubmittedEvent(
                claimId, "POL-CYBER-PROP-2026-99", 500000.0, Instant.now(), 1));
        eventEngine.appendEvent(new EventSourcedWorkflowEngine.CypherGraphEnrichmentComputedEvent(
                claimId, 5, List.of("EXCL-UNPATCHED-CVE"), Instant.now(), 2));
        eventEngine.appendEvent(new EventSourcedWorkflowEngine.AiAdjudicationAttachedEvent(
                claimId, 85, "Recommend Reservation of Rights", Instant.now(), 3));
        eventEngine.appendEvent(new EventSourcedWorkflowEngine.HumanAdjusterReviewCompletedEvent(
                claimId, "ADJ-401", "APPROVED_ROR", "Confirmed unpatched VPN entry", Instant.now(), 4));

        var state = eventEngine.rehydrateAggregate(claimId);
        assertNotNull(state);
        assertEquals(claimId, state.claimId());
        assertEquals("APPROVED_ROR", state.status());
        assertEquals(4, state.currentVersion());
        assertEquals("APPROVED_ROR", state.adjusterDecision());
        assertEquals(4, eventEngine.getEventStream(claimId).size());
    }
}
