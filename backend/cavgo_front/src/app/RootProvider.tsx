// app/RootProvider.tsx
"use client";

import { ApolloProvider } from '@apollo/client';
import { Provider as ReduxProvider } from 'react-redux';
import createApolloClient from '@/app/apolloClient'; // Adjust the import path as needed
import { makeStore } from '@/lib/store'; // Adjust the import path as needed

const store = makeStore();
const apolloClient = createApolloClient();

export default function RootProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ReduxProvider store={store}>
      <ApolloProvider client={apolloClient}>
        {children}
      </ApolloProvider>
    </ReduxProvider>
  );
}
