"use client";

import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function CustomHeader({
  date,
  decreaseMonth,
  increaseMonth,
  changeYear,
  prevMonthButtonDisabled,
  nextMonthButtonDisabled,
}: {
  date: Date;
  decreaseMonth: () => void;
  increaseMonth: () => void;
  changeYear: (year: number) => void;
  prevMonthButtonDisabled: boolean;
  nextMonthButtonDisabled: boolean;
}) {
  const years = Array.from({ length: 15 }, (_, i) => new Date().getFullYear() - 7 + i);

  return (
    <div className="flex items-center justify-between px-1 pb-2">
      <button
        type="button"
        onClick={decreaseMonth}
        disabled={prevMonthButtonDisabled}
        className="grid h-7 w-7 place-items-center rounded-md text-muted hover:bg-surface-muted hover:text-foreground disabled:opacity-30"
      >
        ‹
      </button>
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <span>{date.toLocaleString("default", { month: "short" })}</span>
        <select
          value={date.getFullYear()}
          onChange={({ target: { value } }) => changeYear(Number(value))}
          className="rounded-md border border-border bg-surface px-1.5 py-0.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-brand"
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>
      <button
        type="button"
        onClick={increaseMonth}
        disabled={nextMonthButtonDisabled}
        className="grid h-7 w-7 place-items-center rounded-md text-muted hover:bg-surface-muted hover:text-foreground disabled:opacity-30"
      >
        ›
      </button>
    </div>
  );
}

export function DatePicker({
  value,
  onChange,
  minDate,
  disabled,
  placeholderText = "Select date",
  popperPlacement,
}: {
  value?: string;
  onChange?: (value: string) => void;
  minDate?: Date;
  disabled?: boolean;
  placeholderText?: string;
  popperPlacement?: "bottom-end" | "bottom-start" | "top-end" | "top-start";
}) {
  return (
    <>
      <ReactDatePicker
        selected={value ? new Date(value + "T00:00:00") : null}
        onChange={(date: Date | null) => {
          if (date) {
            const y = date.getFullYear();
            const m = String(date.getMonth() + 1).padStart(2, "0");
            const d = String(date.getDate()).padStart(2, "0");
            onChange?.(`${y}-${m}-${d}`);
          } else {
            onChange?.("");
          }
        }}
        minDate={minDate}
        disabled={disabled}
        placeholderText={placeholderText}
        dateFormat="yyyy-MM-dd"
        renderCustomHeader={(props) => <CustomHeader {...props} />}
        className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none"
        wrapperClassName="w-full"
        calendarClassName="!bg-surface !border-border !rounded-xl !shadow-lg"
        dayClassName={() => "!rounded-md"}
        popperPlacement={popperPlacement}
      />
    </>
  );
}
