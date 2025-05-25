import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { MantineProvider } from "@mantine/core";
import { AdminLayout } from "./AdminLayout";

describe("AdminLayout", () => {
  test("renders sidebar with navigation links", () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <MantineProvider>
          <AdminLayout>
            <div>Test Content</div>
          </AdminLayout>
        </MantineProvider>
      </MemoryRouter>
    );

    expect(screen.getByText("Tournament Control")).toBeInTheDocument();
    expect(screen.getByText("Edit Tournament")).toBeInTheDocument();
    expect(screen.getByText("Edit Matches")).toBeInTheDocument();
    expect(screen.getByText("Invite Users")).toBeInTheDocument();
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });
});
