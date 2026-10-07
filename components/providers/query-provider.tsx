"use client";

import type { ReactNode } from "react";
import { useState } from "react";

import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

import { App as AntdApp } from "antd";

type QueryProviderProps = {
  children: ReactNode;
};

type ApiResponse = {
  statusCode?: number;
  message?: string;
  data?: unknown;
};

function QueryProviderInner({
  children,
}: QueryProviderProps) {
  const { message } = AntdApp.useApp();

  const [queryClient] = useState(
    () =>
      new QueryClient({
        // Global GET / useQuery error handling
        queryCache: new QueryCache({
          onError: (error) => {
            message.error(
              error.message || "Something went wrong"
            );
          },
        }),

        // Global POST / PUT / DELETE / useMutation handling
        mutationCache: new MutationCache({
          onError: (error) => {
            message.error(
              error.message || "Something went wrong"
            );
          },

          onSuccess: (data) => {
            const response = data as ApiResponse;

            if (response?.message) {
              message.success(response.message);
            }
          },
        }),

        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },

          mutations: {
            retry: 0,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

export default function QueryProvider({
  children,
}: QueryProviderProps) {
  return (
    <AntdApp>
      <QueryProviderInner>
        {children}
      </QueryProviderInner>
    </AntdApp>
  );
}