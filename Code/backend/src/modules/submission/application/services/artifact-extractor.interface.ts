export type ArtifactStructureType =
  | 'C_SINGLE_FILE'
  | 'JAVA_MULTI_QUESTION'
  | 'UNKNOWN';

export interface ArtifactStagingResult {
  stagedPath: string;
  structureType: ArtifactStructureType;
  detectedEntries: string[];
  junkEntriesRemoved: number;
}

export interface IArtifactExtractor {
  extractAndStage(
    zipFilePath: string,
    submissionId: string,
    maxExtractedBytes: bigint | number
  ): Promise<ArtifactStagingResult>;
}
