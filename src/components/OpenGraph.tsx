import { QuerySpore } from '@/hooks/query/type';
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
        description: 'A Spore Protocol Demo, based on Next.js + React + Spore SDK.',
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

  if (!id) {
    return null;
  }

  return (
    <NextSeo
      title={`Cluster: ${id.slice(0, 10)}...${id.slice(-10)} | Spore Demo`}
      description={id}
    />
  );
}

export function SporeOpenGraph(props: { spore: QuerySpore | undefined }) {
  const { spore } = props;
  if (!spore) {
    return null;
  }

  return (
    <NextSeo
      title={`Spore: ${spore.id.slice(0, 10)}...${spore.id.slice(-10)} | Spore Demo`}
      description={spore.id}
      openGraph={{
        images: [
          ...(IMAGE_MIME_TYPE.includes(spore?.contentType as (typeof IMAGE_MIME_TYPE)[number])
            ? [
              {
                url: `/api/media/${spore.id}`,
                width: 400,
                height: 400,
                alt: spore.id,
                type: spore?.contentType,
              },
            ]
            : []),
        ],
      }}
    />
  );
}
