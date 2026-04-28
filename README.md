# Web3 Indexer

A modular hexagonal backend where blockchain providers, database repositories, workers, and HTTP APIs are adapters around a core indexing engine.

## Overview

Blockchains are not designed for fast queries, filtering, or building dashboards.

This project solves that gap by transforming on-chain events into structured, queryable, and consistent data stored in PostgreSQL.

The system is designed to handle:

- Incremental synchronization via checkpoints
- Idempotent event ingestion (no duplicates)
- RPC failures and retries
- Basic reorg detection and rollback
- Queryable data for APIs and dashboards

---

## Architecture

This project follows a **lightweight Hexagonal Architecture (Ports & Adapters)**.

The goal is to keep the core indexing logic independent from:

- Blockchain providers (e.g. ethers.js, Alchemy, Infura)
- Database implementations (Drizzle / PostgreSQL)
- Delivery mechanisms (HTTP API, background workers)

---

## Design Principles

- **Simple domain layer** → minimal entities, no framework dependencies
- **Clear ports (interfaces)** → define contracts for external systems
- **Concrete use cases** → explicit application logic (no hidden magic)
- **Repositories per aggregate** → persistence logic grouped by domain concept
- **Infrastructure adapters** → Drizzle (DB) and Ethers (blockchain)
- **Separation of concerns** → indexing logic is isolated and testable

---

## Project Structure

```txt
src/
├─ domain/                # Pure business definitions (no external deps)
│  ├─ entities/           # Core entities (RawLog, Transfer, Checkpoint)
│  └─ ports/              # Interfaces (BlockchainClient, Repositories)
│
├─ application/           # Use cases and core logic
│  ├─ use-cases/          # Sync, Reorg handling, Status
│  └─ services/           # Helpers (decoding, block planning)
│
├─ infrastructure/        # External implementations
│  ├─ db/
│  │  ├─ schema.ts
│  │  └─ repositories/    # Drizzle adapters
│  ├─ blockchain/
│  │  └─ ethers-client.ts # Ethers adapter
│  └─ config/
│
├─ interfaces/            # Entry points
│  ├─ http/               # Express/Fastify API
│  └─ workers/            # Background indexer
│
└─ main.ts                # Composition root
```

---

## Core Concepts

Defines the core entities:
- RawLog
- IndexedBlock
- Checkpoint
- Erc20Transfer

No dependency on:
- ethers.js
- Drizzle
- Express


---

## Why This Architecture?

This approach allows:
- Replacing Ethers without touching business logic
- Switching database layer without rewriting use cases
- Running workers independently from the API
- Testing core logic without external dependencies

It prioritizes:
- clarity
- robustness
- evolvability

over premature abstraction or overengineering.

---

## Scope (Current)
- ERC20 event indexing
- Checkpoint-based sync
- Idempotent ingestion
- Basic reorg handling
- Queryable API

---

## Future Improvements
- Multi-contract indexing
- Multi-chain support
- Advanced reorg handling
- Historical backfill optimization
- Metrics and observability
- Streaming ingestion