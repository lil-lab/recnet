import { db } from "../../../utils/db/init";
import {
  collection,
  addDoc,
  setDoc,
  serverTimestamp,
  doc,
  arrayUnion,
} from "firebase/firestore";

/** [PUT] Update a post by postId.
 * req.body requires:
 * @param title,
 * @param link,
 * @param author,
 * @param description,
 * @param postId,
 */
export default async function updatePostHandler(req, res) {
  try {
    const { postId, ...rest } = req.body;
    const postRef = doc(db, "recommendations", postId);
    await setDoc(
      postRef,
      {
        ...rest,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    res.status(200).json();
  } catch (error) {
    console.error(error.toJSON());
    res.status(500).json(error);
  }
}
