"use client";

import {
    flexRender,
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
} from "@tanstack/react-table";

import {
    Table,
    TableCell,
    TableRow,
    TableBody,
    TableHead,
    TableHeader,
} from "@/components/ui/table";

import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

import { HistoryRecord } from "@/services/types";
import AppSelect from "@/components/molecules/AppSelect";
import { validPageLimits } from "@/lib/constants";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HistoryTableProps {
    data: HistoryRecord[];
    columns: any[];
    page: number;
    limit: number;
    totalCount: number;
    onPageChange: (page: number) => void;
    onLimitChange: (limit: number) => void;
    onExport: () => void;
}

const HistoryTable = ({
    data,
    columns,
    page,
    limit,
    totalCount,
    onPageChange,
    onLimitChange,
    onExport,
}: HistoryTableProps) => {
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        manualPagination: true,
        pageCount: Math.ceil(totalCount / limit),
    });

    const pageCount = Math.ceil(totalCount / limit);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex gap-4">
                    <AppSelect
                        options={validPageLimits.map((l) => ({
                            label: `${l} per page`,
                            value: l.toString(),
                        }))}
                        value={limit.toString()}
                        setValue={(v) => onLimitChange(parseInt(v))}
                        placeholder="Limit"
                    />
                </div>
                <Button
                    variant="outline"
                    className="border-zinc-800 bg-zinc-900 text-white hover:bg-zinc-800"
                    onClick={onExport}
                >
                    <Download className="mr-2 h-4 w-4" />
                    Export CSV
                </Button>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="border-zinc-800 hover:bg-transparent">
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id} className="text-zinc-400 font-medium">
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} className="border-zinc-800 hover:bg-zinc-800/30">
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center text-zinc-500">
                                    No transactions found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-between">
                <p className="text-sm text-zinc-500">
                    Showing {data.length} of {totalCount} transactions
                </p>
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (page > 1) onPageChange(page - 1);
                                }}
                                className={page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                        </PaginationItem>
                        {Array.from({ length: Math.min(5, pageCount) }).map((_, i) => (
                            <PaginationItem key={i}>
                                <PaginationLink
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        onPageChange(i + 1);
                                    }}
                                    isActive={page === i + 1}
                                >
                                    {i + 1}
                                </PaginationLink>
                            </PaginationItem>
                        ))}
                        <PaginationItem>
                            <PaginationNext
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (page < pageCount) onPageChange(page + 1);
                                }}
                                className={page >= pageCount ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>
        </div>
    );
};

export default HistoryTable;
