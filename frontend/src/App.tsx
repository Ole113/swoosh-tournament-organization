import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";

import { ToastContainer } from "react-toastify";
import { MantineProvider } from "@mantine/core";
import { Router } from "./Router";
import { theme } from "./theme";

import "./App.module.css";

import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import { GRAPHQL_URL } from "./constants";

const client = new ApolloClient({
  uri: GRAPHQL_URL,
  cache: new InMemoryCache(),
  connectToDevTools: false,
});

export default function App() {
  return (
    <ApolloProvider client={client}>
      <MantineProvider theme={theme}>
        <Router />
        <ToastContainer />
      </MantineProvider>
    </ApolloProvider>
  );
}
