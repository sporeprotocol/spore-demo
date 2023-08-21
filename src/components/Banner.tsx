import { Text, Flex, createStyles, Container, MediaQuery } from '@mantine/core';
import Image from 'next/image';

const useStyles = createStyles((theme) => ({
  banner: {
    overflowY: 'hidden',
    borderBottomWidth: '2px',
    borderBottomColor: theme.colors.text[0],
    borderBottomStyle: 'solid',
  },

  container: {
    position: 'relative',
  },

  illus: {
    position: 'absolute',
    left: '-387px',
    top: '-25px',
  },
}));

export default function Banner() {
  const { classes } = useStyles();

  return (
    <Flex align="center" h="280px" bg="brand.0" className={classes.banner}>
      <Container size="xl" mt="80px" className={classes.container}>
        <MediaQuery query="(max-width: 80rem)" styles={{ display: 'none' }}>
          <Image
            className={classes.illus}
            src="/spore-demo-illus.svg"
            width="339"
            height="315"
            alt="Spore Demo Illus"
          />
        </MediaQuery>
        <Flex direction="column" justify="center" align="center" gap="32px">
          <Image
            src="/images/banner.png"
            width="630"
            height="60"
            layout="responsive"
            alt="Spore Demo"
          />

          <Text size="xl" align="center">
            Connect your wallet, mint a spore, start your cluster – all
            on-chain!
          </Text>
        </Flex>
      </Container>
    </Flex>
  );
}
