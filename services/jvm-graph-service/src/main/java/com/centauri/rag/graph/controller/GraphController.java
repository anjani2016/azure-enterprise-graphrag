package com.centauri.rag.graph.controller;

import com.centauri.rag.graph.model.*;
import com.centauri.rag.graph.service.CypherGraphRAGService;
import com.centauri.rag.graph.service.DeterministicPdfBoxRenderer;
import com.centauri.rag.graph.service.EventSourcedWorkflowEngine;
import com.centauri.rag.graph.service.KnowledgeGraphEngine;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;
import java.util.Map;

/**
 * REST controller exposing knowledge graph queries, Neo4j/Cypher GraphRAG,
 * Apache PDFBox deterministic rendering, and event-sourced workflow streams.
 */
@RestController
@RequestMapping("/api/graph")
@CrossOrigin(origins = "*")
public class GraphController {

    private final KnowledgeGraphEngine graphEngine;
    private final CypherGraphRAGService cypherService;
    private final DeterministicPdfBoxRenderer pdfBoxRenderer;
    private final EventSourcedWorkflowEngine eventSourcedEngine;

    public GraphController(
            KnowledgeGraphEngine graphEngine,
            CypherGraphRAGService cypherService,
            DeterministicPdfBoxRenderer pdfBoxRenderer,
            EventSourcedWorkflowEngine eventSourcedEngine) {
        this.graphEngine = graphEngine;
        this.cypherService = cypherService;
        this.pdfBoxRenderer = pdfBoxRenderer;
        this.eventSourcedEngine = eventSourcedEngine;
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

    // Neo4j / Cypher GraphRAG Endpoints
    @GetMapping("/cypher/claim/{claimId}")
    public ResponseEntity<CypherGraphRAGService.CypherQueryResult> getClaimCypherGraph(@PathVariable String claimId) {
        return ResponseEntity.ok(cypherService.executeClaimAdjudicationCypher(claimId));
    }

    @GetMapping("/cypher/policy/{policyNumber}")
    public ResponseEntity<CypherGraphRAGService.CypherQueryResult> getPolicyCypherGraph(@PathVariable String policyNumber) {
        return ResponseEntity.ok(cypherService.executePolicyCoverageCypher(policyNumber));
    }

    // Deterministic Apache PDFBox Document Rendering Endpoint
    @PostMapping("/documents/pdfbox")
    public ResponseEntity<byte[]> renderPdfBoxDocument(@RequestBody DeterministicPdfBoxRenderer.AdjudicationBriefData data) throws IOException {
        byte[] pdfBytes = pdfBoxRenderer.renderAdjudicationBrief(data);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "Adjudication_Brief_" + data.claimId() + ".pdf");
        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    }

    // Akka-style Event-Sourced Aggregate Replay & Stream
    @GetMapping("/events/{claimId}")
    public ResponseEntity<EventSourcedWorkflowEngine.ClaimAggregateState> getRehydratedClaimState(@PathVariable String claimId) {
        return ResponseEntity.ok(eventSourcedEngine.rehydrateAggregate(claimId));
    }

    @GetMapping("/events/{claimId}/history")
    public ResponseEntity<List<EventSourcedWorkflowEngine.ClaimDomainEvent>> getClaimEventHistory(@PathVariable String claimId) {
        return ResponseEntity.ok(eventSourcedEngine.getEventStream(claimId));
    }
}
