/**
 * Extensions de fichiers supportées par l'application
 * 
 * Centralisation des formats d'images pris en charge pour faciliter
 * l'ajout de nouveaux formats à l'avenir.
 */

/**
 * Extensions RAW des appareils photo professionnels
 */
export const RAW_IMAGE_EXTENSIONS = [
  // Canon
  "cr2", "cr3", "crw",
  // Nikon
  "nef", "nrw",
  // Sony
  "arw", "srf", "sr2",
  // Fuji
  "raf",
  // Olympus
  "orf",
  // Panasonic
  "rw2",
  // Pentax
  "pef", "ptx",
  // Leica
  "rwl", "rwz",
  // Adobe / Universal
  "dng",
  // TIFF formats (moved to RAW to enable EXIF metadata)
  "tiff", "tif",
  // Autres formats professionnels
  "raw", "3fr", "ari", "bay", "cap", "iiq", "eip", "erf", 
  "fff", "mef", "mdc", "mos", "mrw", "pxn", "r3d", "x3f",
] as const;

/**
 * Extensions d'images standards supportées (sans le point)
 */
export const STANDARD_IMAGE_EXTENSIONS = [
  "png",
  "jpg",
  "jpeg",
  "gif",
  "webp",
  "svg",
  "bmp",
  "ico",
] as const;

/**
 * Toutes les extensions d'images supportées (standards + RAW)
 */
export const SUPPORTED_IMAGE_EXTENSIONS = [
  ...STANDARD_IMAGE_EXTENSIONS,
  ...RAW_IMAGE_EXTENSIONS,
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
 * Vérifie si un fichier est une image RAW
 * 
 * @param filename - Nom du fichier à vérifier
 * @returns true si c'est un fichier RAW
 * 
 * @example
 * ```ts
 * isRawFile("photo.cr2"); // true
 * isRawFile("photo.jpg"); // false
 * ```
 */
export function isRawFile(filename: string): boolean {
  const ext = filename.split('.').pop()?.toLowerCase();
  return ext ? RAW_IMAGE_EXTENSIONS.includes(ext as any) : false;
}

/**
 * Formats MIME pour images standards
 */
export const STANDARD_MIME_TYPES = {
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

/**
 * Formats MIME pour images RAW
 */
export const RAW_MIME_TYPES = {
  // Canon
  cr2: "image/x-canon-cr2",
  cr3: "image/x-canon-cr3",
  crw: "image/x-canon-crw",
  // Nikon
  nef: "image/x-nikon-nef",
  nrw: "image/x-nikon-nrw",
  // Sony
  arw: "image/x-sony-arw",
  srf: "image/x-sony-srf",
  sr2: "image/x-sony-sr2",
  // Fuji
  raf: "image/x-fuji-raf",
  // Olympus
  orf: "image/x-olympus-orf",
  // Panasonic
  rw2: "image/x-panasonic-rw2",
  // Pentax
  pef: "image/x-pentax-pef",
  ptx: "image/x-pentax-ptx",
  // Leica
  rwl: "image/x-leica-rwl",
  rwz: "image/x-leica-rwz",
  // Adobe / Universal
  dng: "image/x-adobe-dng",
  // Autres
  raw: "image/x-raw",
  "3fr": "image/x-hasselblad-3fr",
  ari: "image/x-arri-ari",
  bay: "image/x-casio-bay",
  cap: "image/x-phase-one-cap",
  iiq: "image/x-phase-one-iiq",
  eip: "image/x-phase-one-eip",
  erf: "image/x-epson-erf",
  fff: "image/x-hasselblad-fff",
  mef: "image/x-mamiya-mef",
  mdc: "image/x-minolta-mdc",
  mos: "image/x-leaf-mos",
  mrw: "image/x-minolta-mrw",
  pxn: "image/x-logitech-pxn",
  r3d: "image/x-red-r3d",
  x3f: "image/x-sigma-x3f",
} as const;

/**
 * Tous les formats MIME supportés (standards + RAW)
 */
export const IMAGE_MIME_TYPES = {
  ...STANDARD_MIME_TYPES,
  ...RAW_MIME_TYPES,
} as const;
