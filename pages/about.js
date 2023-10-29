import styles from "@/styles/About.module.css";
import { Typography, Divider } from "@mui/material";
import { useEffect, useState } from "react";

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
          but it is designed to be impoverished in certain ways through information 
          bottlenecks that increase communication cost. This is intended to limit 
          the amount of time the system consumes from its users, while increasing 
          the quality of information passed. The Recnet mechanism was initially 
          outlined by Yoav Artzi in <a href="https://yoavartzi.substack.com/p/a-quick-sketch-of-a-human-based-paper">a Substack post</a>.
          Recnet is currently is initial development stages.
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
        Anya Ji [<a href="https://anya-ji.github.io/">website</a>] [<a href="https://www.recnet.io/profile?userId=LCiJ5IX9R0P8DxqyBFr28LkBsUq1">recnet profile</a>]
        Valene Tjong
        Yoav Artzi [<a href="https://yoavartzi.com/">website</a>] [<a href="https://www.recnet.io/profile?userId=foiYV9JeW2fFUkJvbQ6KnIC1tT93">recnet profile</a>]
      </Typography>
    </main>
  );
}
