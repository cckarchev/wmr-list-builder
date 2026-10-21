import { useLayoutEffect, useRef, useState } from "react";
import { Popover } from "@/components/popover/Popover";
import type { OrderStep } from "@/core/print/sectionOrder";
import type { PrintSectionDef } from "../../sections/printSections";
import styles from "./SectionOrder.module.css";

const TITLE = "Reorder sections";

const UP: OrderStep = -1;
const DOWN: OrderStep = 1;

interface Move {
  id: string;
  step: OrderStep;
}

interface MoveButtonProps {
  section: PrintSectionDef;
  step: OrderStep;
  disabled: boolean;
  onMove: (move: Move) => void;
}

const ARROWS: Record<OrderStep, { glyph: string; direction: string }> = {
  [UP]: { glyph: "↑", direction: "up" },
  [DOWN]: { glyph: "↓", direction: "down" },
};

/** A selector for one row's arrow button, so focus can follow the moved row. */
const arrowSelector = ({ id, step }: Move): string =>
  `[data-id="${id}"][data-step="${step}"]`;

const MoveButton = ({ section, step, disabled, onMove }: MoveButtonProps) => {
  const { glyph, direction } = ARROWS[step];

  return (
    <button
      className={styles.arrow}
      type="button"
      aria-label={`Move ${section.title} ${direction}`}
      disabled={disabled}
      data-id={section.id}
      data-step={step}
      onClick={() => onMove({ id: section.id, step })}
    >
      <span aria-hidden="true">{glyph}</span>
    </button>
  );
};

interface SectionOrderProps {
  /** The sections in their current order. */
  sections: PrintSectionDef[];
  onMove: (id: string, step: OrderStep) => void;
}

/**
 * The "Reorder" popover: each section with arrows to move it up or down the
 * sheet. Arrows rather than dragging, so it works the same with a finger, a
 * mouse or the keyboard.
 */
export const SectionOrder = ({ sections, onMove }: SectionOrderProps) => {
  const listRef = useRef<HTMLOListElement>(null);
  const [lastMove, setLastMove] = useState<Move | null>(null);

  // Reordering the rows moves the pressed button in the DOM, which drops its
  // focus. Put it back, or on the other arrow once the row reaches an end.
  useLayoutEffect(() => {
    const list = listRef.current;

    if (!lastMove || !list) {
      return;
    }

    const opposite: Move = {
      id: lastMove.id,
      step: lastMove.step === UP ? DOWN : UP,
    };
    const pressed = list.querySelector<HTMLButtonElement>(
      arrowSelector(lastMove),
    );
    const fallback = list.querySelector<HTMLButtonElement>(
      arrowSelector(opposite),
    );
    const target = pressed && !pressed.disabled ? pressed : fallback;

    target?.focus();
  }, [lastMove]);

  const move = (next: Move) => {
    onMove(next.id, next.step);
    setLastMove(next);
  };

  const lastIndex = sections.length - 1;

  return (
    <Popover
      label={TITLE}
      heading={TITLE}
      triggerClassName={styles.trigger}
      trigger={
        <>
          <span aria-hidden="true">↑↓</span>
          Reorder
        </>
      }
    >
      <ol className={styles.list} ref={listRef}>
        {sections.map((section, index) => (
          <li className={styles.row} key={section.id}>
            <span className={styles.title}>{section.title}</span>

            <span className={styles.arrows}>
              <MoveButton
                section={section}
                step={UP}
                disabled={index === 0}
                onMove={move}
              />
              <MoveButton
                section={section}
                step={DOWN}
                disabled={index === lastIndex}
                onMove={move}
              />
            </span>
          </li>
        ))}
      </ol>
    </Popover>
  );
};
