import axios from "axios";
import { post, get } from "./shared";

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

export const getPostInProgressByUser = async (userId) => {
  return get(`/api/post/getPostInProgressByUser?userId=${userId}`);
};

export const getPostById = async (postId) => {
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

export const getPostsByUser = async (userId, includeCurrentCutoff) => {
  const postRes = await axios.get(
    `/api/post/getPostsByUser?userId=${userId}&includeCurrentCutoff=${includeCurrentCutoff}`
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
