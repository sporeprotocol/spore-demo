import { Cluster } from "@/cluster";
import { useQuery } from "react-query";

export default function useClustersQuery(initialData?: Cluster[]) {
  const clustersQuery = useQuery(
    ['clusters'],
    async () => {
      const response = await fetch('/api/cluster');
      const data = await response.json();
      return data as Cluster[];
    },
    {
      initialData,
    },
  );

  return clustersQuery;
}
