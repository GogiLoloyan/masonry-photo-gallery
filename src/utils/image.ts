/**
 * Gets optimal image size based on container width
 */
export function getOptimalImageSrc(
  src: {
    small: string;
    medium: string;
    large: string;
    original: string;
  },
  containerWidth: number
): string {
  if (containerWidth <= 350) return src.small;
  if (containerWidth <= 650) return src.medium;
  if (containerWidth <= 1280) return src.large;
  return src.original;
}
