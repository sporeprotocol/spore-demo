import { BI, Indexer, helpers } from '@ckb-lumos/lumos';
import { sporeConfig } from "@/config";

export const dynamic = 'force-dynamic';

export async function GET(_: Request, { params }: { params: { address: string } }) {
  const { address } = params;
  if (!address) {
    return new Response(null, { status: 400 });
  }

  const indexer = new Indexer(sporeConfig.ckbIndexerUrl);
  const collector = indexer.collector({
    lock: helpers.parseAddress(address as string, { config: sporeConfig.lumos }),
    data: '0x',
  });

  let capacities = BI.from(0);
  for await (const cell of collector.collect()) {
    capacities = capacities.add(cell.cellOutput.capacity);
  }

  return new Response(capacities.toHexString(), { status: 200 });
}
