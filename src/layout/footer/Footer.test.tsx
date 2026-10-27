import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { WMR_EDITION } from "@/data/wmrEdition";
import { renderWithProviders } from "@/test/renderWithProviders";
import { Footer } from "./Footer";

describe("Footer", () => {
  it("names the rules edition the army lists follow", () => {
    renderWithProviders(<Footer />);

    const footer = screen.getByRole("contentinfo");

    expect(footer).toHaveTextContent(
      `Compendium ${WMR_EDITION.compendiumVersion}`,
    );
    expect(footer).toHaveTextContent(`Armies ${WMR_EDITION.armiesVersion}`);
  });

  it("links to the About page", () => {
    renderWithProviders(<Footer />);

    expect(screen.getByRole("link", { name: "About" })).toHaveAttribute(
      "href",
      "/about",
    );
  });

  it("says the tool is unofficial", () => {
    renderWithProviders(<Footer />);

    expect(screen.getByRole("contentinfo")).toHaveTextContent(
      "not endorsed by Games Workshop",
    );
  });

  it("is left off the printed page", () => {
    renderWithProviders(<Footer />);

    expect(screen.getByRole("contentinfo")).toHaveClass("no-print");
  });
});
