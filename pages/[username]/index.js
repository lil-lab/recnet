import { useRouter } from "next/router";
import styles from "@/styles/Profile.module.css";

export default function Profile() {
  const router = useRouter();
  return <main className={styles.main}>{router.query.username}</main>;
}
