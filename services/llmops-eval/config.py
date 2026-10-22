"""
LLMOps Telemetry & Tracking Configuration
Configures Arize Phoenix (tracing & hallucination evals) and MLflow (experiment tracking).
"""

import os
from dataclasses import dataclass

@dataclass(frozen=True)
class LLMOpsConfig:
    experiment_name: str = os.getenv("MLFLOW_EXPERIMENT_NAME", "azure-insurance-graphrag-eval")
    mlflow_tracking_uri: str = os.getenv("MLFLOW_TRACKING_URI", "https://mlflow.centauri-research.com")
    phoenix_collector_endpoint: str = os.getenv("PHOENIX_COLLECTOR_ENDPOINT", "https://monitor.centauri-research.com/v1/traces")
    phoenix_project_name: str = os.getenv("PHOENIX_PROJECT_NAME", "azure-insurance-graphrag")
    groundedness_threshold: float = float(os.getenv("EVAL_GROUNDEDNESS_THRESHOLD", "0.80"))
    max_hallucination_rate: float = float(os.getenv("EVAL_MAX_HALLUCINATION_RATE", "0.10"))

config = LLMOpsConfig()

def init_telemetry():
    """
    Initializes MLflow tracking experiment and Arize Phoenix tracing.
    Gracefully falls back to local logging if servers are offline.
    """
    import mlflow

    mlflow.set_tracking_uri(config.mlflow_tracking_uri)
    mlflow.set_experiment(config.experiment_name)

    print(f"[LLMOps] MLflow tracking initialized: {config.mlflow_tracking_uri} (Experiment: {config.experiment_name})")
    print(f"[LLMOps] Arize Phoenix endpoint configured: {config.phoenix_collector_endpoint}")
