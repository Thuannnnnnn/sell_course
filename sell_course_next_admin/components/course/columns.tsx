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
} from "../ui/table";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Edit2, Trash2, Eye } from "lucide-react";
import { Input } from "../ui/input";
import { format } from "date-fns";
import Image from "next/image";
import { Course } from "app/types/course";
import { useRouter } from "next/navigation";

interface CourseTableProps {
  courses: Course[];
  onDelete: (id: string) => void;
  onUpdate: (id: string) => void;
}
export function CourseTable({ courses, onDelete, onUpdate }: CourseTableProps) {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = useState("");

  const columns: ColumnDef<Course>[] = [
    {
      accessorKey: "thumbnail",
      header: "Thumbnail",
      enableSorting: false,
      cell: ({ row }) => (
        <div
          onClick={() => router.push(`/course/${row.original.courseId}`)}
          className="w-20 h-12 relative cursor-pointer"
        >
          <Image
            src={row.getValue("thumbnail")}
            alt={row.getValue("title")}
            fill
            sizes="(max-width: 640px) 100vw, 640px"
            priority={true}
            className="object-cover rounded-md w-full h-full"
          />
        </div>
      ),
    },
    {
      accessorKey: "title",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Title
            {column.getIsSorted() === "asc"
              ? " ↑"
              : column.getIsSorted() === "desc"
              ? " ↓"
              : ""}
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("title")}</div>
      ),
    },
    {
      accessorKey: "categoryName",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Category
            {column.getIsSorted() === "asc"
              ? " ↑"
              : column.getIsSorted() === "desc"
              ? " ↓"
              : ""}
          </Button>
        );
      },
    },
    {
      accessorKey: "price",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Price
            {column.getIsSorted() === "asc"
              ? " ↑"
              : column.getIsSorted() === "desc"
              ? " ↓"
              : ""}
          </Button>
        );
      },
      cell: ({ row }) => {
        return <div>{row.getValue("price")}</div>;
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Status
            {column.getIsSorted() === "asc"
              ? " ↑"
              : column.getIsSorted() === "desc"
              ? " ↓"
              : ""}
          </Button>
        );
      },
      cell: ({ row }) => {
        const status = row.getValue("status") as boolean | string;
        return (
          <Badge 
            variant={
              status === "REJECTED" ? "destructive" :
              status === "PUBLISHED" ? "default" :
              status === "PENDING_REVIEW" ? "secondary" :
              status === "DRAFT" ? "outline" :
              status === "ARCHIVED" ? "destructive" : "default"
            }
            className={
              status === "PUBLISHED" ? "bg-green-500 hover:bg-green-600" :
              status === "PENDING_REVIEW" ? "bg-yellow-500 hover:bg-yellow-600" :
              status === "DRAFT" ? "bg-gray-500 hover:bg-gray-600" :
              status === "ARCHIVED" ? "bg-gray-400 hover:bg-gray-500" : ""
            }
          >
            {status === "PUBLISHED" ? "PUBLISHED" :
              status === "PENDING_REVIEW" ? "PENDING REVIEW" :
              status === "DRAFT" ? "DRAFT" :
              status === "ARCHIVED" ? "ARCHIVED" :
              status === "REJECTED" ? "REJECTED" : ""
            }
          </Badge>
        );
      },
    },
    {
      accessorKey: "updatedAt",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Last Updated
            {column.getIsSorted() === "asc"
              ? " ↑"
              : column.getIsSorted() === "desc"
              ? " ↓"
              : ""}
          </Button>
        );
      },
      cell: ({ row }) => {
        return format(new Date(row.getValue("updatedAt")), "MM/dd/yyyy");
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const course = row.original;
        return (
          <div className="flex justify-end gap-2">
            {course.status === "PENDING_REVIEW" && (
              <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push(`/course/review/${course.courseId}`)}
              >
              <Eye className="h-4 w-4" />
              <span className="sr-only">Preview</span>
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onUpdate(course.courseId)}
            >
              <Edit2 className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(course.courseId)}
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
    initialState: {
      pagination: {
        pageSize: 5,
      },
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
    },
  });
  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const totalRows = table.getFilteredRowModel().rows.length;
  const currentPageRows = table.getRowModel().rows.length;
  const start = totalRows > 0 ? pageIndex * pageSize + 1 : 0;
  const end = totalRows > 0 ? start + currentPageRows - 1 : 0;
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          placeholder="Search courses..."
          value={globalFilter ?? ""}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-sm"
        />
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
          Showing {start} to {end} of {totalRows} courses.
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
