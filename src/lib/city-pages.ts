import { CITIES } from "./pseo-data";

export const tarotServices = ["tarot-reading", "private-tarot-reading"] as const;
export const retainedTarotCities: Record<string, (typeof tarotServices)[number]> = {
  "akron-oh": "private-tarot-reading",
  "albany-ny": "tarot-reading",
  "albuquerque-nm": "private-tarot-reading",
  "anchorage-ak": "tarot-reading",
  "ann-arbor-mi": "tarot-reading",
  "aspen": "tarot-reading",
  "atlanta-ga": "tarot-reading",
  "baton-rouge-la": "tarot-reading",
  "birmingham-al": "private-tarot-reading",
  "brooklyn-ny": "tarot-reading",
  "buffalo-ny": "private-tarot-reading",
  "burlington-vt": "tarot-reading",
  "charlotte-nc": "private-tarot-reading",
  "chattanooga-tn": "tarot-reading",
  "cincinnati-oh": "tarot-reading",
  "des-moines-ia": "tarot-reading",
  "detroit-mi": "tarot-reading",
  "el-paso-tx": "tarot-reading",
  "fresno-ca": "private-tarot-reading",
  "grand-rapids-mi": "private-tarot-reading",
  "greenville-sc": "tarot-reading",
  "hartford-ct": "tarot-reading",
  "houston-tx": "tarot-reading",
  "knoxville-tn": "tarot-reading",
  "long-beach-ca": "tarot-reading",
  "madison-wi": "private-tarot-reading",
  "malibu": "private-tarot-reading",
  "memphis-tn": "tarot-reading",
  "minneapolis-mn": "tarot-reading",
  "nashville-tn": "tarot-reading",
  "omaha-ne": "tarot-reading",
  "philadelphia-pa": "tarot-reading",
  "providence-ri": "tarot-reading",
  "richmond-va": "tarot-reading",
  "riverside-ca": "tarot-reading",
  "rochester-ny": "tarot-reading",
  "san-antonio-tx": "tarot-reading",
  "san-diego-ca": "tarot-reading",
  "santa-monica": "tarot-reading",
  "savannah-ga": "tarot-reading",
  "spokane-wa": "tarot-reading",
  "st-louis-mo": "tarot-reading",
  "syracuse-ny": "private-tarot-reading",
  "toledo-oh": "tarot-reading",
  "tucson-az": "tarot-reading",
};

export function getCityReadingPath(city: string): string | null {
  if (!Object.prototype.hasOwnProperty.call(CITIES, city)) return null;
  return Object.prototype.hasOwnProperty.call(retainedTarotCities, city) ? `/readings/${retainedTarotCities[city]}/${city}` : "/readings";
}

export function isRetainedCityPage(service: string, city: string) {
  return Object.prototype.hasOwnProperty.call(retainedTarotCities, city) && retainedTarotCities[city] === service;
}

export function cityRedirects() {
  const entries: Array<{ source: string; destination: string; permanent: true }> = [];
  for (const city of Object.keys(CITIES)) {
    const destination = getCityReadingPath(city)!;
    entries.push({ source: `/${city}`, destination, permanent: true });
    for (const service of tarotServices) {
      const source = `/readings/${service}/${city}`;
      if (source !== destination) entries.push({ source, destination, permanent: true });
    }
  }
  for (const { source, city } of [{ source: "la", city: "los-angeles-ca" }, { source: "sf", city: "san-francisco-ca" }, { source: "nyc", city: "new-york-ny" }]) {
    for (const service of tarotServices) entries.push({ source: `/readings/${service}/${source}`, destination: getCityReadingPath(city)!, permanent: true });
  }
  return entries;
}
