import { isUsernameValid } from "@/utils/validationHelper";
import { db } from "../../../utils/db/firebase-admin";

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
      const snapshot = await db
        .collection("users")
        .where("username", "==", username)
        .get();
      if (!snapshot.empty) {
        res.status(409).json({ usernameError: "Username already exists." });
        return;
      }
    }

    if (name) {
      if (name.length === 0) {
        res.status(409).json({ nameError: "Name cannot be empty." });
        return;
      }
    }

    // set info
    const docRef = db.doc(`users/${userId}`);
    const docSnap = await docRef.get();

    let data = {};
    if (username) data["username"] = username;
    if (affiliation) data["affiliation"] = affiliation;
    if (name) data["displayName"] = name;

    if (docSnap.exists) {
      await docRef.set(data, { merge: true });

      res.status(200).json({ ...data, id: userId });
      return;
    } else {
      res.status(404).json("User does not exist.");
    }
  } catch (error) {
    console.error(error);
    res.status(500).json(error.message);
  }
}
