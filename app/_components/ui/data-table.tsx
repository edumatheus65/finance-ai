"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";
import { Button } from "./button";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pageSize?: number;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pageSize = 10,
}: DataTableProps<TData, TValue>) {
  const [pageIndex, setPageIndex] = useState(0);

  // Cálculo do slice de dados para a página atual
  const start = pageIndex * pageSize;
  const end = start + pageSize;
  const pageData = data.slice(start, end);

  const table = useReactTable({
    data: pageData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const totalPages = Math.ceil(data.length / pageSize);

  const handlePrevious = () => {
    setPageIndex((old) => Math.max(old - 1, 0));
  };

  const handleNext = () => {
    setPageIndex((old) => Math.min(old + 1, totalPages - 1));
  };

  return (
    <div className="space-y-4">
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
  );
}
