import React, { useEffect, useState } from "react";
import { Paper, Typography, Link, Avatar } from "@mui/material";
import styles from "./PostCard.module.css";
import { fontStyles } from "@/utils/fonts";
import { getUserById } from "@/utils/db/user";
import { formatDate, getDateFromServerTimestamp } from "@/utils/dateHelper";

const PostCard = ({ post, showUser, showDate, width }) => {
  const { title, link, author, description } = post;
  const [recommender, setRecommender] = useState(undefined);

  useEffect(() => {
    async function getRecommender(id) {
      const recommender = await getUserById(id);
      setRecommender(recommender);
    }
    showUser && getRecommender(post.userId);
  }, [showUser, post]);

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
            {title}
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
              router.push(`/profile?userId=${userId}`);
            }}
            style={{ cursor: "pointer" }}
          />
          <Link href={link} target="_blank" rel="noopener" align="left">
            <Typography
              variant="body2"
              sx={fontStyles.regular}
              color="text.secondary"
              align="left"
            >
              {recommender.displayName}
            </Typography>
          </Link>
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
};

export default PostCard;
