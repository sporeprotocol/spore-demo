import { useQuery } from "react-query";
import useWalletConnect from "./useWalletConnect";
import { BI } from "@ckb-lumos/lumos";

export type AccountInfo = {
  capacities: string;
}

export default function useAccountQuery() {
  const { address } = useWalletConnect();
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
