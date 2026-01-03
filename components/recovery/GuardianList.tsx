/**
 * GuardianList - Display and manage guardians
 */

"use client";

import { useState } from "react";
import type { Guardian } from "@/lib/recovery";
import {
    UserGroupIcon,
    TrashIcon,
    ShieldCheckIcon,
    ClockIcon,
    BuildingLibraryIcon,
} from "@heroicons/react/24/outline";

interface GuardianListProps {
    guardians: Guardian[];
    onRemove?: (guardianId: string) => Promise<void>;
    readonly?: boolean;
}

const GUARDIAN_TYPE_INFO = {
    trusted_contact: {
        icon: UserGroupIcon,
        label: "Trusted Contact",
        color: "text-blue-400",
    },
    time_lock: {
        icon: ClockIcon,
        label: "Time-Lock",
        color: "text-amber-400",
    },
    institutional: {
        icon: BuildingLibraryIcon,
        label: "Institutional",
        color: "text-purple-400",
    },
};

export function GuardianList({
    guardians,
    onRemove,
    readonly = false,
}: GuardianListProps) {
    const [removingId, setRemovingId] = useState<string | null>(null);

    const handleRemove = async (guardianId: string) => {
        if (!onRemove) return;

        const confirmed = confirm(
            "Are you sure you want to remove this guardian? They will no longer be able to help recover your account."
        );

        if (!confirmed) return;

        setRemovingId(guardianId);
        try {
            await onRemove(guardianId);
        } finally {
            setRemovingId(null);
        }
    };

    if (guardians.length === 0) {
        return (
            <div className="rounded-lg border border-dark-700 bg-dark-800/50 p-6 text-center">
                <ShieldCheckIcon className="mx-auto mb-3 h-12 w-12 text-dark-500" />
                <p className="text-sm text-dark-400">No guardians added yet</p>
                <p className="mt-1 text-xs text-dark-500">
                    Add trusted contacts to enable account recovery
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {guardians.map((guardian) => {
                const typeInfo = GUARDIAN_TYPE_INFO[guardian.type];
                const Icon = typeInfo.icon;
                const isRemoving = removingId === guardian.id;

                return (
                    <div
                        key={guardian.id}
                        className="flex items-center justify-between rounded-lg border border-dark-700 bg-dark-800/50 p-4"
                    >
                        <div className="flex items-center gap-3">
                            <div className={`rounded-lg bg-dark-700 p-2 ${typeInfo.color}`}>
                                <Icon className="h-5 w-5" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-dark-100">
                                        {guardian.name || "Guardian"}
                                    </span>
                                    <span
                                        className={`text-xs ${typeInfo.color} rounded-full bg-dark-700 px-2 py-0.5`}
                                    >
                                        {typeInfo.label}
                                    </span>
                                    {guardian.weight > 1 && (
                                        <span className="rounded-full bg-brand-500/20 px-2 py-0.5 text-xs text-brand-400">
                                            Weight: {guardian.weight}
                                        </span>
                                    )}
                                </div>
                                <p className="mt-0.5 font-mono text-xs text-dark-400">
                                    {guardian.address.slice(0, 8)}...{guardian.address.slice(-6)}
                                </p>
                                {guardian.email && (
                                    <p className="text-xs text-dark-500">{guardian.email}</p>
                                )}
                            </div>
                        </div>

                        {!readonly && onRemove && (
                            <button
                                onClick={() => handleRemove(guardian.id)}
                                disabled={isRemoving}
                                className="rounded-lg p-2 text-dark-400 transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
                                title="Remove guardian"
                            >
                                {isRemoving ? (
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-400 border-t-transparent" />
                                ) : (
                                    <TrashIcon className="h-4 w-4" />
                                )}
                            </button>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
