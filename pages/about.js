import styles from "@/styles/About.module.css";
import { Typography, Divider, Link } from "@mui/material";

export default function About() {
  return (
    <main className={styles.main}>
      <Typography
        variant="h3"
        color="primary"
        sx={{
          marginTop: "3%",
          marginBottom: "3%",
        }}
      >
        About
      </Typography>
      <Typography variant="body1">
        Recnet is a human-driven recommendation system for academic readings.
        Recnet implements a mechanism similar to contemporary social networks,
        but it is designed to be impoverished in certain ways through
        information bottlenecks that increase communication cost. This is
        intended to limit the amount of time the system consumes from its users,
        while increasing the quality of information passed. The Recnet mechanism
        was initially outlined by Yoav Artzi in{" "}
        <Link href="https://yoavartzi.substack.com/p/a-quick-sketch-of-a-human-based-paper">
          a Substack post
        </Link>
        . Recnet is currently in initial development stages.
      </Typography>
      <Divider
        textAlign="left"
        flexItem
        sx={{
          marginTop: "3%",
          marginBottom: "3%",
        }}
      ></Divider>
      <Typography variant="h3" color="primary" sx={{ marginBottom: "3%" }}>
        Team
      </Typography>
      <Typography variant="body1">
        Anya Ji [<Link href="https://anya-ji.github.io/">website</Link>] [
        <Link href="https://www.recnet.io/aj592">recnet profile</Link>
        ]
        <br />
        Valene Tjong [
        <Link href="https://www.linkedin.com/in/valene-tjong/">website</Link>
        ] [
        <Link href="https://www.recnet.io/vtjong">recnet profile</Link>
        ]
        <br />
        Yoav Artzi [<Link href="https://yoavartzi.com/">website</Link>] [
        <Link href="https://www.recnet.io/yoav">recnet profile</Link>]
      </Typography>
    </main>
  );
}
