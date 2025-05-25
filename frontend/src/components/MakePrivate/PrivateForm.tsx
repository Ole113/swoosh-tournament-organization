import { IconCheck, IconInfoSquareRounded, IconX } from "@tabler/icons-react";
import {
  Checkbox,
  Divider,
  Group,
  PasswordInput,
  Popover,
  rem,
  Stack,
  Switch,
  Text,
  useMantineTheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import classes from "./PrivateForm.module.css";

export default function PrivateForm({ mainForm, formType }: { mainForm: any; formType: string }) {
  const theme = useMantineTheme();
  const [opened, { close, toggle }] = useDisclosure(false);
  const isPrivate = mainForm.getValues().isPrivate;
  const checkboxLabel = `Private ${formType}?`;

  return (
    <div className={classes.privateForm}>
      <Group wrap="nowrap" gap="xs">
        <Checkbox
          checked={isPrivate}
          onChange={(event: any) =>
            mainForm.setFieldValue("isPrivate", event.currentTarget.checked)
          }
          label={checkboxLabel}
          color={theme.colors.teal[6]}
          size="md"
        />
        <Popover
          width={300}
          position="bottom"
          withArrow
          shadow="md"
          opened={opened}
          onClose={close}
        >
          <Popover.Target>
            <IconInfoSquareRounded
              onClick={toggle}
              style={{ width: rem(15), height: rem(15), cursor: "pointer" }}
              color="#fd7e14"
              stroke={2}
            />
          </Popover.Target>
          <Popover.Dropdown style={{ pointerEvents: "none" }}>
            <Text>
              If your {formType} is private then only members with the password or invite link can
              join
            </Text>
          </Popover.Dropdown>
        </Popover>
      </Group>
      {mainForm.getValues().isPrivate ? (
        <Stack>
          <Divider my="md" />
          <h3 style={{ margin: 0, textTransform: "capitalize" }}>Private {formType} Settings</h3>
          <Text fz="md" opacity={0.6}>
            If your {formType} is private then only members with the password or invite link can
            join. You can choose to make your {formType} joinable with a password, invite link or
            both.
          </Text>
          <Switch
            checked={mainForm.getValues().withPassword}
            onChange={(event) =>
              mainForm.setFieldValue("withPassword", event.currentTarget.checked)
            }
            color="teal"
            size="md"
            label="Joinable with password?"
            thumbIcon={
              mainForm.getValues().withPassword ? (
                <IconCheck
                  style={{ width: rem(12), height: rem(12) }}
                  color={theme.colors.teal[6]}
                  stroke={3}
                />
              ) : (
                <IconX
                  style={{ width: rem(12), height: rem(12) }}
                  color={theme.colors.red[6]}
                  stroke={3}
                />
              )
            }
          />
          {mainForm.getValues().withPassword ? (
            <PasswordInput
              {...mainForm.getInputProps("password")}
              placeholder="Password"
              label="Set a Password"
              withAsterisk
            />
          ) : (
            ""
          )}
          <Group>
            <Switch
              checked={mainForm.getValues().withInviteLink}
              onChange={(event) =>
                mainForm.setFieldValue("withInviteLink", event.currentTarget.checked)
              }
              color="teal"
              size="md"
              label="Joinable with invite link?"
              thumbIcon={
                mainForm.getValues().withInviteLink ? (
                  <IconCheck
                    style={{ width: rem(12), height: rem(12) }}
                    color={theme.colors.teal[6]}
                    stroke={3}
                  />
                ) : (
                  <IconX
                    style={{ width: rem(12), height: rem(12) }}
                    color={theme.colors.red[6]}
                    stroke={3}
                  />
                )
              }
            />
          </Group>
        </Stack>
      ) : null}
    </div>
  );
}
