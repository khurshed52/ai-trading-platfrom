"use client";

import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Package } from "lucide-react";
import {
  createColumnHelper,
  createPaginatedRowModel,
  rowPaginationFeature,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";

import { Product } from "@/types/auth";

type ProductsResponse = {
  products: Product[];
};

const features = tableFeatures({
  rowPaginationFeature,
  paginatedRowModel: createPaginatedRowModel(),
});
const columnHelper = createColumnHelper<typeof features, Product>();
const emptyProducts: Product[] = [];
const initialState = {
  pagination: {
    pageIndex: 0,
    pageSize: 10,
  },
};

const columns = columnHelper.columns([
  columnHelper.accessor("id", {
    header: "ID",
    cell: (info) => info.getValue(),
  }),

  columnHelper.accessor("title", {
    header: "Product Title",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("price", {
    header: "Price",
    cell: (info) => `$${info.getValue().toFixed(2)}`,
  }),
   columnHelper.accessor("rating", {
    header: "Rating",
    cell: (info) => info.getValue(),
  }),
]);

export default function ProductsTable() {
  const {
    data,
    isLoading,
    error,
  } = useQuery<Product[]>({
    queryKey: ["products"],

    queryFn: async () => {
      const response = await fetch("https://dummyjson.com/products");

      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      const result = (await response.json()) as ProductsResponse;

      return result.products;
    },
  });

  const table = useTable({
    features,
    data: data ?? emptyProducts,
    columns,
    initialState,
  });

  if (isLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-100 p-6">
        <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
          <span className="size-5 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
          Loading products...
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-100 p-6">
        <div className="rounded-xl bg-red-50 px-5 py-4 text-sm text-red-700 shadow-sm">
          <strong className="block font-semibold">Unable to load products</strong>
          {error.message}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-5xl overflow-hidden rounded-2xl bg-white shadow-[0_8px_30px_rgb(15_23_42/0.08)] ring-1 ring-slate-200/70">
        <header className="flex items-center gap-4 border-b border-slate-200 px-6 py-5 sm:px-8">
          <span className="grid size-11 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
            <Package aria-hidden="true" size={22} />
          </span>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-900">
              Products
            </h1>
            <p className="mt-0.5 text-sm text-slate-500">
              Browse and manage your product catalogue
            </p>
          </div>
        </header>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead className="bg-slate-50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="border-b border-slate-200 px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 first:w-24 sm:px-8"
                    >
                      {header.isPlaceholder ? null : (
                        <table.FlexRender header={header} />
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>

            <tbody className="divide-y divide-slate-100">
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="transition-colors hover:bg-indigo-50/40"
                >
                  {row.getAllCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="whitespace-nowrap px-6 py-4 text-sm text-slate-700 first:font-medium first:text-slate-500 last:font-semibold last:text-slate-900 sm:px-8"
                    >
                      <table.FlexRender cell={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <footer className="flex flex-col gap-4 border-t border-slate-200 bg-slate-50/70 px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <label className="flex items-center gap-2 text-sm text-slate-600">
            Rows per page
          <select
            aria-label="Rows per page"
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            value={table.state.pagination.pageSize}
            onChange={(event) => table.setPageSize(Number(event.target.value))}
          >
            {[10, 20, 40].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                {pageSize}
              </option>
            ))}
          </select>
        </label>

          <nav aria-label="Product pagination" className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Previous page"
            className="grid size-9 place-items-center rounded-lg text-slate-600 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft aria-hidden="true" size={18} />
          </button>

            {table.getPageOptions().map((pageIndex) => {
              const isActive = table.state.pagination.pageIndex === pageIndex;

              return (
                <button
                  key={pageIndex}
                  type="button"
                  onClick={() => table.setPageIndex(pageIndex)}
                  aria-current={isActive ? "page" : undefined}
                  className={`size-9 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {pageIndex + 1}
                </button>
              );
            })}

            <button
              type="button"
              aria-label="Next page"
              className="grid size-9 place-items-center rounded-lg text-slate-600 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight aria-hidden="true" size={18} />
            </button>
          </nav>
        </footer>
      </section>
    </main>
  );
}
