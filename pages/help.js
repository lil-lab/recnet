import DividerLine from "@/components/DividerLine";
import styles from "@/styles/About.module.css";
import { formatDateVerbose, getNextCutoff } from "@/utils/dateHelper";
import { Typography } from "@mui/material";
import YouTube from "react-youtube";

export default function About() {
  return (
    <main className={styles.main}>
      <Typography
        variant="h3"
        color="primary"
        sx={{ marginTop: "3%", marginBottom: "3%" }}
      >
        Quick Introduction
      </Typography>
      <YouTube videoId={"qpEvFhNqrn8"} />
      <DividerLine />
      <Typography
        variant="h3"
        color="primary"
        sx={{
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
      <DividerLine />
      <Typography variant="h3" color="primary" sx={{ marginBottom: "3%" }}>
        Cutoff
      </Typography>
      <Typography variant="body1">{`Every Tuesday 11:59:59PM UTC. The next cutoff in your local time: ${formatDateVerbose(
        getNextCutoff()
      )}.`}</Typography>
    </main>
  );
}
