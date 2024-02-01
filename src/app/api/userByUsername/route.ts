import { type NextRequest } from "next/server";
import { db } from "@/firebase/admin";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const username = searchParams.get("username");
    const querySnapshot = await db
      .collection("users")
      .where("username", "==", username)
      .limit(1)
      .get();
    if (querySnapshot.empty) {
      null;
    }
    return Response.json(querySnapshot.docs[0].data());
  } catch (error) {
    return Response.json(null, {
      status: 500,
    });
  }
}
