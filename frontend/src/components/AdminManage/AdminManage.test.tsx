import { render, screen } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import { MemoryRouter } from "react-router-dom";
import { AdminManage } from "./AdminManage";

describe("AdminManage", () => {
  test("renders tournament format cards", () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <MantineProvider>
          <AdminManage />
        </MantineProvider>
      </MemoryRouter>
    );

    expect(screen.getByText("Tournament Formats")).toBeInTheDocument();
    expect(screen.getByText("Single Elimination")).toBeInTheDocument();
    expect(screen.getByText("Double Elimination")).toBeInTheDocument();
    expect(screen.getByText("Round Robin")).toBeInTheDocument();
    expect(screen.getByText("Swiss System")).toBeInTheDocument();
    expect(screen.getAllByText("Create Tournament")).toHaveLength(4);
  });
});
