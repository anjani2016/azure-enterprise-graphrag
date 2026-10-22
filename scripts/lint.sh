#!/usr/bin/env bash
set -e

echo "=== [1/4] Linting TypeScript (Node.js Gateway) ==="
./services/node-api-gateway/node_modules/.bin/tsc --noEmit --project ./services/node-api-gateway/tsconfig.json
echo "✔ TypeScript typecheck passed."

echo "=== [2/4] Linting Java (Spring Boot Knowledge Graph Engine) ==="
mvn test-compile -q -f services/jvm-graph-service/pom.xml
echo "✔ Java compilation & syntax check passed."

echo "=== [3/4] Linting Python (LLMOps & Evaluation Suite) ==="
PYTHON_EXEC="/usr/bin/python3"
if [ ! -f "$PYTHON_EXEC" ]; then PYTHON_EXEC="python3"; fi
$PYTHON_EXEC -m py_compile services/llmops-eval/*.py
echo "✔ Python syntax validation passed."

echo "=== [4/4] Validating Azure Infrastructure as Code (Bicep) ==="
if az bicep version >/dev/null 2>&1; then
  az bicep build --file infra/bicep/serverless.bicep > /dev/null
  az bicep build --file infra/bicep/main.bicep > /dev/null
  echo "✔ Azure Bicep template syntax valid."
else
  echo "ℹ Azure CLI session offline or sandboxed, Bicep lint skipped."
fi

echo ""
echo "🎉 ALL LOCAL LINT CHECKS PASSED SUCCESSFULLY!"
