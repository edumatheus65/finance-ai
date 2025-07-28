"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";
import { Button } from "./button";
import { cn } from "@/app/_lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { ScrollArea } from "./scroll-area";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  // pageSize?: number;
  className?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  // pageSize = 10,
  className,
}: DataTableProps<TData, TValue>) {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(5);

  const handlePageSizeChange = (value: string) => {
    const newSize = parseInt(value);
    setPageSize(newSize);
    setPageIndex(0);
  };

  const start = pageIndex * pageSize;
  const end = start + pageSize;
  const pageData = useMemo(() => {
    return data.slice(start, end);
  }, [data, start, end]);

  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));

  const table = useReactTable({
    data: pageData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handlePrevious = () => {
    setPageIndex((old) => Math.max(old - 1, 0));
  };

  const handleNext = () => {
    setPageIndex((old) => Math.min(old + 1, totalPages - 1));
  };

  return (
    <>
      <div className="flex justify-between-items-center flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Items per page:</span>

          <Select
            onValueChange={handlePageSizeChange}
            value={pageSize.toString()}
          >
            <SelectTrigger className="w-[80px]">
              <SelectValue placeholder="Itens" />
            </SelectTrigger>
            <SelectContent>
              {[5, 10, 15, 20].map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handlePrevious}
            disabled={pageIndex === 0}
            variant="outline"
          >
            Anterior
          </Button>
          <span className="text-sm">
            Página {pageIndex + 1} de {totalPages}
          </span>
          <Button
            onClick={handleNext}
            disabled={pageIndex === -1}
            variant="outline"
          >
            Próximo
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className={cn("rounded-md border", className)}>
          <ScrollArea className="max-h-[400px] overflow-auto">
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
                                header.getContext(),
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
                            cell.getContext(),
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
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>

        {/* Controles de paginação */}
        <div className="flex justify-between items-center">
          <Button
            onClick={handlePrevious}
            disabled={pageIndex === 0}
            variant="outline"
          >
            Anterior
          </Button>
          <span className="text-sm">
            Página {pageIndex + 1} de {totalPages}
          </span>
          <Button
            onClick={handleNext}
            disabled={pageIndex === totalPages - 1}
            variant="outline"
          >
            Próximo
          </Button>
        </div>
      </div>
    </>
  );
}
