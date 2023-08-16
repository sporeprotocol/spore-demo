import { useQuery } from 'react-query';
import { BI } from '@ckb-lumos/lumos';
import { useConnect } from '../useConnect';

export type AccountInfo = {
  capacities: string;
};

export default function useAccountQuery() {
  const { address } = useConnect();
  const accountQuery = useQuery(
    ['account', address],
    async () => {
      const response = await fetch(`/api/account/${address}`);
      const data = await response.json();
      return data;
    },
    {
      initialData: {
        capacities: BI.from(0).toHexString(),
      },
      enabled: !!address,
    },
  );

  return accountQuery;
}
