import { Typography, Link } from "@mui/material";
import { fontStyles } from "@/utils/fonts";
import { useRouter } from "next/router";

/** Link to direct to another link or take additional actions.
 * @param {string} route
 * @param {string} text
 * @param {() => void} onClick (optional)
 */
export default function BackLink({ route, text, onClick }) {
  const router = useRouter();
  return (
    // <Link href={route} style={{ marginTop: "2%" }}>
    <Typography
      variant="body2"
      sx={{
        ...fontStyles.regular,
        cursor: "pointer",
        textDecoration: "underline",
        marginTop: "2%",
      }}
      onClick={onClick ? onClick : () => router.push(route)}
    >
      {text}
    </Typography>
    // </Link>
  );
}
