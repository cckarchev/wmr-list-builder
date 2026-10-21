const NON_WORD_RUN = /\W+/g;

/** Make a display name safe to embed in a DOM id. */
export const domSlug = (name: string): string =>
  name.replace(NON_WORD_RUN, "-");
