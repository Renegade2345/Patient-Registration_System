import React from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  ColumnFiltersState,
  getFilteredRowModel,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { downloadCsv } from '@/lib/utils';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchColumn?: string;
  searchPlaceholder?: string;
  exportFilename?: string;
  showExport?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchColumn,
  searchPlaceholder = 'Search...',
  exportFilename = 'data.csv',
  showExport = true,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });
  
  const handleExport = () => {
    // Filter visible columns
    const visibleColumns = columns.filter(col => !col.meta?.hidden);
    
    // Convert filtered data to exportable format
    const exportData = table.getFilteredRowModel().rows.map(row => {
      const exportRow: Record<string, any> = {};
      
      visibleColumns.forEach(col => {
        const accessorKey = String(col.accessorKey || '');
        if (accessorKey) {
          exportRow[col.header as string] = row.getValue(accessorKey);
        }
      });
      
      return exportRow;
    });
    
    downloadCsv(exportData, exportFilename);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between gap-2">
        {searchColumn && (
          <div className="relative max-w-sm">
            <Input
              placeholder={searchPlaceholder}
              value={(table.getColumn(searchColumn)?.getFilterValue() as string) ?? ''}
              onChange={(event) => table.getColumn(searchColumn)?.setFilterValue(event.target.value)}
              className="pl-9"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="absolute left-3 top-2.5 h-4 w-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        )}
        
        {showExport && (
          <Button variant="outline" onClick={handleExport}>
            Export to CSV
          </Button>
        )}
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
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Showing {table.getFilteredRowModel().rows.length > 0
            ? table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1
            : 0} to {Math.min(
            (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
            table.getFilteredRowModel().rows.length
          )} of {table.getFilteredRowModel().rows.length} entries
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, table.getPageCount()) }).map((_, index) => {
              const pageIndex = table.getState().pagination.pageIndex;
              const pageCount = table.getPageCount();
              
              // Calculate page numbers to show (centered around current page)
              let pageNum = index + 1;
              if (pageCount > 5) {
                if (pageIndex > 2) {
                  pageNum = pageIndex - 2 + index;
                }
                if (pageIndex > pageCount - 3) {
                  pageNum = pageCount - 4 + index;
                }
              }
              
              if (pageNum > 0 && pageNum <= pageCount) {
                return (
                  <Button
                    key={index}
                    variant={pageIndex === pageNum - 1 ? "default" : "outline"}
                    size="icon"
                    onClick={() => table.setPageIndex(pageNum - 1)}
                  >
                    {pageNum}
                  </Button>
                );
              }
              return null;
            })}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
