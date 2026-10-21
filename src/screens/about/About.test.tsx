import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  WARMASTER_INFO_URL,
  WMR_ARMIES_PDF_URL,
  WMR_COMPENDIUM_PDF_URL,
  WMR_DOWNLOADS_URL,
  WMR_EDITION,
  WMR_OFFICIAL_SITE_URL,
} from "@/data/wmrEdition";
import { renderWithProviders } from "@/test/renderWithProviders";
import { About } from "./About";

const linkTo = (name: string | RegExp) => screen.getByRole("link", { name });

describe("About sources", () => {
  it("names the rules edition the army lists follow", () => {
    renderWithProviders(<About />);

    expect(screen.getByRole("main")).toHaveTextContent(
      `WMR Compendium ${WMR_EDITION.compendiumVersion} and WMR Armies ${WMR_EDITION.armiesVersion}`,
    );
  });

  it("links to the official site, the current PDFs and the downloads page", () => {
    renderWithProviders(<About />);

    expect(linkTo("wm-revolution.com")).toHaveAttribute(
      "href",
      WMR_OFFICIAL_SITE_URL,
    );
    expect(linkTo(/^WMR Compendium/)).toHaveAttribute(
      "href",
      WMR_COMPENDIUM_PDF_URL,
    );
    expect(linkTo(/^WMR Armies/)).toHaveAttribute("href", WMR_ARMIES_PDF_URL);
    expect(linkTo("All official downloads")).toHaveAttribute(
      "href",
      WMR_DOWNLOADS_URL,
    );
  });

  it("links to warmaster.info", () => {
    renderWithProviders(<About />);

    expect(linkTo("warmaster.info")).toHaveAttribute(
      "href",
      WARMASTER_INFO_URL,
    );
  });

  it("opens every link in a new tab", () => {
    renderWithProviders(<About />);

    for (const link of screen.getAllByRole("link")) {
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noreferrer");
      expect(link).toHaveAccessibleDescription("Opens in a new tab");
    }
  });
});

describe("About credits", () => {
  it("credits the icon authors and their licenses", () => {
    renderWithProviders(<About />);

    expect(linkTo("game-icons.net")).toBeInTheDocument();
    expect(linkTo("CC BY 3.0")).toBeInTheDocument();
    expect(linkTo("Font Awesome Free")).toBeInTheDocument();
    expect(linkTo("CC BY 4.0")).toBeInTheDocument();
    expect(screen.getByRole("main")).toHaveTextContent(
      "Lorc, Delapouite and Kier Heyl",
    );
  });

  it("says how the faction emblems were changed from the originals", () => {
    renderWithProviders(<About />);

    expect(screen.getByRole("main")).toHaveTextContent(
      "The background square was removed and some emblems are mirrored.",
    );
  });

  it("carries the Games Workshop disclaimer", () => {
    renderWithProviders(<About />);

    expect(
      screen.getByRole("heading", { name: "Disclaimer" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("main")).toHaveTextContent(
      "in no way endorsed by Games Workshop",
    );
  });
});
