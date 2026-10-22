package com.centauri.rag.graph;

import com.centauri.rag.graph.model.*;
import com.centauri.rag.graph.service.KnowledgeGraphEngine;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class KnowledgeGraphEngineTest {

    private KnowledgeGraphEngine engine;

    @BeforeEach
    void setUp() {
        engine = new KnowledgeGraphEngine();
        engine.initSeedData();
    }

    @Test
    void testBootstrapNodesExist() {
        var stats = engine.getStatistics();
        assertTrue((int) stats.get("totalNodes") >= 6);
        assertTrue((int) stats.get("totalEdges") >= 6);
        assertTrue(engine.getNode("EQ-C-101").isPresent());
    }

    @Test
    void testTraversalReturnsConnectedNeighbors() {
        TraversalResult result = engine.traverse("EQ-C-101", 2);
        assertNotNull(result);
        assertEquals("EQ-C-101", result.originNodeId());
        assertTrue(result.visitedNodes().size() >= 3);
        assertTrue(result.visitedNodes().stream().anyMatch(n -> n.id().equals("STD-OISD-179")));
    }

    @Test
    void testPromptEnrichmentGeneratesAttributedContext() {
        GraphEnrichmentResponse response = engine.enrichPromptContext(
                List.of("EQ-C-101"), "Review compressor compliance against standards");

        assertNotNull(response);
        assertTrue(response.totalNodes() >= 3);
        assertTrue(response.formattedContext().contains("KNOWLEDGE GRAPH ATTRIBUTED CONTEXT"));
        assertTrue(response.formattedContext().contains("STD-OISD-179"));
    }
}
