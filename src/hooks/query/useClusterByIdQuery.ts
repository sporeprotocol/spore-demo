import { Cluster } from '@/utils/cluster';
import { useQuery } from 'react-query';

export default function useClusterByIdQuery(
  id: string | undefined,
  initialData?: Cluster,
) {
  const clusterQuery = useQuery(
    ['cluster', id],
    async () => {
      const response = await fetch(
        `/api/cluster/${encodeURIComponent(id as string)}`,
      );
      const data = await response.json();
      return data as Cluster;
    },
    { initialData, enabled: !!id },
  );
  return clusterQuery;
}
