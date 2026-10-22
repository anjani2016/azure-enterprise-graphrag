"""
Unit tests for Insurance GraphRAG Evaluator & Hallucination Detector.
"""

from evaluator import GraphRAGEvaluator

def test_groundedness_perfect_score():
    response = "Claim triggers EXCL-UNPATCHED-CVE and subject to CLS-COND-WAIT-72H."
    ground_truth = ["EXCL-UNPATCHED-CVE", "CLS-COND-WAIT-72H"]
    score = GraphRAGEvaluator.evaluate_groundedness(response, "", ground_truth)
    assert score == 1.0

def test_groundedness_partial_score():
    response = "Claim triggers EXCL-UNPATCHED-CVE but no waiting period mentioned."
    ground_truth = ["EXCL-UNPATCHED-CVE", "CLS-COND-WAIT-72H"]
    score = GraphRAGEvaluator.evaluate_groundedness(response, "", ground_truth)
    assert score == 0.5

def test_hallucination_detection_flagged():
    response = "The claim is denied due to completely fabricated reasons without entities."
    retrieved_nodes = ["POL-CYBER-PROP-2026-99", "EXCL-UNPATCHED-CVE"]
    assert GraphRAGEvaluator.detect_hallucinations(response, retrieved_nodes) is True

def test_hallucination_detection_clean():
    response = "Under policy POL-CYBER-PROP-2026-99, the loss is covered."
    retrieved_nodes = ["POL-CYBER-PROP-2026-99", "EXCL-UNPATCHED-CVE"]
    assert GraphRAGEvaluator.detect_hallucinations(response, retrieved_nodes) is False

def test_context_relevance():
    retrieved = ["POL-CYBER-PROP-2026-99", "EXCL-UNPATCHED-CVE", "COV-BI"]
    relevance = GraphRAGEvaluator.evaluate_context_relevance(retrieved, "ransomware")
    assert relevance >= 0.5
