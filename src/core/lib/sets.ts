/** A copy of `set` with `value` added if missing, or removed if present. */
export const toggleMember = <T>(set: ReadonlySet<T>, value: T): Set<T> => {
  const next = new Set(set);

  if (next.has(value)) {
    next.delete(value);
  } else {
    next.add(value);
  }

  return next;
};

/** A copy of `set` without `value`, or `set` itself when it is not there. */
export const withoutMember = <T>(set: Set<T>, value: T): Set<T> => {
  if (!set.has(value)) {
    return set;
  }

  const next = new Set(set);

  next.delete(value);

  return next;
};
