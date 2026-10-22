package com.centauri.rag.graph.model;

import java.util.List;

/**
 * Serialized GraphRAG context ready for LLM prompt augmentation.
 *
 * @param query Seed query or entities identified
 * @param totalNodes Number of relevant nodes found
 * @param totalEdges Number of relevant edges found
 * @param formattedContext Grounded context string formatted for system prompt injection
 * @param subgraphs Structured subgraph details per seed node
 */
public record GraphEnrichmentResponse(
        String query,
        int totalNodes,
        int totalEdges,
        String formattedContext,
        List<TraversalResult> subgraphs
) {}
