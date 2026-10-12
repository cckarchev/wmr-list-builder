export const toSentence = (items: string[], connector = ', ', lastConnector = ' or '): string => {
  if (items.length > 1) {
    const leading = items.slice(0, -1);
    const last = items[items.length - 1];

    return leading.join(connector) + lastConnector + last;
  }

  return items[0];
};
