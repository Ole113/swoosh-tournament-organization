import { render } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import { MemoryRouter } from "react-router-dom";
import { MantineProvider } from "@mantine/core";
import { UserLogin } from "./UserLogin";

test("renders UserLogin component", () => {
  render(
    <MockedProvider>
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <MantineProvider>
          <UserLogin />
        </MantineProvider>
      </MemoryRouter>
    </MockedProvider>
  );
});
