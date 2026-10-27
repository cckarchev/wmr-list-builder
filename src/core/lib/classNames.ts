type ClassName = string | undefined | false;

/** Joins CSS class names, skipping the empty and conditional ones. */
export const classNames = (...names: ClassName[]): string => {
  const present = names.filter((name): name is string => Boolean(name));

  return present.join(" ");
};
