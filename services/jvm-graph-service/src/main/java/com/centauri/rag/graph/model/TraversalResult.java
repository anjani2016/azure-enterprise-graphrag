package com.centauri.rag.graph.model;

import java.util.List;
import java.util.Set;

/**
 * Result of a multi-hop graph traversal query.
 *
 * @param originNodeId Root query node
 * @param maxDepth Traversal depth evaluated
 * @param visitedNodes Discovered entity nodes in the subgraph
 * @param visitedEdges Traversed relationship edges in the subgraph
 */
public record TraversalResult(
        String originNodeId,
        int maxDepth,
        Set<EntityNode> visitedNodes,
        List<RelationshipEdge> visitedEdges
) {}
