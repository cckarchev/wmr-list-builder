import {
  WARMASTER_INFO_URL,
  WMR_ARMIES_PDF_URL,
  WMR_COMPENDIUM_PDF_URL,
  WMR_DOWNLOADS_URL,
  WMR_EDITION,
  WMR_OFFICIAL_SITE_URL,
} from '@/data/wmrEdition';
import styles from './About.module.css';
import { ExternalLink } from './ExternalLink';

const WM_SELECTOR_URL = 'https://github.com/dsusco/wm-selector';
const GAME_ICONS_URL = 'https://game-icons.net';
const CC_BY_3_URL = 'https://creativecommons.org/licenses/by/3.0/';
const FONT_AWESOME_URL = 'https://fontawesome.com';
const FONT_AWESOME_LICENSE_URL = 'https://fontawesome.com/license/free';

export const About = () => {
  const { compendiumVersion, armiesVersion } = WMR_EDITION;

  return (
    <main className={styles.page}>
      <h1 className={styles.heading}>About</h1>

      <section className={styles.section}>
        <p>
          A list builder for Warmaster Revolution. Pick an army, add units and upgrades, and the
          points, army size and validation update as you go. Save lists, share them with a link,
          copy them as text or print a reference sheet.
        </p>
      </section>

      <section className={styles.section} aria-labelledby="about-rules">
        <h2 id="about-rules" className={styles.subheading}>
          Warmaster Revolution
        </h2>
        <p>
          The army lists here follow the WMR Compendium {compendiumVersion} and WMR Armies{' '}
          {armiesVersion}, published by the Warmaster Rules Committee.
        </p>
        <ul className={styles.links}>
          <li>
            <ExternalLink href={WMR_OFFICIAL_SITE_URL}>wm-revolution.com</ExternalLink>, the
            official site
          </li>
          <li>
            <ExternalLink href={WMR_COMPENDIUM_PDF_URL}>
              WMR Compendium {compendiumVersion} (PDF)
            </ExternalLink>
          </li>
          <li>
            <ExternalLink href={WMR_ARMIES_PDF_URL}>WMR Armies {armiesVersion} (PDF)</ExternalLink>
          </li>
          <li>
            <ExternalLink href={WMR_DOWNLOADS_URL}>All official downloads</ExternalLink>, for
            changelogs, print versions and newer releases
          </li>
          <li>
            <ExternalLink href={WARMASTER_INFO_URL}>warmaster.info</ExternalLink>, the same rules
            and lists as a website, easier to read online. Fan-made, not associated with the
            Warmaster Rules Committee.
          </li>
        </ul>
      </section>

      <section className={styles.section} aria-labelledby="about-credits">
        <h2 id="about-credits" className={styles.subheading}>
          Credits
        </h2>
        <ul className={styles.links}>
          <li>
            Based on <ExternalLink href={WM_SELECTOR_URL}>dsusco/wm-selector</ExternalLink>, the
            original open-source Warmaster army selector, for its army data and validation logic.
          </li>
          <li>
            Faction emblems from <ExternalLink href={GAME_ICONS_URL}>game-icons.net</ExternalLink>{' '}
            by Lorc, Delapouite and Kier Heyl, licensed under{' '}
            <ExternalLink href={CC_BY_3_URL}>CC BY 3.0</ExternalLink>. The background square was
            removed and some emblems are mirrored.
          </li>
          <li>
            Interface icons from{' '}
            <ExternalLink href={FONT_AWESOME_URL}>Font Awesome Free</ExternalLink>, licensed under{' '}
            <ExternalLink href={FONT_AWESOME_LICENSE_URL}>CC BY 4.0</ExternalLink>.
          </li>
        </ul>
      </section>

      <section className={styles.section} aria-labelledby="about-disclaimer">
        <h2 id="about-disclaimer" className={styles.subheading}>
          Disclaimer
        </h2>
        <p>
          This website is completely unofficial and in no way endorsed by Games Workshop Limited.
          Warmaster and all associated names, races, and army lists are trademarks of Games Workshop
          Limited. No challenge to their status is intended. All such material is used without
          permission for non-commercial, fan use only.
        </p>
      </section>
    </main>
  );
};
