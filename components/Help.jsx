import HelpIcon from "@mui/icons-material/Help";
import { useRouter } from "next/router";
export default function Help({ color }) {
  const router = useRouter();
  return (
    <HelpIcon
      sx={{
        cursor: "pointer",
        fontSize: "medium",
        marginLeft: "0.5rem",
      }}
      color={color ?? "disabled"}
      onClick={() => {
        router.push("/help");
      }}
    />
  );
}
