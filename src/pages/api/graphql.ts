import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { createContext, createApolloServer } from 'spore-graphql';

export const config = {
  maxDuration: 300,
};

export default startServerAndCreateNextHandler(createApolloServer({}), {
  context: async () => createContext(),
});
