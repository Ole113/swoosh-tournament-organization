import { Button, Group, Modal, Overlay } from "@mantine/core";
import classes from "./ConfirmModel.module.css";

export default function ConfirmModel({
  content,
  opened,
  close,
  backClicked,
  successfulModelAction,
  buttonLabels,
}: {
  content: any;
  opened: boolean;
  close: () => void;
  backClicked?: () => void;
  successfulModelAction: () => void;
  buttonLabels?: Array<string>;
}) {
  return (
    <>
      {opened && <Overlay blur={4} color="rgba(0, 0, 0, 0.4)" fixed zIndex={1000} />}
      <Modal zIndex={1100} size="lg" opened={opened} onClose={close} centered withCloseButton>
        <div className={classes.confirmContents}>
          {content}
          <Group>
            <Button color="orange" onClick={successfulModelAction}>
              {buttonLabels && buttonLabels[0] ? buttonLabels[0] : "Yes"}
            </Button>
            <Button color="orange" variant="outline" onClick={backClicked || close}>
              {buttonLabels && buttonLabels[1] ? buttonLabels[1] : "No"}
            </Button>
          </Group>
        </div>
      </Modal>
    </>
  );
}
