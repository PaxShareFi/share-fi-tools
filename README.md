# share-fi-tools

A collection of tools for analyzing SHARE token holders and generating airdrop distributions.

## Token Holder Snapshot Tool

The main script (`getTokenHolders.js`) generates snapshots of SHARE token holders and calculates airdrop distributions based on holding percentages.

### Prerequisites

- Node.js installed
- A Helius API key (set as environment variable or in the script)

### Usage

Run the script with the following required parameters:
```bash
node getTokenHolders.js --price=<current_price> --airdrop=<airdrop_amount>
```

Example:
```bash
node getTokenHolders.js --price=0.00007966 --airdrop=0.7
```

### Parameters

- `--price`: Current SHARE token price in USD
- `--airdrop`: Total amount of SOL to be distributed in the airdrop

### Output Files

The script generates two snapshot files in the `snapshots/` directory with timestamps:

1. `holders_[timestamp].csv`
   - Simple CSV format for airdrop distribution
   - Contains two columns: `Owner` (wallet address) and `AirdropAmount` (SOL amount)
   - Suitable for direct use in airdrop distribution tools

2. `holders_[timestamp].json`
   - Detailed JSON format with additional data
   - Contains for each holder:
     - `owner`: Wallet address
     - `lamports`: Raw token amount in lamports
     - `percentage`: Holding percentage of total supply

### Eligibility Criteria

- Minimum holding requirement: $5 USD worth of SHARE tokens
- Excludes specific wallets (e.g., liquidity pools)
- Calculations based on current token price and total supply

### Configuration

Key constants in the script:
- `LAMPORTS_PER_SHARE`: 1,000,000,000 (10^9 lamports per SHARE token)
- `SHTokenAddress`: "8r9q4eyMpXS5Dq29urXai52BNfKZbCB4wciD1jLwY68y"
- `EXCLUDED_WALLETS`: Array of addresses to exclude from distribution

### Example Output

The script provides detailed console output including:
- Configuration details
- Threshold calculations
- Holder statistics
- Total and average airdrop amounts
- File generation confirmation

## License

[Add your chosen license here]
