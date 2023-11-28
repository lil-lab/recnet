import { withAuth } from "@/utils/db/middleware";
import { db } from "../../../utils/db/firebase-admin";
import { Firestore } from "firebase-admin/firestore";

/** [DELETE] Delete a post by id.
 * @param postId
 * @return deleted postId, userId
 */
async function deletePostHandler(req, res) {
  try {
    const { postId } = req.query;
    const docRef = db.doc(`recommendations/${postId}`);
    const docSnap = await docRef.get();
    if (docSnap.exists) {
      // delete from user postIds
      const { userId } = docSnap.data();
      const userRef = db.doc(`users/${userId}`);

      await userRef.set(
        {
          postIds: Firestore.FieldValue.arrayRemove(postId),
        },
        { merge: true }
      );

      // delete post
      await docRef.delete();

      res.status(200).json({ postId, userId });
    } else {
      // post doens't exist
      res.status(404).json(`Post ${postId} not found`);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json(error.message);
  }
}

export default withAuth(deletePostHandler);
