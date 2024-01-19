import { useQuery } from '@tanstack/react-query';
import { HexNumber } from '@ckb-lumos/base';

export function useCapacity(address: string, defaultValue?: HexNumber) {
  const { data, isLoading } = useQuery<HexNumber | undefined>({
    queryKey: ['capacity', address],
    queryFn: async (): Promise<string | undefined> => {
      try {
        const res = await fetch(`/api/capacity/${address}`);
        return await res.text();
      } catch {
        return defaultValue ?? void 0;
      }
    },
    enabled: !!address,
  });
  return {
    data,
    isLoading,
  };
}
