import { InfiniteData } from "@tanstack/react-query";

/*
 * This function is used to extract data from an infinite query.
 * It takes the infiniteData and a dataMapper function as arguments.
 * The dataMapper function is used to map the page data to the desired data.
 */
export function getDataFromInfiniteQuery<TPageData, TData>(
  infiniteData: InfiniteData<TPageData>,
  dataMapper: (pageData: TPageData) => TData[]
) {
  return infiniteData.pages.reduce((acc, page) => {
    const nextBatch = dataMapper(page);
    return [...acc, ...nextBatch];
  }, [] as TData[]);
}
