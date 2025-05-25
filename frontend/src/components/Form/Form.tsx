import React, { ReactNode } from "react";
import { Button, Group } from "@mantine/core";
import { useForm } from "@mantine/form";

interface FormProps {
  children?: ReactNode;
  onSubmit: (value: any) => void;
}

export default function Form({ children, onSubmit }: FormProps) {
  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      email: "",
      termsOfService: false,
    },

    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
    },
  });

  return (
    <form onSubmit={onSubmit}>
      {children}
      <Group justify="flex-end" mt="md">
        <Button type="submit">Submit</Button>
      </Group>
    </form>
  );
}
