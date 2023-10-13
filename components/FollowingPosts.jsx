import { List } from "@mui/material";
import PostCard from "./PostCard";
import styles from "./FollowingPosts.module.css";

export default function FollowingPosts({ posts }) {
  return (
    <List className={styles.list}>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} width={"90%"} showUser />
      ))}
    </List>
  );
}
