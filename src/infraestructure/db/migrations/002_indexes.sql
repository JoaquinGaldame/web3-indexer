BEGIN;
CREATE INDEX idx_raw_logs_contract_block
  ON raw_logs (chain_id, contract_address, block_number);

CREATE INDEX idx_raw_logs_block
  ON raw_logs (chain_id, block_number);

CREATE INDEX idx_erc20_transfers_contract_block
  ON erc20_transfers (chain_id, contract_address, block_number);

CREATE INDEX idx_erc20_transfers_from
  ON erc20_transfers (chain_id, from_address, block_number);

CREATE INDEX idx_erc20_transfers_to
  ON erc20_transfers (chain_id, to_address, block_number);

CREATE INDEX idx_erc20_transfers_tx
  ON erc20_transfers (transaction_hash);

COMMIT;