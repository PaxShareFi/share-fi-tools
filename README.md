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
node getTokenHolders.js --price=<SHARE_price_in_USD> --airdrop=<airdrop_amount>
```

Example (using current SHARE price as of February 2024):

```bash
node getTokenHolders.js --price=0.0001017 --airdrop=0.7
```

### Parameters

- `--price`: Current SHARE token price in USD (e.g., 0.0001017 = $0.0001017)
- `--airdrop`: Total amount of tokens to be distributed in the airdrop (e.g., 0.7 = 0.7 tokens)

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

### Understanding the Math

#### Step 1: Token Value Calculations

1. **SHARE Token Price**: $0.0001017 USD per SHARE
2. **Minimum Holding**: $5.00 USD worth of SHARE tokens
3. **Conversion to Minimum Tokens**:
   - $5.00 ÷ $0.0001017 = 49,165.19 SHARE tokens needed

#### Step 2: Lamport Conversion

1. **Lamports per SHARE**: 1,000,000,000 (1 billion)
2. **Minimum Lamports**:
   - 49,165.19 SHARE × 1,000,000,000 = 49,165,190,000,000 lamports
3. **Why Lamports?**
   - Lamports are the smallest unit of the token
   - Similar to how cents are to dollars
   - Helps avoid floating-point precision issues

#### Step 3: Holder Percentage Calculation

For each holder:

1. **Calculate Percentage**:
   ```
   Holder's Percentage = (Holder's Lamports ÷ Total Supply) × 100
   ```
2. **Example**:
   - If holder has 54,428,467,048,618,660 lamports
   - Total supply is 763,783,037,768,251,355 lamports
   - Percentage = (54,428,467,048,618,660 ÷ 763,783,037,768,251,355) × 100
   - = 7.126168605113%

#### Step 4: Airdrop Distribution

1. **Calculate Individual Airdrop**:
   ```
   Holder's Airdrop = Total Airdrop × (Holder's Percentage ÷ 100)
   ```
2. **Example**:
   - If total airdrop is 0.7 tokens
   - Holder's percentage is 7.126168605113%
   - Airdrop amount = 0.7 × (7.126168605113 ÷ 100)
   - = 0.064135517 tokens

#### Verification

- Each holder must have at least $5 USD worth of SHARE
- Percentages of all holders should sum to 100%
- Total airdrop amounts should sum to the input airdrop amount
- Excluded wallets (like liquidity pools) are removed before calculations

## License

[Add your chosen license here]
