package com.centauri.rag.graph.model;

import java.util.Map;
import java.util.Objects;

/**
 * Knowledge graph entity node representation.
 *
 * @param id Unique identifier of the node (e.g. "EQUIP-C-101", "CLAUSE-GCC-24.1")
 * @param name Human-readable label or title
 * @param type Categorized entity type
 * @param properties Key-value attribute dictionary containing domain metadata
 */
public record EntityNode(
        String id,
        String name,
        EntityType type,
        Map<String, Object> properties
) {
    public EntityNode {
        Objects.requireNonNull(id, "Node id cannot be null");
        Objects.requireNonNull(name, "Node name cannot be null");
        Objects.requireNonNull(type, "Node type cannot be null");
        properties = properties == null ? Map.of() : Map.copyOf(properties);
    }
}
