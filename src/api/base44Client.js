import {
  getWithTTL,
  setWithTTL,
  TTL
} from "../lib/utils";

const CACHE_KEY =
  "crust_candidates";

export const base44 =
  async () => {

  const cached =
    getWithTTL(CACHE_KEY);

  if (cached) {
    return cached;
  }

  const response =
    await fetch(
      "https://api.crustdata.com/screener/persondb/search",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json"
        }
      }
    );

  const data =
    await response.json();

  setWithTTL(
    CACHE_KEY,
    data,
    TTL.CANDIDATES
  );

  return data;
};