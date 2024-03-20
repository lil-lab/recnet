import { type NextRequest } from "next/server";

import { db } from "@recnet/recnet-web/firebase/admin";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get("email");
    const querySnapshot = await db
      .collection("users")
      .where("email", "==", email)
      .limit(1)
      .get();
    if (querySnapshot.empty) {
      return Response.json(null, {
        status: 404,
      });
    }
    return Response.json({
      ...querySnapshot.docs[0].data(),
      id: querySnapshot.docs[0].id,
    });
  } catch (error) {
    return Response.json(null, {
      status: 500,
    });
  }
}
