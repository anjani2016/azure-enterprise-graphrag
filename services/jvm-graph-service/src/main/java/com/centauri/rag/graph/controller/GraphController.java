package com.centauri.rag.graph.controller;

import com.centauri.rag.graph.model.*;
import com.centauri.rag.graph.service.KnowledgeGraphEngine;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST controller exposing knowledge graph queries and GraphRAG context enrichment endpoints.
 */
@RestController
@RequestMapping("/api/graph")
@CrossOrigin(origins = "*")
public class GraphController {

    private final KnowledgeGraphEngine graphEngine;

    public GraphController(KnowledgeGraphEngine graphEngine) {
        this.graphEngine = graphEngine;
    }

    @PostMapping("/nodes")
    public ResponseEntity<EntityNode> createNode(@Valid @RequestBody EntityNode node) {
        return ResponseEntity.status(HttpStatus.CREATED).body(graphEngine.upsertNode(node));
    }

    @GetMapping("/nodes/{id}")
    public ResponseEntity<EntityNode> getNode(@PathVariable String id) {
        return graphEngine.getNode(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/nodes")
    public ResponseEntity<List<EntityNode>> listNodes() {
        return ResponseEntity.ok(graphEngine.getAllNodes());
    }

    @PostMapping("/edges")
    public ResponseEntity<RelationshipEdge> createEdge(@Valid @RequestBody RelationshipEdge edge) {
        return ResponseEntity.status(HttpStatus.CREATED).body(graphEngine.addEdge(edge));
    }

    @GetMapping("/traverse")
    public ResponseEntity<TraversalResult> traverse(
            @RequestParam String originId,
            @RequestParam(defaultValue = "2") int maxDepth) {
        return ResponseEntity.ok(graphEngine.traverse(originId, maxDepth));
    }

    public record EnrichmentRequest(List<String> seedIds, String query) {}

    @PostMapping("/enrich")
    public ResponseEntity<GraphEnrichmentResponse> enrichPromptContext(@RequestBody EnrichmentRequest request) {
        List<String> seeds = request.seedIds() == null ? List.of() : request.seedIds();
        String q = request.query() == null ? "" : request.query();
        return ResponseEntity.ok(graphEngine.enrichPromptContext(seeds, q));
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(graphEngine.getStatistics());
    }
}
