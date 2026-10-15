import { isRetainedCityPage } from "@/lib/city-pages";
import { CITIES } from "@/lib/pseo-data";

export function getCityContent(service: string, city: string) {
  if (!isRetainedCityPage(service, city)) return null;
  return {
    paragraph: `Joining from ${CITIES[city].city}? Kali’s private readings take place online and offer room for your questions, conversation and spiritual reflection. Her background includes creative writing and psychology. View the current readings page for session options, prices and availability. If you’re interested in a particular reading approach, ask before booking.`,
    faq: [
      { question: `Can I join a reading online from ${CITIES[city].city}?`, answer: "Private readings take place online. Visit the readings page to see available session times." },
      { question: "What are the current session prices?", answer: "A 60-minute private reading is $250. A 90-minute private reading is $450. Choose your session and available time before payment." },
      { question: "Are in-person sessions available in this city?", answer: "This page describes online availability. It does not advertise a local office or in-person appointments. Confirmed gatherings will be announced separately." },
    ],
  };
}
