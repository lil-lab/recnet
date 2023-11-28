import { db } from "../../../utils/db/firebase-admin";
import { Firestore } from "firebase-admin/firestore";
import { getNextCutoff } from "@/utils/dateHelper";
import { withAuth } from "@/utils/db/middleware";

/** [POST] Post an entry and update user.
 * req.body requires:
 * @param title,
 * @param link,
 * @param author,
 * @param description,
 * @param email,
 * @param year,
 * @param month,
 * @param userId
 */
async function postEntryHandler(req, res) {
  try {
    // post to recommendations
    const { id } = await db.collection("recommendations").add({
      ...req.body,
      createdAt: Firestore.FieldValue.serverTimestamp(),
      cutoff: getNextCutoff(),
    });

    // update user
    const { userId } = req.body;
    const userRef = db.doc(`users/${userId}`);

    await userRef.set(
      {
        postIds: Firestore.FieldValue.arrayUnion(id),
      },
      { merge: true }
    );

    res.status(200).json({ id });
  } catch (error) {
    console.error(error);
    res.status(500).json(error.message);
  }
}

export default withAuth(postEntryHandler);
