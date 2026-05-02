import { useEffect, useState } from "react";
import MississaugaPage from "./pages/MississaugaPage";
import CdmPage from "./pages/CdmPage";
import LouiePage from "./pages/LouiePage";

type Route =
  | { page: "mississauga" }
  | { page: "cdm"; meetingId: string }
  | { page: "louie" };

const parseHash = (hash: string): Route => {
  const trimmed = hash.startsWith("#") ? hash.slice(1) : hash;
  const [path = "/"] = trimmed.split("?");

  if (path.startsWith("/cdm/")) {
    const meetingId = path.slice("/cdm/".length);
    return { page: "cdm", meetingId };
  }
  if (path === "/mississauga" || path.startsWith("/mississauga/")) {
    return { page: "mississauga" };
  }
  if (path === "/louie" || path.startsWith("/louie/")) {
    return { page: "louie" };
  }
  // Default: Louie landing page
  return { page: "louie" };
};

export const navigate = (hash: string) => {
  window.location.hash = hash;
};

const App = () => {
  const [route, setRoute] = useState<Route>(() =>
    parseHash(window.location.hash),
  );

  useEffect(() => {
    const handler = () => {
      window.scrollTo(0, 0);
      setRoute(parseHash(window.location.hash));
    };
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  return (
    <>
      {route.page === "mississauga" && <MississaugaPage />}
      {route.page === "cdm" && <CdmPage meetingId={route.meetingId} />}
      {route.page === "louie" && <LouiePage />}
    </>
  );
};

export default App;
