    import React, { useState } from "react";
    import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    SortingState,
    getSortedRowModel,
    ColumnFiltersState,
    getFilteredRowModel,
    getPaginationRowModel,
    VisibilityState,
    } from "@tanstack/react-table";
    import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    } from "@/components/ui/table";
    import { Button } from "../ui/button";
    import { Badge } from "../ui/badge";
    import { Edit2, Trash2, ChevronDown } from "lucide-react";
    import { Input } from "../ui/input";
    import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
    } from "../ui/dropdown-menu";
    interface Course {
    id: number;
    title: string;
    category: string;
    thumbnail: string;
    price: number;
    status: string;
    updatedAt: string;
    }
    interface CourseTableProps {
    courses: Course[];
    onDelete: (id: number) => void;
    onUpdate: (id: number) => void;
    }
    export function CourseTable({ courses, onDelete, onUpdate }: CourseTableProps) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [globalFilter, setGlobalFilter] = useState("");
    const columns: ColumnDef<Course>[] = [
        {
        accessorKey: "thumbnail",
        header: "Thumbnail",
        cell: ({ row }) => (
            <div className="w-20 h-12 relative">
            <img
                src={row.getValue("thumbnail")}
                alt={row.getValue("title")}
                className="object-cover rounded-md w-full h-full"
            />
            </div>
        ),
        },
        {
        accessorKey: "title",
        header: "Title",
        cell: ({ row }) => (
            <div className="font-medium">{row.getValue("title")}</div>
        ),
        },
        {
        accessorKey: "category",
        header: "Category",
        },
        {
        accessorKey: "price",
        header: "Price",
        cell: ({ row }) => {
            const price = parseFloat(row.getValue("price"));
            const vndPrice = new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            }).format(price * 24000); // Converting USD to VND for demo
            return <div>{vndPrice}</div>;
        },
        },
        {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string;
            return (
            <Badge variant={status === "Published" ? "default" : "secondary"}>
                {status}
            </Badge>
            );
        },
        },
        {
        accessorKey: "updatedAt",
        header: "Last Updated",
        cell: ({ row }) => {
            return new Date(row.getValue("updatedAt")).toLocaleDateString();
        },
        },
        {
        id: "actions",
        cell: ({ row }) => {
            const course = row.original;
            return (
            <div className="flex justify-end gap-2">
                <Button
                variant="ghost"
                size="icon"
                onClick={() => onUpdate(course.id)}
                >
                <Edit2 className="h-4 w-4" />
                <span className="sr-only">Edit</span>
                </Button>
                <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(course.id)}
                className="text-destructive hover:text-destructive"
                >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete</span>
                </Button>
            </div>
            );
        },
        },
    ];
    const table = useReactTable({
        data: courses,
        columns,
        getCoreRowModel: getCoreRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onGlobalFilterChange: setGlobalFilter,
        state: {
        sorting,
        columnFilters,
        columnVisibility,
        globalFilter,
        },
    });
    return (
        <div className="space-y-4">
        <div className="flex items-center gap-4">
            <Input
            placeholder="Search courses..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="max-w-sm"
            />
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                Columns <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                    return (
                    <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                        }
                    >
                        {column.id}
                    </DropdownMenuCheckboxItem>
                    );
                })}
            </DropdownMenuContent>
            </DropdownMenu>
        </div>
        <div className="rounded-md border">
            <Table>
            <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                    return (
                        <TableHead key={header.id}>
                        {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                            )}
                        </TableHead>
                    );
                    })}
                </TableRow>
                ))}
            </TableHeader>
            <TableBody>
                {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                    <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    >
                    {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                        {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                        )}
                        </TableCell>
                    ))}
                    </TableRow>
                ))
                ) : (
                <TableRow>
                    <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                    >
                    No courses found.
                    </TableCell>
                </TableRow>
                )}
            </TableBody>
            </Table>
        </div>
        <div className="flex items-center justify-between space-x-2 py-4">
            <div className="flex-1 text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
            </div>
            <div className="space-x-2">
            <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
            >
                Previous
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
            >
                Next
            </Button>
            </div>
        </div>
        </div>
    );
    }
