import React, { useEffect, useState } from "react";
import { Paper, Typography, Link, Avatar } from "@mui/material";
import styles from "./PostCard.module.css";
import { fontStyles } from "@/utils/fonts";
import { getUserById } from "@/utils/db/user";
import { formatDate, getDateFromServerTimestamp } from "@/utils/dateHelper";
import { useRouter } from "next/router";

export default function PostCard({ post, showUser, showDate, width }) {
  const { title, link, author, description, year, month } = post;
  const [recommender, setRecommender] = useState(undefined);
  const router = useRouter();

  useEffect(() => {
    async function getRecommender(id) {
      const { data, error } = await getUserById(id);
      setRecommender(data);
    }
    getRecommender(post.userId);
  }, [post]);

  function showBasicPost(children) {
    return (
      <Paper
        sx={{
          borderRadius: 8,
          paddingTop: "2rem",
          paddingBottom: showUser || showDate ? "1rem" : "2rem",
          paddingX: "2rem",
          marginBottom: "1rem",
          width: width ?? "100%",
        }}
      >
        <Link href={link} target="_blank" rel="noopener" align="left">
          <Typography variant="h4" color="primary">
            {`${title} ${
              year && month ? `(${month} ${year})` : year ? `(${year})` : ""
            }`}
          </Typography>
        </Link>
        <Typography
          className={styles.text}
          variant="h6"
          sx={fontStyles.regular}
          align="left"
        >
          {author}
        </Typography>

        <Typography
          className={styles.description}
          variant="h5"
          sx={fontStyles.regular}
          color="text.secondary"
          align="left"
        >
          {description}
        </Typography>
        {children}
      </Paper>
    );
  }

  if (showUser) {
    return (
      recommender &&
      showBasicPost(
        <div className={styles.recommender}>
          <Avatar
            className={styles.recommenderAvatar}
            alt="profile"
            src={recommender.photoURL}
            referrerPolicy="no-referrer"
            onClick={() => {
              router.push(`/${recommender.username}`);
            }}
            style={{ cursor: "pointer" }}
          />

          <Typography
            variant="body2"
            sx={{
              ...fontStyles.regular,
              cursor: "pointer",
              textDecoration: "underline",
            }}
            color="text.secondary"
            align="left"
            onClick={() => {
              router.push(`/${recommender.username}`);
            }}
          >
            {recommender.displayName}
          </Typography>
        </div>
      )
    );
  } else if (showDate && post.cutoff) {
    return showBasicPost(
      <div className={styles.recommender}>
        <Typography
          variant="body1"
          sx={fontStyles.regular}
          color="text.secondary"
          align="left"
        >
          {formatDate(getDateFromServerTimestamp(post.cutoff))}
        </Typography>
      </div>
    );
  } else {
    return showBasicPost();
  }
}
