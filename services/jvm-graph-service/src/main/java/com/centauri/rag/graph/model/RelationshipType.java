package com.centauri.rag.graph.model;

/**
 * Directional relationship predicates connecting entities in the knowledge graph.
 */
public enum RelationshipType {
    CONTAINS,
    SPECIFIES,
    GOVERNED_BY,
    QUOTES,
    SUBMITS,
    DEVIATES_FROM,
    AFFECTS,
    VIOLATES
}
