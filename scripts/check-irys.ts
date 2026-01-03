
import { irysService } from "../lib/storage";
import dotenv from "dotenv";

// Load env vars
dotenv.config({ path: ".env.local" });

async function main() {
    try {
        console.log("Initializing Irys...");
        // Force use of private key from env if not automatically picked up
        await irysService.initialize(process.env.IRYS_PRIVATE_KEY);

        const address = irysService.getAddress();
        console.log("Connected Address:", address);

        const balance = await irysService.getBalance();
        console.log("Current Balance (atomic units):", balance);

        // Check price for 1MB
        const price = await irysService.getPrice(1024 * 1024);
        console.log("Price for 1MB:", price);

    } catch (error) {
        console.error("Error:", error);
    }
}

main();
