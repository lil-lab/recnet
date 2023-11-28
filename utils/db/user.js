import axios from "axios";
import { post, get } from "./shared";

export async function getUserByEmail(email) {
  return await get(`/api/user/getUserByEmail?email=${email}`);
}

export async function getUserByUsername(username) {
  return await get(`/api/user/getUserByUsername?username=${username}`);
}

export async function getUserById(id) {
  return await get(`/api/user/getUserById?id=${id}`);
}

export async function addUser(user) {
  return await post("/api/user/addUser", user);
}

export async function followUser(id, currentUserId) {
  if (id && currentUserId) {
    return await post("/api/user/follow", {
      id,
      currentUserId,
    });
  }
}

export async function unfollowUser(id, currentUserId) {
  if (id && currentUserId) {
    return await post("/api/user/unfollow", {
      id,
      currentUserId,
    });
  }
}

export async function searchUsers(emailOrName) {
  return await get(`/api/user/search?q=${emailOrName}`);
}

export async function setUserInfo(username, affiliation, name, userId) {
  return await post("/api/user/setUserInfo", {
    username,
    affiliation,
    name,
    userId,
  });
}

export async function getUsers(userIds) {
  return await post(`/api/user/getUsers`, { userIds });
}

export async function getAllUsers() {
  return await get(`/api/user/getAllUsers`);
}

export async function verifyCode(user, code) {
  return await post(`/api/user/verify`, { user, code });
}
