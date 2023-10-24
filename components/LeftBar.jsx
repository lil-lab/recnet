import {
  START_DATE,
  formatDate,
  formatDateVerbose,
  getNextCutoff,
  getPastDueDays,
} from "@/utils/dateHelper";
import { fontStyles } from "@/utils/fonts";
import { Button, Divider, List, ListItem, Typography } from "@mui/material";
import { useState } from "react";
import styles from "./LeftBar.module.css";
import PostButton from "./PostButton";

export default function LeftBar({ lastPost, setFilter }) {
  const dates = getPastDueDays(START_DATE); // TODO
  const [selected, setSelected] = useState(formatDate(dates[0])); // TODO: no dates

  return (
    <List className={styles.sideBar}>
      <ListItem>
        <PostButton lastPost={lastPost} />
      </ListItem>
      <ListItem>
        <Typography variant="body2" color="textSecondary" align="center">
          {lastPost
            ? `Edit you recommendation anytime before: ${formatDateVerbose(
                getNextCutoff()
              )}`
            : `Recommend a paper before: ${formatDateVerbose(getNextCutoff())}`}
        </Typography>
      </ListItem>
      <Divider textAlign="left" flexItem style={{ marginTop: "1%" }}>
        <Typography
          variant="body2"
          sx={fontStyles.regular}
          color="primary"
          align="left"
        >
          previous weeks
        </Typography>
      </Divider>
      {dates.map((date, index) => {
        let formattedDate = formatDate(date);
        return (
          <ListItem key={index}>
            <Button
              className={styles.dateButton}
              variant={selected === formattedDate ? "contained" : "outlined"}
              onClick={() => {
                setSelected(formattedDate);
                setFilter(date);
              }}
            >
              {formattedDate}
            </Button>
          </ListItem>
        );
      })}
    </List>
  );
}
