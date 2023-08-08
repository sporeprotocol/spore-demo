import { Spore } from '@/utils/spore';
import { useQuery } from 'react-query';

export default function useSporesQuery(initialData: Spore[]) {
  const sporesQuery = useQuery(
    ['spores'],
    async () => {
      const response = await fetch('/api/spore');
      const data = await response.json();
      return data as Spore[];
    },
    {
      initialData,
    },
  );
  return sporesQuery;
}
