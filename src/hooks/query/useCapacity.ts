import { useQuery } from '@tanstack/react-query';

export function useCapacity(address: string) {
  const { data, isLoading } = useQuery({
    queryKey: ['capacity', address],
    queryFn: async () => fetch(`/api/capacity/${address}`).then((res) => res.text()),
    enabled: !!address,
  });
  return {
    data,
    isLoading,
  };
}
