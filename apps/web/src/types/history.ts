import { Dispatch, SetStateAction } from "react";
import { ColumnDef } from "@tanstack/react-table";

export type DistributionStatus = "completed" | "failed" | "pending";
export type DistributionType = "equal" | "weighted";

export interface DistributionAttributes {
    id: string;
    user_address: string;
    token_address: string;
    token_symbol: string;
    token_decimals: number;
    total_amount: string;
    fee_amount: string;
    transaction_hash?: string | null;
    total_recipients: number;
    status: DistributionStatus;
    distribution_type: DistributionType;
    network: "mainnet" | "testnet";
    created_at: Date | string;
}

export interface IHistoryData {
    id: string;
    type: string; // "Stream" | "Distribution"
    date: string;
    amount: string;
    token: string;
    recipients: number;
    status: string;
    transaction_hash?: string;
}

export interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    onStatusFilterChange: Dispatch<
        SetStateAction<DistributionStatus | "all">
    >;
    onTypeFilterChange: Dispatch<
        SetStateAction<DistributionType | "all">
    >;
    statusFilter: DistributionStatus | "all";
    typeFilter: DistributionType | "all";
    totalCount?: number;
    page: number;
    limit: number;
}

export type distributionFilterType = "status" | "type";

export type distributionFilterValueType =
    | DistributionStatus
    | DistributionType
    | "all";
