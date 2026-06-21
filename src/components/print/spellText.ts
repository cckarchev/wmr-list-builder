/**
 * Removes a spell's leading italic flavor line (a single-asterisk-wrapped line
 * like `*The enemy's blows are deflected.*`) plus any blank lines that follow
 * it. Functional rules text is left intact. Spells with no flavor line are
 * returned unchanged.
 */
export function stripSpellFlavor(text: string[]): string[] {
  if (text.length === 0) return text;
  if (!/^\*.+\*$/.test(text[0].trim())) return text;

  let i = 1;
  while (i < text.length && text[i].trim() === '') i++;
  return text.slice(i);
}
