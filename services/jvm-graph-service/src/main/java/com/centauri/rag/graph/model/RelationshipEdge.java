package com.centauri.rag.graph.model;

import java.util.Map;
import java.util.Objects;

/**
 * Knowledge graph directed relationship edge connecting two entities.
 *
 * @param sourceId Origin node identifier
 * @param targetId Destination node identifier
 * @param type Relationship predicate type
 * @param properties Edge metadata (e.g. confidence score, extraction page, risk weight)
 */
public record RelationshipEdge(
        String sourceId,
        String targetId,
        RelationshipType type,
        Map<String, Object> properties
) {
    public RelationshipEdge {
        Objects.requireNonNull(sourceId, "sourceId cannot be null");
        Objects.requireNonNull(targetId, "targetId cannot be null");
        Objects.requireNonNull(type, "Relationship type cannot be null");
        properties = properties == null ? Map.of() : Map.copyOf(properties);
    }
}
