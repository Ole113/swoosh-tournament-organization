import { useState } from "react";
import { Combobox, InputBase, useCombobox } from "@mantine/core";
import formats from "../../tournamentFormats.json";

export default function Select({
  label,
  placeholder,
  withAsterisk,
  value,
  onChange,
  error,
}: {
  label: string;
  placeholder: string;
  withAsterisk: boolean;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const [search, setSearch] = useState("");

  const shouldFilterOptions = formats.formats.every((item) => item !== search);
  const filteredOptions = shouldFilterOptions
    ? formats.formats.filter((item) => item.toLowerCase().includes(search.toLowerCase().trim()))
    : formats.formats;

  const options = filteredOptions.map((item) => (
    <Combobox.Option value={item} key={item}>
      {item}
    </Combobox.Option>
  ));

  return (
    <Combobox
      store={combobox}
      withinPortal={false}
      onOptionSubmit={(val) => {
        onChange(val);
        setSearch(val);
        combobox.closeDropdown();
      }}
    >
      <Combobox.Target>
        <InputBase
          label={label}
          rightSection={<Combobox.Chevron />}
          value={search}
          onChange={(event) => {
            combobox.openDropdown();
            combobox.updateSelectedOptionIndex();
            setSearch(event.currentTarget.value);
          }}
          onClick={() => combobox.openDropdown()}
          onFocus={() => combobox.openDropdown()}
          onBlur={() => {
            combobox.closeDropdown();
            setSearch(value || "");
          }}
          placeholder={placeholder}
          rightSectionPointerEvents="none"
          withAsterisk={withAsterisk}
          error={error}
        />
      </Combobox.Target>

      <Combobox.Dropdown>
        <Combobox.Options>
          {options.length > 0 ? options : <Combobox.Empty>Nothing found</Combobox.Empty>}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}
