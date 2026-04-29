BEGIN;

CREATE TABLE indexer_checkpoints (
  chain_id INTEGER NOT NULL,
  contract_address TEXT NOT NULL,
  event_name TEXT NOT NULL,

  last_processed_block BIGINT NOT NULL,
  last_safe_block BIGINT NOT NULL,

  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT pk_indexer_checkpoints
    PRIMARY KEY (chain_id, contract_address, event_name),

  CONSTRAINT chk_indexer_checkpoints_blocks
    CHECK (
      last_processed_block >= 0
      AND last_safe_block >= 0
    )
);

CREATE TABLE indexed_blocks (
  chain_id INTEGER NOT NULL,
  block_number BIGINT NOT NULL,
  block_hash TEXT NOT NULL,
  parent_hash TEXT NOT NULL,

  indexed_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT pk_indexed_blocks
    PRIMARY KEY (chain_id, block_number)
);

CREATE TABLE raw_logs (
  chain_id INTEGER NOT NULL,
  block_number BIGINT NOT NULL,
  block_hash TEXT NOT NULL,
  transaction_hash TEXT NOT NULL,
  log_index INTEGER NOT NULL,
  contract_address TEXT NOT NULL,

  topics TEXT[] NOT NULL,
  data TEXT NOT NULL,
  removed BOOLEAN NOT NULL DEFAULT false,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT pk_raw_logs
    PRIMARY KEY (chain_id, transaction_hash, log_index)
);

CREATE TABLE erc20_transfers (
  chain_id INTEGER NOT NULL,
  contract_address TEXT NOT NULL,

  block_number BIGINT NOT NULL,
  block_hash TEXT NOT NULL,
  transaction_hash TEXT NOT NULL,
  log_index INTEGER NOT NULL,

  from_address TEXT NOT NULL,
  to_address TEXT NOT NULL,
  value NUMERIC(78, 0) NOT NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT pk_erc20_transfers
    PRIMARY KEY (chain_id, transaction_hash, log_index)
);


COMMIT;