import { db } from "../../../utils/db/init";
import { collection, query, where, getDocs, or, and } from "firebase/firestore";

/**
 * Capitalizes first letter of every word in the given string.
 */
const capitalize = (s) => {
  const words = s.split(" ");

  return words
    .map((word) => {
      return word[0].toUpperCase() + word.substring(1);
    })
    .join(" ");
};

/** [GET] Get user(s) by username or name
 * req.query requires:
 * @param q user username or name
 * @returns users
 */
export default async function searchHandler(req, res) {
  try {
    let { q } = req.query;
    q = q.trim().replace(/ +(?= )/g, ""); // remove extra space

    // serach by email
    // const emailQuery = query(
    //   collection(db, "users"),
    //   where("email", ">=", q),
    //   where("email", "<=", q + "\uf8ff")
    // );
    // const emailQuerySnapshot = await getDocs(emailQuery);

    //search by username
    const usernameQuery = query(
      collection(db, "users"),
      where("username", ">=", q),
      where("username", "<=", q + "\uf8ff")
    );
    const usernameQuerySnapshot = await getDocs(usernameQuery);

    // search by name
    const nameQuery = query(
      collection(db, "users"),
      or(
        and(
          where("displayName", ">=", q),
          where("displayName", "<=", q + "\uf8ff")
        ),
        and(
          where("displayName", ">=", capitalize(q)),
          where("displayName", "<=", capitalize(q) + "\uf8ff")
        )
      )
    );
    const nameQuerySnapshot = await getDocs(nameQuery);

    // combine results and remove duplicates
    let allResults = usernameQuerySnapshot.docs
      .map((doc) => {
        return { ...doc.data(), id: doc.id };
      })
      .concat(
        nameQuerySnapshot.docs.map((doc) => {
          return { ...doc.data(), id: doc.id };
        })
      );

    allResults = allResults.filter((user, index) => {
      const _id = user.id;
      return (
        user.username && // registered user (with username)
        !user.test && // filter out test accounts
        index === allResults.map((u) => u.id).findIndex((uid) => uid === _id)
      );
    });

    res.status(200).json(allResults);
  } catch (error) {
    console.error(error);
    res.status(500).json(error.message);
  }
}
