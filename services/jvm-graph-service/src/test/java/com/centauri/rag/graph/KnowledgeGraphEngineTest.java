package com.centauri.rag.graph;

import com.centauri.rag.graph.model.*;
import com.centauri.rag.graph.service.KnowledgeGraphEngine;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class KnowledgeGraphEngineTest {

    private KnowledgeGraphEngine engine;

    @BeforeEach
    void setUp() {
        engine = new KnowledgeGraphEngine();
        engine.initSeedData();
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
        assertTrue(result.visitedNodes().stream().anyMatch(n -> n.id().equals("POL-CYBER-PROP-2026-99")));
    }

    @Test
    void testPromptEnrichmentGeneratesAttributedContext() {
        GraphEnrichmentResponse response = engine.enrichPromptContext(
                List.of("CLM-2026-8801"), "Adjudicate ransomware claim coverage under cyber policy");

        assertNotNull(response);
        assertTrue(response.totalNodes() >= 4);
        assertTrue(response.formattedContext().contains("INSURANCE KNOWLEDGE GRAPH ATTRIBUTED CONTEXT"));
        assertTrue(response.formattedContext().contains("EXCL-UNPATCHED-CVE"));
        assertTrue(response.formattedContext().contains("POL-CYBER-PROP-2026-99"));
    }
}
