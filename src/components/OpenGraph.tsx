import { Cluster } from '@/cluster';
import { trpc } from '@/server';
import { Spore } from '@/spore';
import { IMAGE_MIME_TYPE } from '@/utils/mime';
import { useMantineTheme } from '@mantine/core';
import { DefaultSeo, NextSeo } from 'next-seo';

export function GlobalOpenGraph() {
  const theme = useMantineTheme();

  return (
    <DefaultSeo
      title="Spore Demo"
      description="A Spore Protocol Demo, based on Next.js + React + Spore SDK."
      themeColor={theme.colors!.brand![0]}
      openGraph={{
        type: 'website',
        locale: 'en',
        url: 'https://spore-demo.vercel.app',
        siteName: 'Spore Demo',
        title: 'Spore Demo',
        description:
          'A Spore Protocol Demo, based on Next.js + React + Spore SDK.',
        images: [
          {
            url: '/images/og.png',
            width: 400,
            height: 210,
            alt: 'Spore Demo',
            type: 'image/png',
          },
        ],
      }}
      twitter={{
        cardType: 'summary_large_image',
      }}
    />
  );
}

export function ClusterOpenGraph(props: { id: string }) {
  const { id } = props;

  return (
    <NextSeo
      title={`Cluster: ${id.slice(0, 10)}...${id.slice(-10)} | Spore Demo`}
      description={id}
    />
  );
}

export function SporeOpenGraph(props: { id: string }) {
  const { id } = props;
  const { data: spore } = trpc.spore.get.useQuery({ id });

  return (
    <NextSeo
      title={`Spore: ${id.slice(0, 10)}...${id.slice(-10)} | Spore Demo`}
      description={id}
      openGraph={{
        images: [
          ...(IMAGE_MIME_TYPE.includes(spore?.contentType ?? '' as any)
            ? [
                {
                  url: `/api/v1/media/${id}`,
                  width: 400,
                  height: 400,
                  alt: id,
                  type: spore?.contentType,
                },
              ]
            : []),
        ],
      }}
    />
  );
}
