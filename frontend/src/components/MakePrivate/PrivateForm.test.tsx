import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MantineProvider } from "@mantine/core";
import PrivateForm from "./PrivateForm";

describe("PrivateForm", () => {
  const mockForm = {
    getValues: vi.fn(() => ({
      isPrivate: false,
      withPassword: false,
      password: "",
      withInviteLink: false,
    })),
    setFieldValue: vi.fn(),
    getInputProps: vi.fn(() => ({})),
  };

  it("renders the checkbox with correct label", () => {
    render(
      <MantineProvider>
        <PrivateForm mainForm={mockForm} formType="event" />
      </MantineProvider>
    );

    expect(screen.getByLabelText("Private event?")).toBeInTheDocument();
  });

  it("calls setFieldValue when checkbox is clicked", () => {
    render(
      <MantineProvider>
        <PrivateForm mainForm={mockForm} formType="event" />
      </MantineProvider>
    );

    const checkbox = screen.getByLabelText("Private event?");
    fireEvent.click(checkbox);

    expect(mockForm.setFieldValue).toHaveBeenCalledWith("isPrivate", true);
  });
});
