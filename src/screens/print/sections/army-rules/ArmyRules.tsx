import { Markdown } from "@/components/Markdown";
import { useArmyStore } from "@/store/useArmyStore";
import { PrintHeading, PrintSection } from "../print-section/PrintSection";
import styles from "./ArmyRules.module.css";

export const ArmyRules = () => {
  const army = useArmyStore((s) => s.army);

  if (!army?.armyRules) {
    return null;
  }

  return (
    <PrintSection>
      <PrintHeading>Army Rules</PrintHeading>
      <div className={styles.content}>
        <Markdown blocks={army.armyRules} />
      </div>
    </PrintSection>
  );
};
