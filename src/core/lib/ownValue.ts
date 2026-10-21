/**
 * The value a plain-object record holds under `key`, or undefined when the key
 * is not its own. A bare `record[key]` would also return what the record
 * inherits, such as `Object` for "constructor", whenever the key comes from
 * outside (a URL, a saved list name) rather than from the record itself.
 */
export const ownValue = <V>(
  record: Readonly<Record<string, V>>,
  key: string,
): V | undefined => {
  if (!Object.hasOwn(record, key)) {
    return undefined;
  }

  return record[key];
};
