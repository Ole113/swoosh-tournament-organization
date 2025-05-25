import { useState } from "react";
import { Button, Group, Modal, Overlay, PasswordInput, Text } from "@mantine/core";
import classes from "./JoinModel.module.css";

export default function JoinModel({
  modelType,
  name,
  eventType,
  opened,
  password,
  backClicked,
  successfulModelAction,
  buttonLabels,
}: {
  modelType: string;
  name: string;
  eventType: string;
  opened: boolean;
  password: string;
  backClicked: () => void;
  successfulModelAction: () => void;
  buttonLabels?: Array<string>;
}) {
  const [inputPassword, setInputPassword] = useState<string>("");
  const [invalidPassword, setInvalidPassword] = useState<boolean>(false);

  const checkPassword = () => {
    if (inputPassword === password) {
      successfulModelAction();
    } else {
      setInvalidPassword(true);
    }
  };

  return (
    <>
      {opened && <Overlay blur={4} color="rgba(0, 0, 0, 0.4)" fixed zIndex={1000} />}
      <Modal
        zIndex={1100}
        size="lg"
        opened={opened}
        onClose={() => {}}
        centered
        withCloseButton={false}
      >
        {modelType === "invite" ? (
          <div className={classes.inviteContents}>
            <h1>
              You have been invited to the {eventType} {name}!
            </h1>
            <Group>
              <Button color="orange" onClick={successfulModelAction}>
                {buttonLabels && buttonLabels[0] ? buttonLabels[0] : "View"}
              </Button>
              <Button color="orange" variant="outline" onClick={backClicked}>
                {buttonLabels && buttonLabels[1] ? buttonLabels[1] : "Go Back"}
              </Button>
            </Group>
          </div>
        ) : modelType === "password" ? (
          <div className={classes.passwordContents}>
            <h1>This {eventType} is password protected</h1>
            <Text fz="md" opacity={0.6}>
              This {eventType} is private and needs a password to be joined. If you don't know the
              password ask the {eventType} creator.
            </Text>
            <PasswordInput
              data-autofocus
              value={inputPassword}
              onChange={(event) => setInputPassword(event.currentTarget.value)}
              placeholder="Password"
              error={invalidPassword ? "The password was incorrect" : undefined}
            />
            <Group style={{ width: "100%" }}>
              <Button onClick={checkPassword} color="orange">
                {buttonLabels && buttonLabels[0] ? buttonLabels[0] : "Submit"}
              </Button>
              <Button variant="outline" color="orange" onClick={backClicked}>
                {buttonLabels && buttonLabels[1] ? buttonLabels[1] : "Go Back"}
              </Button>
            </Group>
          </div>
        ) : modelType === "invalid" ? (
          <div className={classes.invalidContents}>
            <h1>Your invite link for this {eventType} is invalid</h1>
            <Group>
              <Text fz="md" opacity={0.6}>
                This could be because this {eventType} is full or the invite code has changed.
              </Text>
            </Group>
            <Button color="orange" onClick={backClicked}>
              {buttonLabels && buttonLabels[1] ? buttonLabels[1] : "Go Back"}
            </Button>
          </div>
        ) : modelType === "inviteOnly" ? (
          <div className={classes.invalidContents}>
            <h1>This {eventType} can only be joined through an invite link</h1>
            <Group>
              <Text fz="md" opacity={0.6}>
                Contact the {eventType} administrator for an invite link.
              </Text>
            </Group>
            <Button color="orange" onClick={backClicked}>
              {buttonLabels && buttonLabels[1] ? buttonLabels[1] : "Go Back"}
            </Button>
          </div>
        ) : (
          "The modelType prop was not valid."
        )}
      </Modal>
    </>
  );
}
