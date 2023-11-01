import { isUsernameValid } from "@/utils/helpers";
import { db } from "../../../utils/db/init";
import {
  doc,
  setDoc,
  query,
  where,
  collection,
  getDocs,
  getDoc,
} from "firebase/firestore";

/** [POST] Update user info for user with userId.
 * req.body requires:
 * @param userId
 * optional:
 * @param username
 * @param affiliation
 * @returns userId, fields that were updated
 */
export default async function setUserInfoHandler(req, res) {
  try {
    const { username, userId, affiliation, name } = req.body;

    if (username) {
      // validate username
      if (!isUsernameValid(username)) {
        res.status(400).json({
          error: {
            usernameError:
              "Username should be between 4 to 15 characters and contain only letters (A-Z, a-z), numbers, and underscores (_).",
          },
        });
        return;
      }
      // check if username is unique
      const q = query(
        collection(db, "users"),
        where("username", "==", username)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        res
          .status(409)
          .json({ error: { usernameError: "Username already exists." } });
        return;
      }
    }

    if (name) {
      if (name.length === 0) {
        res.status(409).json({ error: { nameError: "Name cannot be empty." } });
        return;
      }
    }

    // set info
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);

    let data = {};
    if (username) data["username"] = username;
    if (affiliation) data["affiliation"] = affiliation;
    if (name) data["displayName"] = name;

    if (docSnap.exists()) {
      await setDoc(docRef, data, { merge: true });
      res.status(200).json({ ...data, uid: userId });
      return;
    } else {
      res.status(404).json({ error: "User does not exist." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}
