import { useState } from "react";
import { Combobox, Group, Input, InputBase, Text, useCombobox } from "@mantine/core";
import Team from "../../types/Team";
import classes from "./SelectWithDescription.module.css";

export default function SelectWithDescription({
  tournamentTeams,
  setSelectedTeam,
}: {
  tournamentTeams: Partial<Team>[];
  setSelectedTeam: (value: Team) => void;
}) {
  const [value, setValue] = useState<string>("");

  let selectedOption: Partial<Team> | undefined = undefined;
  if (tournamentTeams.length > 0) {
    selectedOption = tournamentTeams.find((item) => item.name === value);
  }

  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  function SelectOption({ name, participantSet }: any) {
    return (
      <Group>
        <div>
          <Text fz="sm" fw={500}>
            {name}
          </Text>
          <Text fz="xs" opacity={0.6}>
            {participantSet.map((participant: any, index: number) =>
              participantSet.length > 1 && index !== participantSet.length - 1
                ? `${participant.name}, `
                : participant.name
            )}
          </Text>
        </div>
      </Group>
    );
  }

  const dropdownOptions = tournamentTeams.map((team, index) => (
    <Combobox.Option value={team.name ?? ""} key={index}>
      <SelectOption {...team} />
    </Combobox.Option>
  ));

  return (
    <div className={classes.descriptionSelect}>
      <Combobox
        store={combobox}
        withinPortal={false}
        onOptionSubmit={(val) => {
          setValue(val);

          const selectedTeam: Partial<Team> =
            tournamentTeams.find((team) => team.name === val) || {};

          if (selectedTeam && selectedTeam.name) {
            setSelectedTeam(selectedTeam as Team);
          }

          combobox.closeDropdown();
        }}
      >
        <Combobox.Target>
          <InputBase
            component="button"
            type="button"
            pointer
            rightSection={<Combobox.Chevron />}
            onClick={() => combobox.toggleDropdown()}
            rightSectionPointerEvents="none"
            multiline
          >
            {selectedOption ? (
              <SelectOption {...selectedOption} />
            ) : (
              <Input.Placeholder>Team</Input.Placeholder>
            )}
          </InputBase>
        </Combobox.Target>

        <Combobox.Dropdown>
          <div className={classes.dropdown}>
            <Combobox.Options>
              {dropdownOptions.length > 0 ? (
                dropdownOptions
              ) : (
                <Text fz="md" opacity={0.6}>
                  There are no available teams to join right now
                </Text>
              )}
            </Combobox.Options>
          </div>
        </Combobox.Dropdown>
      </Combobox>
    </div>
  );
}
