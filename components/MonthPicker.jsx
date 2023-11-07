import { MenuItem, Select, FormControl, InputLabel } from "@mui/material";

export default function MonthPicker({ month, onChange }) {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  return (
    <FormControl fullWidth>
      <InputLabel id="month-label">Month (optional)</InputLabel>
      <Select
        labelId="month-label"
        id="month-label"
        value={month}
        label="Month (optional)"
        onChange={onChange}
        sx={{ textAlign: "left" }}
      >
        <MenuItem value={""}>
          <em>None</em>
        </MenuItem>
        {months.map((m) => (
          <MenuItem key={m} value={m}>
            {m}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
