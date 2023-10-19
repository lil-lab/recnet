import { db } from "../../../utils/db/init";
import { getDoc, doc } from "firebase/firestore";

/** [GET] Get user's last post
 * req.query requires:
 * @param userId
 */
export default async function getUserLastPostInfoHandler(req, res) {
  try {
    const { userId } = req.query;
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { lastPostId, lastPosted } = docSnap.data();
      res.status(200).json({ lastPostId, lastPosted });
    } else {
      // docSnap.data() will be undefined in this case
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json(error.message);
  }
}
