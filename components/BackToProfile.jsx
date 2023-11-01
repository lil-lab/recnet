import { Typography, Link } from "@mui/material";
import { fontStyles } from "@/utils/fonts";

export default function BackToProfile({ userId }) {
  return (
    <Link href={`/profile?userId=${userId}`} style={{ marginTop: "2%" }}>
      <Typography variant="body2" sx={fontStyles.regular}>
        back to profile
      </Typography>
    </Link>
  );
}