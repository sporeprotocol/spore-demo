import { Spore } from '@/spore';
import { useQuery } from 'react-query';

export default function useSporeByIdQuery(
  id: string | undefined,
  initialData?: Spore,
) {
  const sporesQuery = useQuery(
    ['spore', id],
    async () => {
      const response = await fetch(`/api/spore/${encodeURIComponent(id!)}`);
      const data = await response.json();
      return data as Spore;
    },
    { initialData, enabled: !!id },
  );
  return sporesQuery;
}
