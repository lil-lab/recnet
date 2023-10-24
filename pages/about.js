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
        With the abundance of academic papers and overwhelmingly complex
        recommendation systems around, an entirely human-based recommendation
        system is much needed to provide high-quality recommendations from
        trusted sources. Lorem ipsum dolor sit amet, consectetur adipisicing
        elit. Quos blanditiis tenetur unde suscipit, quam beatae rerum inventore
        consectetur, neque doloribus, cupiditate numquam dignissimos laborum
        fugiat deleniti? Eum quasi quidem quibusdam.
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
        Contact
      </Typography>
      <Typography variant="body1">
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quos
        blanditiis tenetur unde suscipit, quam beatae rerum inventore
        consectetur, neque doloribus, cupiditate numquam dignissimos laborum
        fugiat deleniti? Eum quasi quidem quibusdam.
      </Typography>
    </main>
  );
}
