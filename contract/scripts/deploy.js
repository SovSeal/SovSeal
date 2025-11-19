const hre = require("hardhat");

async function main() {
  console.log("Deploying Lockdrop contract...");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "tokens");

  const Lockdrop = await hre.ethers.getContractFactory("Lockdrop");
  const lockdrop = await Lockdrop.deploy();

  await lockdrop.waitForDeployment();

  const address = await lockdrop.getAddress();
  console.log("Lockdrop deployed to:", address);

  // Verify deployment
  const messageCount = await lockdrop.getMessageCount();
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
