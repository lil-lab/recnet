import axios from "axios";
import {
  isDateWithinDateRange,
  getDateFromServerTimestamp,
} from "../dateHelper";

export const postEntry = async (
  title,
  link,
  author,
  description,
  email,
  year,
  month,
  userId
) => {
  const res = await axios.post("/api/post/postEntry", {
    title,
    link,
    author,
    description,
    email,
    year,
    month,
    userId,
  });
  if (res.status === 200) {
    const { id } = res.data;
    return id;
  }
};

export const getUserLastPost = async (userId) => {
  const res = await axios.get(`/api/user/getUserLastPostInfo?userId=${userId}`);

  if (res.status === 200) {
    const { lastPostId, lastPosted } = res.data;
    if (lastPostId && lastPosted) {
      // if there's last post
      const lastPostedDate = getDateFromServerTimestamp(lastPosted);
      // if last post is within cutoff range
      if (isDateWithinDateRange(lastPostedDate)) {
        const postRes = await axios.get(
          `/api/post/getPostById?postId=${lastPostId}`
        );
        if (postRes.status === 200) {
          return { ...postRes.data, id: lastPostId };
        }
      }
    }
  }
};

export const getPostbyId = async (postId) => {
  const postRes = await axios.get(`/api/post/getPostById?postId=${postId}`);
  if (postRes.status === 200) {
    return { ...postRes.data, id: postId };
  }
};

export const updatePost = async (
  title,
  link,
  author,
  description,
  year,
  month,
  postId
) => {
  await axios.put("/api/post/updatePost", {
    title,
    link,
    author,
    description,
    year,
    month,
    postId,
  });
};

export const getPostsByUser = async (userId, currentCutoff) => {
  const postRes = await axios.get(
    `/api/post/getPostsByUser?userId=${userId}&current=${currentCutoff}`
  );
  if (postRes.status === 200) {
    return postRes.data;
  }
};

export const getFollowingPostsByDate = async (userId, date) => {
  const postRes = await axios.get(
    `/api/post/getFollowingPostsByDate?userId=${userId}&cutoff=${date.getTime()}`
  );
  if (postRes.status === 200) {
    return postRes.data;
  }
};
