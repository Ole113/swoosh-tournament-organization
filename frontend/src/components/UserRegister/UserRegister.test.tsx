import { render } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import { MemoryRouter } from "react-router-dom";
import { MantineProvider } from "@mantine/core";
import { UserRegister } from "./UserRegister";

test("renders UserRegister component", () => {
  render(
    <MockedProvider>
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <MantineProvider>
          <UserRegister />
        </MantineProvider>
      </MemoryRouter>
    </MockedProvider>
  );
});
