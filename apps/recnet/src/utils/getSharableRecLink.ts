import { Rec } from "@recnet/recnet-api-model";

import { clientEnv } from "../clientEnv";

export function getSharableLink(rec: Rec) {
  return `${clientEnv.NEXT_PUBLIC_BASE_URL}/rec/${rec.id}`;
}
