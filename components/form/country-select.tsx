"use client";

import { useMemo } from "react";
import { Select } from "antd";
import type { SelectProps } from "antd";
import {
  defaultCountries,
  FlagImage,
  parseCountry,
} from "react-international-phone";

type CountrySelectProps = Omit<SelectProps<string>, "options">;

export default function CountrySelect(props: CountrySelectProps) {
  const options = useMemo(
    () =>
      defaultCountries.map(parseCountry).map((country) => ({
        value: country.iso2.toUpperCase(),
        label: country.name,
        searchText: `${country.name} ${country.iso2}`.toLowerCase(),
        iso2: country.iso2,
      })),
    [],
  );

  return (
    <Select
      {...props}
      showSearch
      options={options}
      popupMatchSelectWidth={320}
      optionFilterProp="searchText"
      filterOption={(searchValue, option) =>
        String(option?.searchText ?? "")
          .toLowerCase()
          .includes(searchValue.trim().toLowerCase())
      }
      optionRender={(option) => (
        <div className="flex items-center gap-3">
          <FlagImage iso2={option.data.iso2} size="22px" />
          <span className="truncate">{option.data.label}</span>
        </div>
      )}
      labelRender={({ value, label }) => (
        <div className="flex items-center gap-2">
          <FlagImage iso2={String(value).toLowerCase()} size="20px" />
          <span className="truncate">{label}</span>
        </div>
      )}
    />
  );
}
