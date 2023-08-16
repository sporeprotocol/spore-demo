import { Spore } from '@/spore';
import { useQuery } from 'react-query';

export default function useSporeByClusterQuery(
  clusterId: string | undefined,
  initialData?: Spore[],
) {
  const sporesQuery = useQuery(
    ['spores', clusterId],
    async () => {
      const response = await fetch(
        `/api/spore?clusterId=${encodeURIComponent(clusterId!)}`,
      );
      const data = await response.json();
      return data as Spore[];
    },
    { initialData, enabled: !!clusterId },
  );
  return sporesQuery;
}
