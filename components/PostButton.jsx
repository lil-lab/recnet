import { Button } from "@mui/material";
import { useRouter } from "next/router";
import styles from "./PostButton.module.css";

export default function PostButton({ postInProgress }) {
  const router = useRouter();
  return postInProgress ? (
    <Button
      className={styles.button}
      onClick={() => {
        router.push(`/edit?postId=${postInProgress.id}`);
      }}
      variant="contained"
      color="secondary"
    >
      Edit my rec 🛠
    </Button>
  ) : (
    <Button
      className={styles.button}
      onClick={() => {
        router.push("/edit");
      }}
      variant="contained"
      color="secondary"
    >
      Recommend a paper 📝
    </Button>
  );
}
