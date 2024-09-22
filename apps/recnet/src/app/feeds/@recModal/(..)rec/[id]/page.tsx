import { RecPageContent } from "@recnet/recnet-web/app/rec/[id]/RecPageContent";

import { RecModal } from "./RecModal";

export default async function Page({ params }: { params: { id: string } }) {
  const { id } = params;

  return (
    <RecModal>
      <RecPageContent id={id} />
    </RecModal>
  );
}
