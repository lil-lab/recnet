import { RecNetLink } from "@recnet/recnet-web/components/Link";

import { getCutOffFromStartDate } from "@recnet/recnet-date-fns";

interface CutoffDatePickerProps {
  currentSelectedCutoff: Date;
}

export function CutoffDatePicker(props: CutoffDatePickerProps) {
  const { currentSelectedCutoff } = props;
  const cutoffs = getCutOffFromStartDate();

  return (
    <div className="flex flex-col py-1 px-2 gap-y-2">
      {cutoffs.map((d, idx) => {
        const year = d.getFullYear();
        const month = d.getMonth() + 1;
        const day = d.getDate();
        const key = `${month}/${day}/${year}`;
        return (
          <RecNetLink
            href={`/feeds?date=${key}`}
            key={idx}
            radixLinkProps={{
              size: "1",
              weight:
                currentSelectedCutoff.getTime() === d.getTime()
                  ? "bold"
                  : "regular",
            }}
          >
            {key}
          </RecNetLink>
        );
      })}
    </div>
  );
}
