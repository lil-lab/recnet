import { Typography } from "@mui/material";
import { fontStyles } from "@/utils/fonts";

/** Info message, e.g. empty search results. */
export default function InfoText({ children }) {
  return (
    <Typography variant="h6" sx={fontStyles.regular}>
      {children}
    </Typography>
  );
}
