import ReactLoading from "react-loading";
import { appPrimary } from "@/utils/constants";

export default function Loading() {
  return (
    <ReactLoading
      type={"cylon"}
      color={appPrimary}
      height={"10%"}
      width={"10%"}
    />
  );
}
