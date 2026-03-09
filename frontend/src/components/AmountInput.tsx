import React from "react";

type Props = {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
};

const formatAmount = (value: string) => {

  const cleaned = value.replace(/[^0-9.]/g, "");

  const parts = cleaned.split(".");

  const integerPart = parts[0];
  const decimalPart = parts[1];

  const formattedInteger = Number(integerPart || 0)
    .toLocaleString("en-US");

  if (decimalPart !== undefined) {
    return `${formattedInteger}.${decimalPart.slice(0,2)}`;
  }

  return formattedInteger;
};

export default function AmountInput({ value = "", onChange, placeholder }: Props) {

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {

    const formatted = formatAmount(e.target.value);

    if (onChange) {
      onChange(formatted);
    }
  };

  return (
    <input
      type="text"
      inputMode="decimal"
      value={value}
      placeholder={placeholder || "0.00"}
      onChange={handleChange}
    />
  );
}