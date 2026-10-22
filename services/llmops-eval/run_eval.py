"""
CLI Evaluation Runner for Insurance GraphRAG with MLflow Tracking & CI Gate.
"""

import sys
import json
from config import config, init_telemetry
from evaluator import GraphRAGEvaluator, EvaluationResult

BENCHMARK_DATASET = [
    {
        "claim_id": "CLM-2026-8801",
        "peril": "ransomware",
        "retrieved_nodes": ["POL-CYBER-PROP-2026-99", "COV-BI", "COV-CYBER-EXT", "EXCL-UNPATCHED-CVE"],
        "ground_truth_exclusions": ["EXCL-UNPATCHED-CVE", "CLS-COND-WAIT-72H"],
        "response_text": (
            "Grounded Insurance Claims Adjudication completed. Identified potential coverage exclusion "
            "trigger under EXCL-UNPATCHED-CVE (Exclusion 4.2: Critical Known Vulnerability Unpatched > 30 Days). "
            "Condition CLS-COND-WAIT-72H mandates a 72-hour waiting period deductible for all Business Interruption (COV-BI). "
            "Recommendation: Issue formal Reservation of Rights pending cybersecurity patch timestamp verification."
        ),
        "graph_context": "=== INSURANCE KNOWLEDGE GRAPH ATTRIBUTED CONTEXT === EXCL-UNPATCHED-CVE CLS-COND-WAIT-72H"
    }
]

def run_evaluation_suite() -> list[EvaluationResult]:
    """Runs evaluation benchmarks across the claim dataset."""
    results = []
    for item in BENCHMARK_DATASET:
        res = GraphRAGEvaluator.evaluate_claim_adjudication(
            claim_id=item["claim_id"],
            claim_peril=item["peril"],
            response_text=item["response_text"],
            graph_context=item["graph_context"],
            retrieved_nodes=item["retrieved_nodes"],
            ground_truth_exclusions=item["ground_truth_exclusions"]
        )
        results.append(res)
    return results

def log_to_mlflow(results: list[EvaluationResult]):
    """Logs aggregate metrics and individual evaluation runs to MLflow."""
    try:
        import mlflow
        init_telemetry()
        with mlflow.start_run(run_name="ci-graphrag-eval"):
            avg_groundedness = sum(r.groundedness_score for r in results) / len(results)
            hallucination_rate = sum(1 for r in results if r.is_hallucinated) / len(results)
            avg_context_relevance = sum(r.context_relevance_score for r in results) / len(results)

            mlflow.log_metric("avg_groundedness", avg_groundedness)
            mlflow.log_metric("hallucination_rate", hallucination_rate)
            mlflow.log_metric("avg_context_relevance", avg_context_relevance)
            mlflow.log_param("total_benchmarks", len(results))

            print(f"[MLflow] Logged run successfully. Groundedness: {avg_groundedness:.2f}, Hallucination Rate: {hallucination_rate:.2f}")
    except Exception as e:
        print(f"[MLflow] Tracking notice: {e} (continuing offline)")

def main():
    print("=== Running Insurance GraphRAG LLMOps Evaluation Suite ===")
    results = run_evaluation_suite()
    log_to_mlflow(results)

    avg_groundedness = sum(r.groundedness_score for r in results) / len(results)
    hallucination_rate = sum(1 for r in results if r.is_hallucinated) / len(results)

    print(f"\nEvaluation Summary:")
    print(f" - Benchmarks Evaluated: {len(results)}")
    print(f" - Average Groundedness: {avg_groundedness:.2%}")
    print(f" - Hallucination Rate:  {hallucination_rate:.2%}")

    for r in results:
        print(f"   [{r.claim_id}] Verdict: {r.verdict} | Grounded: {r.groundedness_score} | Hallucinated: {r.is_hallucinated}")

    if avg_groundedness < config.groundedness_threshold or hallucination_rate > config.max_hallucination_rate:
        print("\n❌ CI Evaluation Gate Failed: Hallucination rate exceeds tolerance or Groundedness below threshold!")
        sys.exit(1)

    print("\n✅ CI Evaluation Gate Passed: All Insurance GraphRAG responses grounded and attributed.")
    sys.exit(0)

if __name__ == "__main__":
    main()
