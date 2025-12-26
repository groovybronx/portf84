/**
 * Extensions de fichiers supportées par l'application
 * 
 * Centralisation des formats d'images pris en charge pour faciliter
 * l'ajout de nouveaux formats à l'avenir.
 */

/**
 * Extensions d'images supportées (sans le point)
 */
export const SUPPORTED_IMAGE_EXTENSIONS = [
  "png",
  "jpg",
  "jpeg",
  "gif",
  "webp",
  "svg",
  "bmp",
  "ico",
  "tiff",
  "tif",
] as const;

/**
 * Type pour une extension valide
 */
export type ImageExtension = typeof SUPPORTED_IMAGE_EXTENSIONS[number];

/**
 * Génère un regex pour valider les extensions d'images
 * 
 * @returns RegExp pour matcher les fichiers images
 * 
 * @example
 * ```ts
 * const isImage = getImageExtensionRegex().test("photo.jpg"); // true
 * ```
 */
export function getImageExtensionRegex(): RegExp {
  const extensionsPattern = SUPPORTED_IMAGE_EXTENSIONS.join("|");
  return new RegExp(`\\.(${extensionsPattern})$`, "i");
}

/**
 * Vérifie si un fichier est une image supportée
 * 
 * @param filename - Nom du fichier à vérifier
 * @returns true si l'extension est supportée
 * 
 * @example
 * ```ts
 * isImageFile("photo.jpg"); // true
 * isImageFile("document.pdf"); // false
 * ```
 */
export function isImageFile(filename: string): boolean {
  return getImageExtensionRegex().test(filename);
}

/**
 * Formats MIME correspondants
 */
export const IMAGE_MIME_TYPES = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  svg: "image/svg+xml",
  bmp: "image/bmp",
  ico: "image/x-icon",
  tiff: "image/tiff",
  tif: "image/tiff",
} as const;
