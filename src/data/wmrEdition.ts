/**
 * The Warmaster Revolution edition the army data follows, and where to read
 * it. Bump the versions here when the army JSONs move to a new release.
 */
export const WMR_EDITION = {
  compendiumVersion: "2.1.0",
  armiesVersion: "2.26",
} as const;

/** The Warmaster Rules Committee's site, the official home of the rules. */
export const WMR_OFFICIAL_SITE_URL = "https://www.wm-revolution.com/";

/** The official download page, the stable place to find the current PDFs. */
export const WMR_DOWNLOADS_URL =
  "https://www.wm-revolution.com/articles/download.html";

/** The current rules compendium PDF, as linked from the download page. */
export const WMR_COMPENDIUM_PDF_URL =
  "https://drive.google.com/file/d/1E2YTPKjGeF871Bj7aGaSF1uIlV2domk6/view";

/** The current army lists PDF, as linked from the download page. */
export const WMR_ARMIES_PDF_URL =
  "https://drive.google.com/file/d/1jS81OufTxnx-W850E66LboTVSGQEokoN/view";

/** A fan-made web edition of the same rules and lists, easier to read online. */
export const WARMASTER_INFO_URL = "https://warmaster.info/";
