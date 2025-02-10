require("dotenv").config();

// This was the API key helius gives out for free
// Please create and .env file and add the API key to it
const HELIUS_API_KEY = process.env.HELIUS_API_KEY || "0fc6e451-923e-434f-8787-7691d3dc4120";
const url = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;
const fs = require("fs");

console.log(`Using API Key: ${HELIUS_API_KEY === "0fc6e451-923e-434f-8787-7691d3dc4120" ? "Default" : "Custom"}`);

// Constants and configuration
const LAMPORTS_PER_SHARE = 1000000000; // 10^9 lamports per SHARE token
const SHTokenAddress = "8r9q4eyMpXS5Dq29urXai52BNfKZbCB4wciD1jLwY68y";
const EXCLUDED_WALLETS = ["BW7XM7PDT9BS5gcxZNNz2UJYmufYeYTFwfMog9nhDhe1"]; // Liquidity pool

// Get arguments from command line
const args = process.argv.slice(2);
const priceArg = args.find((arg) => arg.startsWith("--price="));
const airdropArg = args.find((arg) => arg.startsWith("--airdrop="));

if (!priceArg) {
  console.error("Error: --price argument is required");
  console.error("Usage: node getTokenHolders.js --price=0.00007966 --airdrop=0.7");
  process.exit(1);
}

if (!airdropArg) {
  console.error("Error: --airdrop argument is required");
  console.error("Usage: node getTokenHolders.js --price=0.00007966 --airdrop=0.7");
  process.exit(1);
}

const currentSHARETokenUSDValue = parseFloat(priceArg.split("=")[1]);
const airdropCoinSupply = parseFloat(airdropArg.split("=")[1]);
const SHTokenValueMinimumUSD = 5.0;

// Calculate lamports directly for $5 worth
const lamportsPerUSD = LAMPORTS_PER_SHARE / currentSHARETokenUSDValue;
const minimumLamports = Math.ceil(lamportsPerUSD * SHTokenValueMinimumUSD);
const verificationUSD = (minimumLamports / LAMPORTS_PER_SHARE) * currentSHARETokenUSDValue;

console.log("\n=== Configuration ===");
console.log(`SHARE Token Address: ${SHTokenAddress}`);
console.log(`Helius API Endpoint: ${url}`);

console.log("\n=== Input Parameters ===");
console.log(`SHARE Token Price: $${currentSHARETokenUSDValue}`);
console.log(`Airdrop Amount: ${airdropCoinSupply} SOL`);
console.log(`Minimum USD Value: $${SHTokenValueMinimumUSD}`);

console.log("\n=== Threshold Calculations ===");
console.log(`1 SHARE = ${LAMPORTS_PER_SHARE} lamports`);
console.log(`$${SHTokenValueMinimumUSD} worth of SHARE = ${minimumLamports.toLocaleString()} lamports`);
console.log(`Verification: ${minimumLamports} lamports = $${verificationUSD.toFixed(8)}`);

console.log("\n=== Converting USD to lamports ===");
console.log(`$${SHTokenValueMinimumUSD} × ${lamportsPerUSD.toFixed(0)} lamports/USD = ${minimumLamports} lamports`);

console.log("\n=== Final Results ===");
console.log(`$${SHTokenValueMinimumUSD} USD equals ${minimumLamports} lamports`);
console.log("===============================\n");

// Helper function to format timestamps consistently
const formatTimestamp = (date = new Date(), format = "file") => {
  if (format === "file") {
    return date.toISOString().replace(/[:.]/g, "-").replace("T", "_").replace("Z", "");
  }
  return date.toLocaleString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short",
  });
};

// Helper function to save API responses
const saveApiResponse = (methodName, data, page = null) => {
  // Create api-response directory if it doesn't exist
  if (!fs.existsSync("snapshots/api-responses")) {
    fs.mkdirSync("snapshots/api-responses", { recursive: true });
  }

  // Generate timestamp
  const fileTimestamp = formatTimestamp();

  // Build filename with optional page number
  const filename =
    page !== null
      ? `snapshots/api-responses/${methodName}_response_${fileTimestamp}_page_${page}.json`
      : `snapshots/api-responses/${methodName}_response_${fileTimestamp}.json`;

  fs.writeFileSync(filename, JSON.stringify(data, null, 2));
};

// Function to get current SHARE price
async function getCurrentSharePrice() {
  // TODO: Implement API call to Jupiter service get current SHARE price
  // Simply return the command line price for now.
  return currentSHARETokenUSDValue;
}

// Function to get total supply
async function getTotalSupply() {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getTokenSupply",
        params: [SHTokenAddress],
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    // THIS IS EXACTLY WHAT the api returns
    /*
    {
  jsonrpc: '2.0',
  result: {
    context: { apiVersion: '2.2.0', slot: 319598316 },
    value: {
      amount: '763783037768251355',
      decimals: 9,
      uiAmount: 763783037.7682514,
      uiAmountString: '763783037.768251355'
    }
  },
  id: 1
} 
  */
    // i have created a snapshots/api-response folder
    // put this response in there
    const data = await response.json();

    console.log("Result for $SHARE getTokenSupply:", data.result.value);
    if (data.error) {
      throw new Error(`API error: ${data.error.message}`);
    }

    // Save raw API response
    saveApiResponse("getTokenSupply", data);

    return BigInt(data.result.value.amount);
  } catch (error) {
    console.error("Failed to fetch total supply:", error);
    process.exit(1);
  }
}

const findHolders = async () => {
  console.log("\n=== Fetching Token Supply ===");
  const totalSupplyOfSHToken = await getTotalSupply();
  console.log(`Total Supply: ${totalSupplyOfSHToken.toLocaleString()} lamports`);
  console.log(`          ≈ ${(Number(totalSupplyOfSHToken) / LAMPORTS_PER_SHARE).toFixed(9)} SHARE`);

  console.log("\n=== Fetching Token Holders ===");
  const currentSHARETokenUSDValue = await getCurrentSharePrice();
  const minimumLamports = Math.ceil(lamportsPerUSD * SHTokenValueMinimumUSD);

  // Log the threshold with human-readable timestamp
  const timestamp = formatTimestamp(new Date(), "human");
  console.log(`[${timestamp}] Using SHARE price: $${currentSHARETokenUSDValue}`);
  console.log(`[${timestamp}] Minimum SH tokens needed for airdrop (>$5): ${minimumLamports / 100000000} SH (${minimumLamports} raw units)`);
  console.log(
    `[${timestamp}] Total SHARE supply: ${totalSupplyOfSHToken.toString()} raw units (${(Number(totalSupplyOfSHToken) / 100000000).toFixed(8)} SH)`
  );

  let page = 1;
  let holdersWithBalance = new Map();

  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000; // 1 second
  let hasMoreResults = true;

  while (hasMoreResults) {
    let retries = 0;
    let success = false;

    while (!success && retries < MAX_RETRIES) {
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            method: "getTokenAccounts",
            id: "helius-test",
            params: {
              page: page,
              limit: 1000,
              displayOptions: {},
              mint: SHTokenAddress,
            },
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Save raw API response
        saveApiResponse("getTokenAccounts", data, page);

        if (data.error) {
          throw new Error(`API error: ${data.error.message}`);
        }

        // Process the data
        if (!data.result || data.result.token_accounts.length === 0) {
          console.log(`No more results. Total pages processed: ${page - 1}`);
          hasMoreResults = false;
          break;
        }

        console.log(`Processing page ${page} (${data.result.token_accounts.length} accounts)`);
        data.result.token_accounts.forEach((account) => {
          const shareAmount = Number(account.amount) / LAMPORTS_PER_SHARE;

          const usdValue = shareAmount * currentSHARETokenUSDValue;

          if (Number(account.amount) >= minimumLamports && !EXCLUDED_WALLETS.includes(account.owner)) {
            holdersWithBalance.set(account.owner, account.amount);
          }
        });

        success = true;
        page++;
      } catch (error) {
        retries++;
        if (retries === MAX_RETRIES) {
          console.error(`Failed to fetch page ${page} after ${MAX_RETRIES} attempts:`, error);
          process.exit(1);
        }
        console.log(`Retry ${retries}/${MAX_RETRIES} for page ${page}`);
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      }
    }
  }

  // Convert filtered Map to array
  const holdersArray = Array.from(holdersWithBalance).map(([owner, amount]) => {
    const amountBigInt = BigInt(amount);
    // Calculate percentage of total supply using BigInt to maintain precision
    const percentageBigInt = (amountBigInt * BigInt("10000000000000000")) / totalSupplyOfSHToken;
    const percentage = (Number(percentageBigInt) / 100000000000000).toFixed(12);

    // Store the raw amount and only convert for display when needed
    return {
      owner,
      rawAmount: amount,
      percentage: `${percentage}%`,
    };
  });

  // Sort by percentage in descending order
  holdersArray.sort((a, b) => parseFloat(b.percentage) - parseFloat(a.percentage));

  console.log("\n=== Holder Statistics ===");
  console.log(`Total Eligible Holders (>$${SHTokenValueMinimumUSD}): ${holdersArray.length}`);
  console.log(`Largest Holder: ${(Number(holdersArray[0].rawAmount) / LAMPORTS_PER_SHARE).toFixed(9)} SHARE (${holdersArray[0].percentage})`);
  console.log(
    `Smallest Holder: ${(Number(holdersArray[holdersArray.length - 1].rawAmount) / LAMPORTS_PER_SHARE).toFixed(9)} SHARE (${
      holdersArray[holdersArray.length - 1].percentage
    })`
  );

  // Create snapshots directory if it doesn't exist
  if (!fs.existsSync("snapshots")) {
    fs.mkdirSync("snapshots");
  }

  // Generate timestamp for filenames
  const fileTimestamp = formatTimestamp();

  // When writing JSON output - only include share token data for validation
  const jsonOutput = holdersArray.map((holder) => ({
    owner: holder.owner,
    lamports: holder.rawAmount,
    percentage: holder.percentage,
  }));

  fs.writeFileSync(`snapshots/holders_${fileTimestamp}.json`, JSON.stringify(jsonOutput, null, 2));

  // For CSV, calculate airdrop amounts based on percentage
  const csvHeader = "Owner,AirdropAmount\n";
  const csvContent = holdersArray
    .map((holder) => {
      // Calculate airdrop amount based on percentage (removing the % symbol and converting to number)
      const percentageValue = parseFloat(holder.percentage.replace("%", "")) / 100;
      const airdropAmount = (airdropCoinSupply * percentageValue).toFixed(9);
      return `${holder.owner},${airdropAmount}`;
    })
    .join("\n");

  fs.writeFileSync(`snapshots/holders_${fileTimestamp}.csv`, csvHeader + csvContent);

  // Add total tokens being distributed to summary
  const totalAirdropTokens = holdersArray.reduce((sum, holder) => {
    const percentageValue = parseFloat(holder.percentage.replace("%", "")) / 100;
    return sum + airdropCoinSupply * percentageValue;
  }, 0);

  console.log("\n=== Airdrop Summary ===");
  console.log(`Total SOL to be distributed: ${totalAirdropTokens.toFixed(9)} SOL`);
  console.log(`Average per holder: ${(totalAirdropTokens / holdersArray.length).toFixed(9)} SOL`);

  console.log("\n=== Writing Output Files ===");
  console.log(`JSON file: snapshots/holders_${fileTimestamp}.json`);
  console.log(`CSV file: snapshots/holders_${fileTimestamp}.csv`);

  console.log("\n=== Process Complete ===");
  console.log(`Timestamp: ${new Date().toLocaleString()}`);
  console.log("===============================");
};

findHolders().catch(console.error);
