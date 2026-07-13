"use client";

import { useMemo } from "react";
import { Select, Space, Input } from "antd";
import {
  defaultCountries,
  FlagImage,
  parseCountry,
  usePhoneInput,
} from "react-international-phone";

export type PhoneValue = {
  countryCode: string;
  countryIso2: string;
  phoneNumber: string;
  fullPhone: string;
};

type PhoneNumberInputProps = {
  value?: PhoneValue;
  onChange?: (value: PhoneValue) => void;
  disabled?: boolean;
  placeholder?: string;
  id?: string;
  defaultCountry?: string;
};

const EMPTY_PHONE_VALUE: PhoneValue = {
  countryCode: "",
  countryIso2: "",
  phoneNumber: "",
  fullPhone: "",
};

export default function PhoneNumberInput({
  value = EMPTY_PHONE_VALUE,
  onChange,
  disabled = false,
  placeholder = "Enter phone number",
  id,
  defaultCountry = "in",
}: PhoneNumberInputProps) {
  const countries = useMemo(
    () => defaultCountries.map(parseCountry),
    [],
  );

  const countryOptions = useMemo(
    () =>
      countries.map((item) => ({
        value: item.iso2,
        label: `${item.name} +${item.dialCode}`,
        searchText: [
          item.name,
          item.iso2,
          item.dialCode,
          `+${item.dialCode}`,
        ]
          .join(" ")
          .toLowerCase(),
        country: item,
      })),
    [countries],
  );

  const {
    phone,
    inputRef,
    country,
    setCountry,
    handlePhoneValueChange,
  } = usePhoneInput({
    defaultCountry,
    value: value.fullPhone ?? "",
    countries: defaultCountries,

    onChange: ({
      phone: nextFullPhone,
      country: selectedCountry,
    }) => {
      const countryCode = selectedCountry?.dialCode
        ? `+${selectedCountry.dialCode}`
        : "";

      const normalizedFullPhone = normalizePhone(nextFullPhone);

      const phoneNumber = removeCountryCode(
        normalizedFullPhone,
        countryCode,
      );

      onChange?.({
        countryCode,
        countryIso2: selectedCountry?.iso2 ?? "",
        phoneNumber,
        fullPhone: normalizedFullPhone,
      });
    },
  });

  function handleCountryChange(iso2: string) {
    setCountry(iso2);

    const selectedCountry = countries.find(
      (item) => item.iso2 === iso2,
    );

    if (!selectedCountry) {
      return;
    }

    const countryCode = `+${selectedCountry.dialCode}`;

    const currentPhoneNumber =
      value.phoneNumber ||
      removeCountryCode(
        normalizePhone(phone),
        value.countryCode,
      );

    const fullPhone = currentPhoneNumber
      ? `${countryCode}${currentPhoneNumber}`
      : countryCode;

    onChange?.({
      countryCode,
      countryIso2: selectedCountry.iso2,
      phoneNumber: currentPhoneNumber,
      fullPhone,
    });
  }

  return (
    <Space.Compact className="phone-number-input w-full">
      <Select
        showSearch
        value={country.iso2}
        disabled={disabled}
        options={countryOptions}
        popupMatchSelectWidth={340}
        optionFilterProp="searchText"
        filterOption={(searchValue, option) => {
          const normalizedSearch = searchValue
            .trim()
            .toLowerCase();

          const optionSearchText = String(
            option?.searchText ?? "",
          ).toLowerCase();

          return optionSearchText.includes(normalizedSearch);
        }}
        onChange={handleCountryChange}
        optionRender={(option) => {
          const item = option.data.country;

          return (
            <div className="flex w-full items-center gap-3">
              <FlagImage
                iso2={item.iso2}
                size="24px"
              />

              <span className="min-w-0 flex-1 truncate">
                {item.name}
              </span>

              <span className="shrink-0 text-slate-400">
                +{item.dialCode}
              </span>
            </div>
          );
        }}
        labelRender={() => (
          <div className="flex items-center gap-2">
            <FlagImage
              iso2={country.iso2}
              size="22px"
            />

            <span className="text-sm">
              +{country.dialCode}
            </span>
          </div>
        )}
        className="phone-country-select"
        style={{
          width: 125,
        }}
        size="large"
        aria-label="Select phone country"
      />

      {/*
        A native input is used because usePhoneInput expects its ref
        to point directly to an HTMLInputElement.
      */}
      <input
        id={id}
        ref={inputRef}
        type="tel"
        value={phone}
        disabled={disabled}
        onChange={handlePhoneValueChange}
        placeholder={placeholder}
        autoComplete="tel"
        inputMode="tel"
        className="
          min-w-0 flex-1
          border border-l-0 border-[#d9d9d9]
          bg-white px-[11px]
          text-base text-slate-900
          outline-none transition
          placeholder:text-[#bfbfbf]
          hover:border-blue-400
          focus:border-blue-500
          focus:shadow-[0_0_0_2px_rgba(5,145,255,0.1)]
          disabled:cursor-not-allowed
          disabled:bg-[#f5f5f5]
          disabled:text-black/25
        "
      />
    </Space.Compact>
  );
}

function normalizePhone(phone: string): string {
  const trimmedPhone = phone.trim();

  if (!trimmedPhone) {
    return "";
  }

  const digits = trimmedPhone.replace(/\D/g, "");

  return digits ? `+${digits}` : "";
}

function removeCountryCode(
  fullPhone: string,
  countryCode: string,
): string {
  const normalizedPhone = fullPhone.replace(/\D/g, "");
  const normalizedCountryCode = countryCode.replace(/\D/g, "");

  if (
    normalizedCountryCode &&
    normalizedPhone.startsWith(normalizedCountryCode)
  ) {
    return normalizedPhone.slice(normalizedCountryCode.length);
  }

  return normalizedPhone;
}