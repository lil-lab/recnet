import { type NextRequest } from "next/server";

import { db } from "@recnet/recnet-web/firebase/admin";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const recId = searchParams.get("id");
    if (!recId) {
      return Response.json(null, {
        status: 404,
      });
    }
    const recRef = db.doc(`recommendations/${recId}`);
    const recSnap = await recRef.get();
    if (recSnap.exists) {
      const postData = recSnap.data();
      return Response.json({
        ...postData,
        id: recId,
      });
    } else {
      return Response.json(null, {
        status: 404,
      });
    }
  } catch (error) {
    return Response.json(null, {
      status: 500,
    });
  }
}
