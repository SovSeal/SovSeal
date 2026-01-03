/**
 * Paymaster Module Barrel Export
 *
 * Re-exports all paymaster-related types and services.
 * Updated for Pimlico + ZeroDev account abstraction.
 */

export * from "./types";
export { PaymasterService } from "./PaymasterService";
export { ZeroDevService } from "./ZeroDevService";

// Note: PaymasterService is kept for backward compatibility (client-side utilities)
// ZeroDevService handles actual smart account creation with Pimlico sponsorship
