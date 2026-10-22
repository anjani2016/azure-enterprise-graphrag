package com.centauri.rag.graph.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * Event-Sourced Workflow Engine modeled after Akka Persistence event-sourcing principles.
 * Manages claim adjudication workflows through append-only domain event streams and state replay.
 */
@Service
public class EventSourcedWorkflowEngine {

    private static final Logger log = LoggerFactory.getLogger(EventSourcedWorkflowEngine.class);

    // Sealed-style Domain Events
    public sealed interface ClaimDomainEvent permits
            ClaimSubmittedEvent,
            CypherGraphEnrichmentComputedEvent,
            AiAdjudicationAttachedEvent,
            HumanAdjusterReviewCompletedEvent,
            DocumentBriefRenderedEvent {
        String claimId();
        Instant timestamp();
        int version();
    }

    public record ClaimSubmittedEvent(String claimId, String policyNumber, double claimedAmount, Instant timestamp, int version) implements ClaimDomainEvent {}
    public record CypherGraphEnrichmentComputedEvent(String claimId, int nodesRetrieved, List<String> triggeredExclusions, Instant timestamp, int version) implements ClaimDomainEvent {}
    public record AiAdjudicationAttachedEvent(String claimId, int riskScore, String recommendation, Instant timestamp, int version) implements ClaimDomainEvent {}
    public record HumanAdjusterReviewCompletedEvent(String claimId, String adjusterId, String decision, String comments, Instant timestamp, int version) implements ClaimDomainEvent {}
    public record DocumentBriefRenderedEvent(String claimId, String storageUri, String engine, Instant timestamp, int version) implements ClaimDomainEvent {}

    public record ClaimAggregateState(
            String claimId,
            String policyNumber,
            double claimedAmount,
            String status,
            int riskScore,
            List<String> triggeredExclusions,
            String adjusterDecision,
            String renderedDocumentUri,
            int currentVersion
    ) {
        public static ClaimAggregateState empty(String id) {
            return new ClaimAggregateState(id, "", 0.0, "UNINITIALIZED", 0, List.of(), "PENDING", "", 0);
        }
    }

    // Append-only Event Store indexed by Aggregate ID (claimId)
    private final Map<String, List<ClaimDomainEvent>> eventStore = new ConcurrentHashMap<>();

    public synchronized ClaimAggregateState appendEvent(ClaimDomainEvent event) {
        eventStore.computeIfAbsent(event.claimId(), k -> new CopyOnWriteArrayList<>()).add(event);
        log.info("Appended event [{}] to aggregate [{}] at version {}",
                event.getClass().getSimpleName(), event.claimId(), event.version());
        return rehydrateAggregate(event.claimId());
    }

    /**
     * Reconstitutes the state of a claim aggregate by replaying all historical domain events.
     */
    public ClaimAggregateState rehydrateAggregate(String claimId) {
        List<ClaimDomainEvent> history = eventStore.getOrDefault(claimId, List.of());
        ClaimAggregateState state = ClaimAggregateState.empty(claimId);

        for (ClaimDomainEvent evt : history) {
            state = applyEvent(state, evt);
        }
        return state;
    }

    public List<ClaimDomainEvent> getEventStream(String claimId) {
        return Collections.unmodifiableList(eventStore.getOrDefault(claimId, List.of()));
    }

    private ClaimAggregateState applyEvent(ClaimAggregateState state, ClaimDomainEvent event) {
        return switch (event) {
            case ClaimSubmittedEvent e -> new ClaimAggregateState(
                    e.claimId(), e.policyNumber(), e.claimedAmount(), "FILED", 0, List.of(), "PENDING", "", e.version());
            case CypherGraphEnrichmentComputedEvent e -> new ClaimAggregateState(
                    state.claimId(), state.policyNumber(), state.claimedAmount(), "GRAPH_ENRICHED", state.riskScore(), e.triggeredExclusions(), state.adjusterDecision(), state.renderedDocumentUri(), e.version());
            case AiAdjudicationAttachedEvent e -> new ClaimAggregateState(
                    state.claimId(), state.policyNumber(), state.claimedAmount(), "PENDING_HUMAN_REVIEW", e.riskScore(), state.triggeredExclusions(), state.adjusterDecision(), state.renderedDocumentUri(), e.version());
            case HumanAdjusterReviewCompletedEvent e -> new ClaimAggregateState(
                    state.claimId(), state.policyNumber(), state.claimedAmount(), e.decision(), state.riskScore(), state.triggeredExclusions(), e.decision(), state.renderedDocumentUri(), e.version());
            case DocumentBriefRenderedEvent e -> new ClaimAggregateState(
                    state.claimId(), state.policyNumber(), state.claimedAmount(), state.status(), state.riskScore(), state.triggeredExclusions(), state.adjusterDecision(), e.storageUri(), e.version());
        };
    }
}
