export type ArtifactStructureType = 'C_SINGLE_FILE' | 'JAVA_MULTI_QUESTION' | 'UNKNOWN';

export interface ArtifactStagingResult {
  /** Absolute path of the cleaned workspace directory ready to be mounted into the sandbox. */
  stagedPath: string;
  structureType: ArtifactStructureType;
  /** Relative paths (from stagedPath) of the detected entry files/folders, e.g. ['main.c'] or ['Q1', 'Q2']. */
  detectedEntries: string[];
  /** Number of junk entries (__MACOSX, .DS_Store, Thumbs.db, ._*) skipped during extraction. */
  junkEntriesRemoved: number;
}

/**
 * Contract for turning a raw uploaded `.zip` artifact into a clean, validated
 * workspace directory. Implemented by `zip-extractor.service.ts` (TV3).
 */
export interface IArtifactExtractor {
  extractAndStage(zipFilePath: string, submissionId: string): Promise<ArtifactStagingResult>;
}
