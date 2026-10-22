.PHONY: help lint test check build clean

help:
	@echo "Azure Enterprise GraphRAG Platform - Local Developer Commands"
	@echo "  make lint    - Run static analysis & typechecks (TypeScript, Java, Python, Bicep)"
	@echo "  make test    - Run all test suites (JVM 5/5, Gateway 9/9, LLMOps benchmarks)"
	@echo "  make check   - Run both lint and test in sequence"
	@echo "  make clean   - Clean build artifacts (target, dist, tmp)"

lint:
	@bash scripts/lint.sh

test:
	@bash scripts/test.sh

check: lint test

clean:
	@rm -rf services/jvm-graph-service/target
	@rm -rf services/node-api-gateway/dist
	@rm -f services/llmops-eval/*.pyc
