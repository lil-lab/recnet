import { Button } from "@mui/material";
import { useRouter } from "next/router";
import styles from "./PostButton.module.css";

export default function PostButton({ lastPost }) {
  const router = useRouter();
  return lastPost ? (
    <Button
      className={styles.button}
      onClick={() => {
        router.push(`/edit?postId=${lastPost.id}`);
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
