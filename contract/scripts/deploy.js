const hre = require("hardhat");

async function main() {
  console.log("Deploying SovSeal contract...");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "tokens");

  const SovSeal = await hre.ethers.getContractFactory("Lockdrop");
  const sovseal = await SovSeal.deploy();

  await sovseal.waitForDeployment();

  const address = await sovseal.getAddress();
  console.log("SovSeal deployed to:", address);

  // Verify deployment
  const messageCount = await sovseal.getMessageCount();
  console.log("Initial message count:", messageCount.toString());

  console.log("\n✅ Deployment successful!");
  console.log("\nUpdate your .env.local with:");
  console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=${address}`);

  return address;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
