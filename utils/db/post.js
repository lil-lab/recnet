import axios from "axios";
import { post, get, del } from "./shared";

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
  return post("/api/post/postEntry", {
    title,
    link,
    author,
    description,
    email,
    year,
    month,
    userId,
  });
};

export const getPostInProgressByUser = async (userId) => {
  return get(`/api/post/getPostInProgressByUser?userId=${userId}`);
};

export const getPostById = async (postId) => {
  return get(`/api/post/getPostById?postId=${postId}`);
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
  const route = `/api/post/getPostsByUser?userId=${userId}` +
               `&includeCurrentCutoff=${includeCurrentCutoff}`;
  return await get(route);
};

export const getFollowingPostsByDate = async (userId, date) => {
  const route = `/api/post/getFollowingPostsByDate?userId=${userId}` +
                `&cutoff=${date.getTime()}`
  return await get(route);
};

export const deletePost = async (postId) => {
  return await del(`/api/post/deletePost?postId=${postId}`);
};
