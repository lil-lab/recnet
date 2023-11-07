import { db } from "../../../utils/db/init";
import {
  collection,
  addDoc,
  setDoc,
  serverTimestamp,
  doc,
  arrayUnion,
} from "firebase/firestore";
import { getNextCutoff } from "@/utils/dateHelper";

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
export default async function postEntryHandler(req, res) {
  try {
    // post to recommendations
    const { id } = await addDoc(collection(db, "recommendations"), {
      ...req.body,
      createdAt: serverTimestamp(),
      cutoff: getNextCutoff(),
    });

    // update user
    const { userId } = req.body;
    const userRef = doc(db, "users", userId);

    await setDoc(
      userRef,
      {
        postIds: arrayUnion(id),
      },
      { merge: true }
    );

    res.status(200).json({ id });
  } catch (error) {
    console.error(error);
    res.status(500).json(error.message);
  }
}
