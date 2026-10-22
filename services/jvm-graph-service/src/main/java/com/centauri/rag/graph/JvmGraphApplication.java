package com.centauri.rag.graph;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Main entry point for the JVM Knowledge Graph &amp; GraphRAG Service.
 * Provides high-throughput entity-relationship modeling and multi-hop graph retrieval
 * for enterprise EPC document intelligence within the Azure microservice architecture.
 */
@SpringBootApplication
public class JvmGraphApplication {

    public static void main(String[] args) {
        SpringApplication.run(JvmGraphApplication.class, args);
    }
}
