import styles from "@/styles/About.module.css";
import {
  formatDate,
  formatDateVerbose,
  getNextCutoff,
} from "@/utils/dateHelper";
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
        Recommendations
      </Typography>
      <Typography variant="body1">
        Each user may recommend one paper per cycle. They may change the paper
        they recommend each cycle as many times as they want during the cycle
        (i.e, before the cutoff time). A recommendation is made out of (a) a
        link to the paper, (b) paper title and authors, (c) a very short tl;dr
        message of 280 characters.
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
        Cutoff
      </Typography>
      <Typography variant="body1">{`Every Tuesday 11:59:59PM UTC. The next cutoff in your local time: ${formatDateVerbose(
        getNextCutoff()
      )}.`}</Typography>
    </main>
  );
}
