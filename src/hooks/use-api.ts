"use client";

import {
  useMutation,
  useQuery,
  type QueryKey,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
  apiUpload,
  ApiClientError,
} from "@/lib/api/client";

export function useApiQuery<T>(
  key: QueryKey,
  path: string,
  params?: Record<string, string | number | boolean | undefined | null>,
  options?: Omit<UseQueryOptions<T, ApiClientError>, "queryKey" | "queryFn">
) {
  return useQuery<T, ApiClientError>({
    queryKey: params ? [...key, params] : key,
    queryFn: () => apiGet<T>(path, params),
    ...options,
  });
}

export function useApiMutation<TData, TVariables = unknown>(
  options: UseMutationOptions<TData, ApiClientError, TVariables>
) {
  return useMutation<TData, ApiClientError, TVariables>(options);
}

export function useApiPost<TData, TVariables = unknown>(
  path: string | ((variables: TVariables) => string),
  options?: Omit<
    UseMutationOptions<TData, ApiClientError, TVariables>,
    "mutationFn"
  >
) {
  return useMutation<TData, ApiClientError, TVariables>({
    mutationFn: (variables) =>
      apiPost<TData>(
        typeof path === "function" ? path(variables) : path,
        variables
      ),
    ...options,
  });
}

export function useApiPatch<TData, TVariables = unknown>(
  path: string | ((variables: TVariables) => string),
  options?: Omit<
    UseMutationOptions<TData, ApiClientError, TVariables>,
    "mutationFn"
  >
) {
  return useMutation<TData, ApiClientError, TVariables>({
    mutationFn: (variables) =>
      apiPatch<TData>(
        typeof path === "function" ? path(variables) : path,
        variables
      ),
    ...options,
  });
}

export function useApiDelete<TData, TVariables = string>(
  path: string | ((variables: TVariables) => string),
  options?: Omit<
    UseMutationOptions<TData, ApiClientError, TVariables>,
    "mutationFn"
  >
) {
  return useMutation<TData, ApiClientError, TVariables>({
    mutationFn: (variables) =>
      apiDelete<TData>(
        typeof path === "function" ? path(variables) : path
      ),
    ...options,
  });
}

export function useApiUpload<TData>(
  path: string | ((formData: FormData) => string),
  options?: Omit<
    UseMutationOptions<TData, ApiClientError, FormData>,
    "mutationFn"
  >
) {
  return useMutation<TData, ApiClientError, FormData>({
    mutationFn: (formData) =>
      apiUpload<TData>(
        typeof path === "function" ? path(formData) : path,
        formData
      ),
    ...options,
  });
}
