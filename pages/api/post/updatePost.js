import { db } from "../../../utils/db/firebase-admin";
import { Firestore } from "firebase-admin/firestore";
import { withAuth } from "@/utils/db/middleware";

/** [PUT] Update a post by postId.
 * req.body requires:
 * @param title,
 * @param link,
 * @param author,
 * @param description,
 * @param postId,
 */
async function updatePostHandler(req, res) {
  try {
    const { postId, ...rest } = req.body;
    const postRef = db.doc(`recommendations/${postId}`);
    await postRef.set(
      {
        ...rest,
        updatedAt: Firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    res.status(200).json();
  } catch (error) {
    console.error(error);
    res.status(500).json(error.message);
  }
}

export default withAuth(updatePostHandler);
