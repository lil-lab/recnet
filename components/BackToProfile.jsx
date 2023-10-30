import { Typography, Link } from "@mui/material";
import { fontStyles } from "@/utils/fonts";
import { useRouter } from "next/router";

export default function BackToProfile() {
  const router = useRouter();
  const userId = router.query.userid?.split('/')[0];

  return (
    <Link href={`/profile?userId=${userId}`} style={{ marginTop: "2%" }}>
      <Typography variant="body2" sx={fontStyles.regular}>
        back to profile
      </Typography>
    </Link>
  );
}
