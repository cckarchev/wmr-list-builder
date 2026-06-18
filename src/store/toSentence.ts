export function toSentence(items: string[], connector = ', ', lastConnector = ' or '): string {
  if (items.length > 1) {
    return items.slice(0, -1).join(connector) + lastConnector + items.slice(-1);
  }
  return items[0];
}
