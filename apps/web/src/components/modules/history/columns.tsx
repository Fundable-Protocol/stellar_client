"use client";

import { ColumnDef } from "@tanstack/react-table";
import { HistoryRecord } from "@/services/types";
import ActionsCell from "./ActionsCell";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export const columns: ColumnDef<HistoryRecord>[] = [
    {
        accessorKey: "date",
        header: "Date",
        cell: ({ row }) => {
            const date = row.original.date;
            return (
                <div className="text-zinc-300">
                    {format(new Date(date), "MMM dd, yyyy HH:mm")}
                </div>
            );
        },
    },
    {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => {
            const type = row.original.type;
            return (
                <Badge variant="outline" className="capitalize border-zinc-700 bg-zinc-900 text-zinc-300">
                    {type}
                </Badge>
            );
        },
    },
    {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => {
            const amount = row.original.amount;
            const token = row.original.token;
            return (
                <div className="font-medium text-white">
                    {amount.toString()} {token.substring(0, 4)}...
                </div>
            );
        },
    },
    {
        accessorKey: "recipients",
        header: "Recipients",
        cell: ({ row }) => (
            <div className="text-center w-fit px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-xs">
                {row.original.recipients}
            </div>
        ),
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.original.status.toLowerCase();
            let color = "bg-zinc-500";
            if (status === "completed" || status === "active" || status === "success") color = "bg-emerald-500";
            if (status === "paused" || status === "pending") color = "bg-amber-500";
            if (status === "canceled" || status === "failed") color = "bg-rose-500";

            return (
                <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${color}`} />
                    <span className="capitalize text-zinc-300">{status}</span>
                </div>
            );
        },
    },
    {
        id: "actions",
        header: "",
        cell: ({ row }) => {
            if (row.original.type === 'Distribution') {
                const dist = {
                    id: row.original.id,
                    total_amount: row.original.amount.toString(),
                    token_symbol: 'Unknown',
                    distribution_type: 'equal' as const,
                    status: 'completed' as const,
                    created_at: row.original.date,
                    total_recipients: row.original.recipients,
                    transaction_hash: row.original.transactionHash,
                    network: 'testnet' as const,
                    user_address: '',
                    token_address: row.original.token,
                    token_decimals: 7,
                    fee_amount: '0',
                };
                return <ActionsCell distribution={dist} />;
            }
            return null;
        },
    },
];
