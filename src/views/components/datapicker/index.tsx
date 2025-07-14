import React from "react";
import DatePicker from "react-datepicker";
import { registerLocale } from "react-datepicker";
import { ru } from "date-fns/locale/ru";
import { parse, format } from "date-fns";
import "react-datepicker/dist/react-datepicker.css";
import type { StringDatePickerProps } from "../../../services/types";
registerLocale("ru", ru);

const StringDatePicker: React.FC<StringDatePickerProps> = ({
  selected,
  onChange,
  ...props
}) => {
  const dateFormat = "dd.MM.yyyy";

  const parsedDate = selected ? parse(selected, dateFormat, new Date()) : null;

  const handleChange = (date: Date | null) => {
    const dateString = date ? format(date, dateFormat) : "";
    onChange(dateString);
  };

  return (
    <DatePicker
      selected={parsedDate}
      onChange={handleChange}
      dateFormat={dateFormat}
      locale="ru"
      {...props}
    />
  );
};

export default StringDatePicker;
