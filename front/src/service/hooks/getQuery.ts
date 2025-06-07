import {
  type QueryKey,
  useQuery,
  type UseQueryOptions,
  type UseQueryResult,
} from "react-query";
import { api } from "../api.service";

const get = async (url: string) => {
  const { data } = await api.get(url);
  return data;
};

export const useFetch = <
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey
>(
  url: string,
  actions: TQueryKey,
  options?: Omit<
    UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
    "queryKey" | ("queryFn" & { enabled: boolean })
  >
): UseQueryResult<TData, TError> => {
  return useQuery(actions, () => get(url), {
    refetchOnWindowFocus: false,
    keepPreviousData: true,
    ...options,
  });
};
