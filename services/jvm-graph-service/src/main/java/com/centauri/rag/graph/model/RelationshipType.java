package com.centauri.rag.graph.model;

/**
 * Directional relationship predicates connecting entities in the insurance knowledge graph.
 */
public enum RelationshipType {
    CONTAINS_COVERAGE,
    SUBJECT_TO,
    GOVERNED_BY,
    FILED_UNDER,
    CAUSED_BY,
    INVOLVES_ASSET,
    TRIGGERS_EXCLUSION,
    EVALUATED_AGAINST
}
