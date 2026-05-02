# Web3 Indexer

A modular hexagonal backend for indexing on-chain events into PostgreSQL and exposing the indexed data through an HTTP API.

## Overview

Blockchains are not designed for fast queries, filtering, or building dashboards.

This project solves that gap by transforming on-chain events into structured, queryable, and consistent data stored in PostgreSQL.

The system is intentionally split into two different processes inside the same repository:

1. Worker / Indexer
   RPC -> decode -> persist -> update checkpoint
2. HTTP API
   PostgreSQL -> filter/paginate -> respond to frontend or clients

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

## Current Process Model

This repository contains **one system with two entrypoints**.

### HTTP process

- Entry point: `src/entrypoints/http.ts`
- Responsibility: start the HTTP server only

Flow:

`entrypoints/http.ts` -> `bootstrap/http/create-http-app.ts` -> HTTP server/router/controllers -> application use cases

### Worker process

- Entry point: `src/entrypoints/sync.worker.ts`
- Responsibility: start the indexing process only

Flow:

`entrypoints/sync.worker.ts` -> `bootstrap/worker/create-sync-worker.ts` -> `interfaces/workers/sync-runner.ts` -> indexing use case

### Why the worker is split

The worker has two files with different responsibilities:

- `src/entrypoints/sync.worker.ts`
  This is the file executed by npm or a process manager.

- `src/interfaces/workers/sync-runner.ts`
  This is the worker runtime adapter. It contains the loop, polling, signal handling, and shutdown behavior.

The difference is:

- the **entrypoint** says "start the process"
- the **runner** says "how the process behaves after startup"

---

## Current Composition Roots

Concrete dependencies are wired in `bootstrap/`.

- `src/bootstrap/http/create-http-app.ts`
  Creates repositories, use cases, controllers, routers, and the HTTP server.

- `src/bootstrap/worker/create-sync-worker.ts`
  Creates blockchain adapters, repositories, services, and the sync use case for the worker process.

This keeps:

- `application/` focused on use cases and DTOs
- `interfaces/` focused on adapters
- `entrypoints/` focused on process startup only

---

## Design Principles

- **Simple domain layer** -> minimal entities, no framework dependencies
- **Clear ports (interfaces)** -> define contracts for external systems
- **Concrete use cases** -> explicit application logic (no hidden magic)
- **Repositories per aggregate** -> persistence logic grouped by domain concept
- **Infrastructure adapters** -> Drizzle (DB) and Ethers (blockchain)
- **Separation of concerns** -> indexing logic is isolated and testable
- **Two processes, one repo** -> the worker and the API are part of the same system
- **Thin entrypoints** -> entrypoint files should only start a process
- **Explicit composition** -> dependency wiring belongs in `bootstrap/`s

---

## Project Structure

```txt
src/
├─ domain/                # Pure business definitions (no external deps)
│  ├─ entities/           # Core entities (RawLog, Transfer, Checkpoint)
│  └─ ports/              # Interfaces (BlockchainClient, Repositories)
│
├─ application/           # Use cases and core logic
│  ├─ dtos/               # Input/output shapes for use cases
│  ├─ use-cases/          # Sync, Reorg handling, Status
│  └─ services/           # Helpers (decoding, block planning)
│
├─ bootstrap/             # Use cases and core logic
│  ├─ http/               # HTTP composition root
│  └─ worker/             # Worker composition root
│
├─ bootstrap/             # Use cases and core logic
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
│  └─ workers/            # Worker runtime adapter
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

## Current Layer Responsibilities

### `domain/`

Pure business definitions.

- entities
- ports

It must not depend on:

- `application`
- `infraestructure`
- `interfaces`

### `application/`

Application logic and orchestration.

- use cases
- DTOs
- application services

It depends on domain contracts, not on concrete frameworks.

### `infraestructure/`

Concrete external implementations.

- blockchain adapters with `ethers`
- database access with Drizzle/PostgreSQL
- environment/config loading

### `interfaces/http/`

HTTP adapter layer.

- server creation
- route registration
- controllers

This layer translates HTTP requests into application inputs.

### `interfaces/workers/`

Background process adapter layer.

- worker runtime
- loop/polling
- process signal handling

This layer translates the worker process lifecycle into application execution.

### `bootstrap/`

Composition root layer.

This is where concrete implementations are assembled together.

### `entrypoints/`

Process startup layer.

This layer only starts processes and delegates wiring to `bootstrap/`.

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