
import Irys from "@irys/sdk";
import dotenv from "dotenv";

// Load env vars
dotenv.config({ path: ".env.local" });

async function main() {
    const url = process.env.NEXT_PUBLIC_IRYS_NODE_URL || "https://node1.irys.xyz";
    const token = process.env.NEXT_PUBLIC_IRYS_TOKEN || "matic";
    const key = process.env.IRYS_PRIVATE_KEY;

    if (!key) {
        console.error("No private key found!");
        return;
    }

    try {
        console.log(`Connecting to ${url} with ${token}...`);
        const irys = new Irys({
            url,
            token,
            key,
        }); // @ts-ignore

        await irys.ready();

        console.log("✅ Irys Initialized!");
        console.log("Address:", irys.address);

        const balance = await irys.getLoadedBalance();
        console.log("Balance (atomic):", balance.toString());

        // Check price
        const price = await irys.getPrice(1024 * 1024); // 1MB
        console.log("Price for 1MB:", price.toString());

        if (balance.lt(price)) {
            console.log("\n⚠️  Insufficient balance for 1MB upload.");
            console.log("Please fund your wallet (0x" + irys.address + ") with MATIC on Mumbai/Polygon.");
        } else {
            console.log("\n✅ Sufficient balance for testing!");
            // DO NOT automatically upload, just confirm it's ready
        }

    } catch (error) {
        console.error("Error:", error);
    }
}

main();
