const hre = require("hardhat");

/**
 * SovSealRecovery Contract Deployment Script
 * 
 * Deploys the social recovery contract for guardian-based key recovery.
 * 
 * Usage:
 *   Passet Hub:     npx hardhat run scripts/deployRecovery.js --network passetHub
 *   Base Sepolia:   npx hardhat run scripts/deployRecovery.js --network baseSepolia
 *   Local:          npx hardhat run scripts/deployRecovery.js --network localhost
 */

// Network metadata
const NETWORK_INFO = {
    base: {
        displayName: "Base Mainnet",
        explorer: "https://basescan.org",
        isMainnet: true,
    },
    baseSepolia: {
        displayName: "Base Sepolia",
        explorer: "https://sepolia.basescan.org",
        isMainnet: false,
    },
    assetHub: {
        displayName: "Polkadot Asset Hub",
        explorer: "https://assethub-polkadot.subscan.io",
        isMainnet: true,
    },
    passetHub: {
        displayName: "Passet Hub Testnet",
        explorer: "https://blockscout-passet-hub.parity-testnet.parity.io",
        isMainnet: false,
    },
    localhost: {
        displayName: "Local Hardhat",
        explorer: null,
        isMainnet: false,
    },
    hardhat: {
        displayName: "Hardhat Network",
        explorer: null,
        isMainnet: false,
    },
};

async function main() {
    const networkName = hre.network.name;
    const networkInfo = NETWORK_INFO[networkName] || {
        displayName: networkName,
        explorer: null,
        isMainnet: false,
    };

    console.log("\n╔════════════════════════════════════════════════════════════╗");
    console.log("║        SovSealRecovery Contract Deployment                 ║");
    console.log("╚════════════════════════════════════════════════════════════╝\n");

    console.log(`Network:    ${networkInfo.displayName}`);
    console.log(`Type:       ${networkInfo.isMainnet ? "🔴 MAINNET" : "🟡 TESTNET"}\n`);

    if (networkInfo.isMainnet) {
        console.log("⚠️  WARNING: You are deploying to a MAINNET");
        console.log("   This is a production deployment with real value.\n");
    }

    const [deployer] = await hre.ethers.getSigners();
    console.log("Deployer:", deployer.address);

    const balance = await hre.ethers.provider.getBalance(deployer.address);
    const balanceInEth = hre.ethers.formatEther(balance);
    console.log("Balance:", balanceInEth, "tokens\n");

    if (balance === 0n) {
        throw new Error("Deployer account has no balance. Please fund the account first.");
    }

    console.log("Deploying SovSealRecovery contract...");

    const SovSealRecovery = await hre.ethers.getContractFactory("SovSealRecovery");
    const recovery = await SovSealRecovery.deploy();

    console.log("Waiting for deployment confirmation...");
    await recovery.waitForDeployment();

    const address = await recovery.getAddress();
    console.log("\n✅ SovSealRecovery deployed to:", address);

    // Verify deployment
    const recoveryDelay = await recovery.RECOVERY_DELAY();
    const minThreshold = await recovery.MIN_THRESHOLD();
    const maxGuardians = await recovery.MAX_GUARDIANS();

    console.log("\nContract Parameters:");
    console.log(`  Recovery Delay:  ${Number(recoveryDelay) / 86400} days`);
    console.log(`  Min Threshold:   ${minThreshold}`);
    console.log(`  Max Guardians:   ${maxGuardians}`);

    console.log("\n" + "═".repeat(60));
    console.log("DEPLOYMENT COMPLETE");
    console.log("═".repeat(60));

    console.log(`\nNetwork:      ${networkInfo.displayName}`);
    console.log(`Contract:     ${address}`);
    console.log(`Deployer:     ${deployer.address}`);

    if (networkInfo.explorer) {
        console.log(`\nExplorer:     ${networkInfo.explorer}/address/${address}`);
    }

    console.log("\n📋 Update your environment:");
    console.log(`   NEXT_PUBLIC_RECOVERY_CONTRACT_ADDRESS=${address}`);

    return { address, network: networkName };
}

main()
    .then(({ address, network }) => {
        console.log(`\n🎉 Successfully deployed SovSealRecovery to ${network}: ${address}\n`);
        process.exit(0);
    })
    .catch((error) => {
        console.error("\n❌ Deployment failed:", error.message);
        process.exit(1);
    });
