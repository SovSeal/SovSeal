/**
 * AddGuardianForm - Form to add a new guardian
 */

"use client";

import { useState } from "react";
import type { GuardianInput, GuardianType } from "@/lib/recovery";
import {
    UserGroupIcon,
    ClockIcon,
    BuildingLibraryIcon,
    PlusIcon,
} from "@heroicons/react/24/outline";

interface AddGuardianFormProps {
    onAdd: (input: GuardianInput) => Promise<unknown>;
    disabled?: boolean;
}

const GUARDIAN_TYPES: {
    type: GuardianType;
    label: string;
    description: string;
    icon: typeof UserGroupIcon;
}[] = [
        {
            type: "trusted_contact",
            label: "Trusted Contact",
            description: "A friend or family member you trust",
            icon: UserGroupIcon,
        },
        {
            type: "time_lock",
            label: "Time-Lock",
            description: "Auto-release after inactivity period",
            icon: ClockIcon,
        },
        {
            type: "institutional",
            label: "Institutional",
            description: "Lawyer, notary, or institution (coming soon)",
            icon: BuildingLibraryIcon,
        },
    ];

export function AddGuardianForm({ onAdd, disabled }: AddGuardianFormProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        type: "trusted_contact" as GuardianType,
        address: "",
        name: "",
        email: "",
        weight: 1,
    });
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validate address
        if (!formData.address.startsWith("0x") || formData.address.length !== 42) {
            setError("Please enter a valid Ethereum address (0x...)");
            return;
        }

        setIsSubmitting(true);
        try {
            await onAdd({
                type: formData.type,
                address: formData.address,
                name: formData.name || undefined,
                email: formData.email || undefined,
                weight: formData.weight,
            });

            // Reset form
            setFormData({
                type: "trusted_contact",
                address: "",
                name: "",
                email: "",
                weight: 1,
            });
            setIsOpen(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to add guardian");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                disabled={disabled}
                className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-dark-600 p-4 text-dark-400 transition-colors hover:border-brand-500/50 hover:text-brand-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
                <PlusIcon className="h-5 w-5" />
                Add Guardian
            </button>
        );
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="rounded-lg border border-dark-600 bg-dark-800/80 p-4"
        >
            <h3 className="mb-4 font-medium text-dark-100">Add New Guardian</h3>

            {/* Guardian Type */}
            <div className="mb-4">
                <label className="mb-2 block text-sm text-dark-300">Guardian Type</label>
                <div className="grid gap-2 sm:grid-cols-3">
                    {GUARDIAN_TYPES.map(({ type, label, description, icon: Icon }) => (
                        <button
                            key={type}
                            type="button"
                            onClick={() => setFormData((f) => ({ ...f, type }))}
                            disabled={type === "institutional"}
                            className={`rounded-lg border p-3 text-left transition-colors ${formData.type === type
                                ? "border-brand-500 bg-brand-500/10"
                                : "border-dark-600 hover:border-dark-500"
                                } ${type === "institutional" ? "cursor-not-allowed opacity-50" : ""}`}
                        >
                            <Icon className="mb-1 h-5 w-5 text-brand-400" />
                            <p className="text-sm font-medium text-dark-100">{label}</p>
                            <p className="text-xs text-dark-400">{description}</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Address */}
            <div className="mb-4">
                <label className="mb-2 block text-sm text-dark-300">
                    Wallet Address <span className="text-red-400">*</span>
                </label>
                <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData((f) => ({ ...f, address: e.target.value }))}
                    placeholder="0x..."
                    className="w-full rounded-lg border border-dark-600 bg-dark-900 px-4 py-2 font-mono text-sm text-dark-100 placeholder:text-dark-500 focus:border-brand-500 focus:outline-none"
                    required
                />
            </div>

            {/* Name (optional) */}
            <div className="mb-4">
                <label className="mb-2 block text-sm text-dark-300">
                    Name <span className="text-dark-500">(optional)</span>
                </label>
                <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
                    placeholder="e.g., Mom, Lawyer Smith"
                    className="w-full rounded-lg border border-dark-600 bg-dark-900 px-4 py-2 text-sm text-dark-100 placeholder:text-dark-500 focus:border-brand-500 focus:outline-none"
                />
            </div>

            {/* Email (optional) */}
            <div className="mb-4">
                <label className="mb-2 block text-sm text-dark-300">
                    Email <span className="text-dark-500">(for notifications)</span>
                </label>
                <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData((f) => ({ ...f, email: e.target.value }))}
                    placeholder="guardian@example.com"
                    className="w-full rounded-lg border border-dark-600 bg-dark-900 px-4 py-2 text-sm text-dark-100 placeholder:text-dark-500 focus:border-brand-500 focus:outline-none"
                />
            </div>

            {/* Error */}
            {error && (
                <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
                    {error}
                </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3">
                <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="rounded-lg px-4 py-2 text-sm text-dark-300 hover:text-dark-100"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting || !formData.address}
                    className="btn-primary flex items-center gap-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {isSubmitting ? (
                        <>
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            Adding...
                        </>
                    ) : (
                        <>
                            <PlusIcon className="h-4 w-4" />
                            Add Guardian
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
