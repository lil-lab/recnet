import {
  getDateFromServerTimestamp,
  getNextCutoff,
  getLastCutoff,
} from "@/utils/dateHelper";
import { db } from "../../../utils/db/init";
import { getDoc, doc } from "firebase/firestore";

/** [GET] Get user's post in progress for the current cutoff
 * req.query requires:
 * @param userId
 * @returns post if there is an active post; undefined if not
 */
export default async function getPostInProgressByUserHandler(req, res) {
  try {
    const { userId } = req.query;
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { postIds } = docSnap.data();

      // get user's last post
      if (postIds.length === 0) {
        // no posts
        res.status(200).json(undefined);
        return;
      }
      const lastPostId = postIds.slice(-1)[0];
      const postRef = doc(db, "recommendations", lastPostId);
      const postSnap = await getDoc(postRef);

      if (postSnap.exists()) {
        const postData = postSnap.data();
        const { cutoff } = postData;
        const nextCutoffTime = getNextCutoff().getTime();

        if (cutoff.toMillis() === nextCutoffTime) {
          // the last post is for the next cutoff
          res.status(200).json({ id: lastPostId, ...postData });
        } else {
          // no post in progress
          res.status(200).json(undefined);
        }
      } else {
        // post doesn't exist
        res.status(404).json(`Post ${lastPostId} not found`);
      }
    } else {
      // user doesn't exist
      res.status(404).json(`User ${userId} not found`);
    }
  } catch (error) {
    res.status(500).json(error.message);
  }
}
