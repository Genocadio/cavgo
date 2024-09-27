import { ApolloClient, InMemoryCache,  HttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

// Function to create Apollo Client instance
const createApolloClient = () => {
  // Create an HttpLink to specify the URI of the GraphQL server
  const httpLink = new HttpLink({
    uri: 'http://cavgo.onrender.com/graphql',
  });

  // Create a middleware link to add authentication token to headers
  const authLink = setContext((_, { headers }) => {
    // Retrieve token from local storage or any other secure place
    const token = localStorage.getItem('authToken');
    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : '',
      },
    };
  });

  // Combine the authentication link and the HTTP link
  const link = from([authLink, httpLink]);

  // Create Apollo Client instance
  return new ApolloClient({
    link,
    cache: new InMemoryCache(),
  });
};

export default createApolloClient;
