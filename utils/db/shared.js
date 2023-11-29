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

// export async function post(route, body) {
//   try {
//     const currentUser = await getCurrentUser();
//     console.log("current", currentUser);
//     let response;
//     if (currentUser) {
//       response = await axios.post(route, body, {
//         headers: { Authorization: `Bearer ${currentUser.accessToken}` },
//       });
//     } else {
//       response = await axios.post(route, body);
//     }

//     return response;
//   } catch (error) {
//     return { error: error.response.data };
//   }
// }

// export async function get(route) {
//   try {
//     const currentUser = await getCurrentUser();
//     let response;
//     if (currentUser) {
//       response = await axios.get(route, {
//         headers: { Authorization: `Bearer ${currentUser.accessToken}` },
//       });
//     } else {
//       response = await axios.get(route);
//     }

//     return response;
//   } catch (error) {
//     console.log(error);
//     return { error: error.response.data };
//   }
// }

// export async function del(route) {
//   try {
//     const currentUser = await getCurrentUser();
//     let response;
//     if (currentUser) {
//       response = await axios.delete(route, {
//         headers: { Authorization: `Bearer ${currentUser.accessToken}` },
//       });
//     } else {
//       response = await axios.delete(route);
//     }

//     return response;
//   } catch (error) {
//     return { error: error.response.data };
//   }
// }
