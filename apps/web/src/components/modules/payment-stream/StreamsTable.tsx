"use client";

import {
    flexRender,
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    ColumnDef,
    SortingState,
} from "@tanstack/react-table";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";

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
    PaginationNext,
    PaginationLink,
    PaginationContent,
    PaginationPrevious,
    PaginationEllipsis,
} from "@/components/ui/pagination";

import { streamColumns } from "./streamColumns";
import { StreamRecord } from "@/lib/validations";
import { validPageLimits } from "@/lib/constants";
import AppSelect from "@/components/molecules/AppSelect";

interface StreamsTableProps {
    data: StreamRecord[];
    page?: number;
    limit?: number;
    totalCount?: number;
    columns?: ColumnDef<StreamRecord>[];
}

function StreamsTable({
    data,
    page = 1,
    limit = 10,
    totalCount = 0,
    columns,
}: StreamsTableProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pageCount = Math.ceil(totalCount / limit);
    const [sorting, setSorting] = useState<SortingState>([]);

    const columnsUsed = columns ?? streamColumns;

    const table = useReactTable({
        data,
        columns: columnsUsed,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onSortingChange: setSorting,
        state: {
            pagination: {
                pageIndex: page - 1,
                pageSize: limit,
            },
            sorting,
        },
        manualPagination: true,
        pageCount,
    });

    const updatePage = (newPage: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", newPage.toString());
        router.push(`?${params.toString()}`);
    };

    const canPreviousPage = page > 1;
    const canNextPage = page < pageCount;

    const pageSize = validPageLimits.map((limit) => ({
        label: `${limit} per page`,
        value: limit.toString(),
    }));

    const handlePageSizeChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", "1");
        params.set("limit", value);
        router.push(`?${params.toString()}`);
    };

    return (
        <div className="h-full flex flex-col space-y-4 overflow-y-auto pb-4">
            <Table>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow
                            key={headerGroup.id}
                            className="bg-zinc-800 border-none"
                        >
                            {headerGroup.headers.map((header) => {
                                return (
                                    <TableHead
                                        key={header.id}
                                        className="text-white font-bold p-4"
                                    >
                                        {header.isPlaceholder ? null : (
                                            <div
                                                {...{
                                                    className: header.column.getCanSort()
                                                        ? "cursor-pointer select-none flex items-center justify-center gap-1 hover:text-zinc-300 transition-colors"
                                                        : "flex items-center justify-center",
                                                    onClick: header.column.getToggleSortingHandler(),
                                                }}
                                            >
                                                {flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                                {{
                                                    asc: <ChevronUp className="h-4 w-4" />,
                                                    desc: <ChevronDown className="h-4 w-4" />,
                                                }[header.column.getIsSorted() as string] ?? (
                                                        header.column.getCanSort() && (
                                                            <ChevronsUpDown className="h-4 w-4 opacity-50" />
                                                        )
                                                    )}
                                            </div>
                                        )}
                                    </TableHead>
                                );
                            })}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody className="[&_tr:last-child]:border-b [&_tr:last-child]:border-x [&_tr:last-child]:border-zinc-700/50">
                    {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                            <TableRow
                                key={row.id}
                                data-state={row.getIsSelected() && "selected"}
                                className="border-b border-x border-zinc-700/50"
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id} className="py-3 px-4">
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell
                                colSpan={columnsUsed.length}
                                className="h-24 text-center text-zinc-400"
                            >
                                No streams found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            {/* Pagination */}
            {totalCount > 0 && (
                <Pagination>
                    <PaginationContent className="hidden lg:flex items-center space-x-4">
                        <p className="text-sm font-medium text-zinc-300">Showing</p>
                        <AppSelect
                            options={pageSize}
                            placeholder={
                                limit
                                    ? pageSize.find((size) => size.value === String(limit))?.label
                                    : pageSize[0].label
                            }
                            setValue={handlePageSizeChange}
                        />
                    </PaginationContent>

                    <PaginationContent className="hidden lg:flex flex-col sm:flex-row sm:space-y-0 sm:space-x-6 lg:space-x-8">
                        <div className="flex w-[100px] items-center justify-center text-sm font-medium text-zinc-300">
                            Page {page} of {pageCount}
                        </div>
                    </PaginationContent>

                    <PaginationContent className="gap-2">
                        <PaginationPrevious
                            onClick={() => updatePage(page - 1)}
                            disabled={!canPreviousPage}
                        />
                        {Array.from(
                            { length: pageCount > 3 ? 3 : pageCount },
                            (_, index) => (
                                <PaginationLink
                                    key={`streams-pagination-${index}`}
                                    onClick={() => updatePage(index + 1)}
                                    isActive={page === index + 1}
                                >
                                    {index + 1}
                                </PaginationLink>
                            )
                        )}

                        {pageCount > 3 ? (
                            <PaginationContent className="flex items-center space-x-4">
                                <PaginationEllipsis />
                                <PaginationLink
                                    onClick={() => updatePage(pageCount)}
                                    isActive={page === pageCount}
                                >
                                    {pageCount}
                                </PaginationLink>
                            </PaginationContent>
                        ) : null}

                        <PaginationNext
                            onClick={() => updatePage(page + 1)}
                            disabled={!canNextPage}
                        />
                    </PaginationContent>
                </Pagination>
            )}
        </div>
    );
}

export default StreamsTable;
