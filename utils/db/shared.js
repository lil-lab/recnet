import axios from "axios";
import { getCurrentUser } from "./auth";

async function makeAxiosRequest(method, url, data) {
  try {
    let config = { method, url, data };

    const currentUser = await getCurrentUser();
    if (currentUser) {
      config["headers"] = {
        Authorization: `Bearer ${currentUser.accessToken}`,
      };
    }

    const response = await axios(config);
    return response;
  } catch (error) {
    return { error: error.response.data };
  }
}

export async function get(route) {
  return makeAxiosRequest("get", route);
}

export async function del(route) {
  return makeAxiosRequest("delete", route);
}

export async function post(route, body) {
  return makeAxiosRequest("post", route, body);
}

export async function put(route, body) {
  return makeAxiosRequest("put", route, body);
}
