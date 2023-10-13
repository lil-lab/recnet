import { Typography, Link } from "@mui/material";
import { fontStyles } from "@/utils/fonts";

export default function BackLink() {
  return (
    <Link href={"/"} style={{ marginTop: "2%" }}>
      <Typography variant="body2" sx={fontStyles.regular}>
        back to homepage
      </Typography>
    </Link>
  );
}
