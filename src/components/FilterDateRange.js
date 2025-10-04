import * as React from "react";
import { LocalizationProvider } from "@mui/x-date-pickers-pro";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateRangePicker } from "@mui/x-date-pickers-pro";
import { Box, Stack, Chip, useMediaQuery } from "@mui/material";
import dayjs from "dayjs";

export default function FilterDateRange({
  value,
  onChange,
  calendars = null, // optional override
}) {
  const isWide = useMediaQuery("(min-width:900px)");
  const defaultCalendars = calendars !== null ? calendars : (isWide ? 2 : 1);

  const [range, setRange] = React.useState(
    value || [dayjs().startOf("day"), dayjs().endOf("day")]
  );
  const [active, setActive] = React.useState(null);

  React.useEffect(() => {
    if (value) setRange(value);
  }, [value]);

  const setAndNotify = (newRange, preset = null) => {
    setRange(newRange);
    setActive(preset);
    if (onChange) onChange(newRange);
  };

  const quickSelect = (type) => {
    let newRange;
    switch (type) {
      case "today":
        newRange = [dayjs().startOf("day"), dayjs().endOf("day")];
        break;
      case "week":
        newRange = [dayjs().startOf("week"), dayjs().endOf("week")];
        break;
      case "month":
        newRange = [dayjs().startOf("month"), dayjs().endOf("month")];
        break;
      case "3months":
        newRange = [
          dayjs().subtract(3, "month").startOf("month"),
          dayjs().endOf("month"),
        ];
        break;
      case "6months":
        newRange = [
          dayjs().subtract(6, "month").startOf("month"),
          dayjs().endOf("month"),
        ];
        break;
      default:
        return;
    }
    setAndNotify(newRange, type);
  };

  // helper to check if a preset is active
  const presetMatches = (type) => {
    if (!range || !range[0] || !range[1]) return false;
    const map = {
      today: [dayjs().startOf("day"), dayjs().endOf("day")],
      week: [dayjs().startOf("week"), dayjs().endOf("week")],
      month: [dayjs().startOf("month"), dayjs().endOf("month")],
      "3months": [dayjs().subtract(3, "month").startOf("month"), dayjs().endOf("month")],
      "6months": [dayjs().subtract(6, "month").startOf("month"), dayjs().endOf("month")],
    };
    const target = map[type];
    return range[0].isSame(target[0], "day") && range[1].isSame(target[1], "day");
  };

  React.useEffect(() => {
    // keep active in sync with manual picker changes
    if (presetMatches("today")) setActive("today");
    else if (presetMatches("week")) setActive("week");
    else if (presetMatches("month")) setActive("month");
    else if (presetMatches("3months")) setActive("3months");
    else if (presetMatches("6months")) setActive("6months");
    else setActive(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range?.[0], range?.[1]]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box>
        <Stack direction="row" spacing={1} mb={1.5} flexWrap="wrap" gap={'.5rem'}>
          {[
            { key: "today", label: "Today" },
            { key: "week", label: "This Week" },
            { key: "month", label: "This Month" },
            { key: "3months", label: "Last 3 Months" },
            { key: "6months", label: "Last 6 Months" },
          ].map((p) => (
            <Chip
              key={p.key}
              label={p.label}
              onClick={() => quickSelect(p.key)}
              clickable
              color={active === p.key ? "primary" : "default"}
              variant={active === p.key ? "filled" : "outlined"}
              sx={{
                textTransform: "none",
                borderRadius: 2,
                px: 1.5,
              }}
            />
          ))}
        </Stack>

        <DateRangePicker
          calendars={defaultCalendars}
          value={range}
          onChange={(newRange) => {
            // newRange is [startDayjs, endDayjs]
            setRange(newRange);
            // clear preset highlight, will re-evaluate in effect above
            setActive(null);
            if (onChange) onChange(newRange);
          }}
          slotProps={{
            textField: {
              size: "small",
              fullWidth: true,
            },
            popper: {
              sx: {
                // keep popper above everything
                zIndex: 2000,
                // support dark mode automatically via theme where possible
              },
            },
          }}
          localeText={{ start: "Start date", end: "End date" }}
        />
      </Box>
    </LocalizationProvider>
  );
}
