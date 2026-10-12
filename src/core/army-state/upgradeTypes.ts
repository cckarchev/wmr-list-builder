/** Monstrous, Chariot and Special mounts all share the `Mount` suffix. */
const MOUNT_SUFFIX = ' Mount';

export const isMountType = (type: string): boolean => type.endsWith(MOUNT_SUFFIX);
