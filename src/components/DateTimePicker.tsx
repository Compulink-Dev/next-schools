// components/DateTimePicker.tsx
"use client";

import * as React from "react";
import { ChevronDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";

interface DateTimePickerProps {
  label: string;
  value?: Date;
  onChange: (date: Date | undefined) => void;
  error?: string;
}

export function DateTimePicker({
  label,
  value,
  onChange,
  error,
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    value
  );
  const [timeValue, setTimeValue] = React.useState(
    value ? format(value, "HH:mm:ss") : "10:30:00"
  );

  // Update when external value changes
  React.useEffect(() => {
    setSelectedDate(value);
    if (value) {
      setTimeValue(format(value, "HH:mm:ss"));
    }
  }, [value]);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date && timeValue) {
      const [hours, minutes, seconds] = timeValue.split(":").map(Number);
      const newDateTime = new Date(date);
      newDateTime.setHours(hours, minutes, seconds || 0);
      onChange(newDateTime);
    } else {
      onChange(date);
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setTimeValue(newTime);

    if (selectedDate && newTime) {
      const [hours, minutes, seconds] = newTime.split(":").map(Number);
      const newDateTime = new Date(selectedDate);
      newDateTime.setHours(hours, minutes, seconds || 0);
      onChange(newDateTime);
    }
  };

  const formatDisplayDate = (date: Date | undefined) => {
    if (!date) return "Select date and time";
    return `${format(date, "MMM dd, yyyy")} at ${format(date, "HH:mm")}`;
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <Label className="text-xs text-gray-500">{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between font-normal text-left"
          >
            <span className="flex-1">{formatDisplayDate(selectedDate)}</span>
            <ChevronDownIcon className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-4" align="start">
          <div className="flex flex-col gap-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              initialFocus
            />
            <div className="flex flex-col gap-2">
              <Label htmlFor="time-picker" className="text-sm">
                Time
              </Label>
              <Input
                type="time"
                id="time-picker"
                step="1"
                value={timeValue}
                onChange={handleTimeChange}
                className="bg-background [&::-webkit-calendar-picker-indicator]:hidden"
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
