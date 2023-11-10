import { Typography, Link } from "@mui/material";
import { fontStyles } from "@/utils/fonts";

export default function BackLink({route, text}) {
  return (
    <Link href={route} style={{ marginTop: "2%" }}>
      <Typography variant="body2" sx={fontStyles.regular}>
        {text}
      </Typography>
    </Link>
  );
}
