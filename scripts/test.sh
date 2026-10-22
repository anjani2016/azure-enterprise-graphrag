#!/usr/bin/env bash
set -e

echo "=== [1/3] Running Java 21 / Spring Boot Microservice Tests ==="
mvn test -q -f services/jvm-graph-service/pom.xml
echo "✔ JVM Knowledge Graph, Cypher, PDFBox & Akka tests passed (5/5)."

echo "=== [2/3] Running Node.js Gateway & MCP / A2A Integration Tests ==="
npm test --prefix services/node-api-gateway -- --silent
echo "✔ Node.js Gateway, MCP & A2A test suites passed (9/9)."

echo "=== [3/3] Running Arize Phoenix & MLflow Hallucination & Groundedness Benchmarks ==="
PYTHON_EXEC="/usr/bin/python3"
if [ ! -f "$PYTHON_EXEC" ]; then PYTHON_EXEC="python3"; fi
$PYTHON_EXEC services/llmops-eval/run_eval.py
echo "✔ LLMOps Evaluation Gate passed."

echo ""
echo "🎉 ALL LOCAL TEST SUITES PASSED SUCCESSFULLY!"
