import { fetchLinkParams, parseLink } from "lib/utils/fetch-link-params";

export const paramsLink = async () => {
  const parsed_link = parseLink();
  console.log(parsed_link)
  if (parsed_link.length) {
    const res = await fetchLinkParams(parsed_link)
    return res
  } else {
    return null
  }
};
