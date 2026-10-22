"""
RAG Evaluation & Hallucination Detection Engine
Calculates Groundedness, Context Relevance, and Hallucination metrics for Insurance GraphRAG.
"""

from typing import List, Dict, Any

try:
    from pydantic import BaseModel, Field

    class EvaluationResult(BaseModel):
        claim_id: str
        groundedness_score: float = Field(ge=0.0, le=1.0)
        context_relevance_score: float = Field(ge=0.0, le=1.0)
        answer_relevance_score: float = Field(ge=0.0, le=1.0)
        is_hallucinated: bool
        cited_entities: List[str]
        missing_citations: List[str]
        verdict: str
except ImportError:
    from dataclasses import dataclass

    @dataclass
    class EvaluationResult:
        claim_id: str
        groundedness_score: float
        context_relevance_score: float
        answer_relevance_score: float
        is_hallucinated: bool
        cited_entities: List[str]
        missing_citations: List[str]
        verdict: str

class GraphRAGEvaluator:
    """Evaluates Insurance GraphRAG prompt responses against retrieved knowledge graph facts."""

    @staticmethod
    def evaluate_groundedness(response_text: str, graph_context: str, known_entities: List[str]) -> float:
        """Calculates factual overlap between LLM response and retrieved graph nodes."""
        if not known_entities:
            return 1.0
        cited_count = sum(1 for entity in known_entities if entity.lower() in response_text.lower())
        return round(cited_count / len(known_entities), 3)

    @staticmethod
    def detect_hallucinations(response_text: str, grounded_entities: List[str]) -> bool:
        """Flags potential hallucination if response makes claims unsupported by ground truth entities."""
        if not grounded_entities:
            return True
        matched = any(entity.lower() in response_text.lower() for entity in grounded_entities)
        return not matched

    @staticmethod
    def evaluate_context_relevance(retrieved_entities: List[str], claim_peril: str) -> float:
        """Measures whether the retrieved knowledge graph subnet is pertinent to the claim peril."""
        if not retrieved_entities:
            return 0.0
        peril_keywords = {
            "ransomware": ["cyber", "excl-unpatched", "cov-cyber", "cov-bi"],
            "windstorm": ["property", "wind", "structure"],
            "flood": ["water", "excl-flood", "property"]
        }
        keywords = peril_keywords.get(claim_peril.lower(), ["policy", "coverage"])
        relevant_count = sum(
            1 for entity in retrieved_entities
            if any(kw in entity.lower() for kw in keywords)
        )
        return round(min(1.0, relevant_count / max(1, len(keywords))), 3)

    @classmethod
    def evaluate_claim_adjudication(
        cls,
        claim_id: str,
        claim_peril: str,
        response_text: str,
        graph_context: str,
        retrieved_nodes: List[str],
        ground_truth_exclusions: List[str]
    ) -> EvaluationResult:
        """Produces a holistic LLM evaluation report for a single claim adjudication."""
        groundedness = cls.evaluate_groundedness(response_text, graph_context, ground_truth_exclusions)
        is_hallucinated = cls.detect_hallucinations(response_text, retrieved_nodes)
        context_relevance = cls.evaluate_context_relevance(retrieved_nodes, claim_peril)
        answer_relevance = 0.95 if "reservation of rights" in response_text.lower() or "waiting period" in response_text.lower() else 0.70

        missing = [e for e in ground_truth_exclusions if e.lower() not in response_text.lower()]
        verdict = "FAIL_HALLUCINATION" if is_hallucinated or groundedness < 0.7 else "PASS"

        return EvaluationResult(
            claim_id=claim_id,
            groundedness_score=groundedness,
            context_relevance_score=context_relevance,
            answer_relevance_score=answer_relevance,
            is_hallucinated=is_hallucinated,
            cited_entities=[e for e in ground_truth_exclusions if e.lower() in response_text.lower()],
            missing_citations=missing,
            verdict=verdict
        )
