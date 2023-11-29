import { auth } from "./firebase-admin";

export function withAuth(handler) {
  return async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json("Not authenticated"); // missing auth header
    }

    const token = authHeader.split(" ")[1];
    let decodedToken;
    try {
      decodedToken = await auth.verifyIdToken(token);
      if (!decodedToken || !decodedToken.uid)
        return res.status(401).json("Not authenticated");
      req.uid = decodedToken.uid;
    } catch (error) {
      console.log(error);
      return res.status(500).json("Internal Server Error");
    }

    return handler(req, res);
  };
}
