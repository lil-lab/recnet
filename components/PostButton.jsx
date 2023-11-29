import { Button } from "@mui/material";
import { useRouter } from "next/router";
import styles from "./PostButton.module.css";

export default function PostButton({ postInProgress }) {
  const router = useRouter();
  return (
    <Button
      className={styles.button}
      onClick={() => {
        router.push(`/edit`);
      }}
      variant="contained"
      color="secondary"
    >
      {postInProgress ? "Edit my rec 🛠" : "Recommend a paper 📝"}
    </Button>
  );
}
