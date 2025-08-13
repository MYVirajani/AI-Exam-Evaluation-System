// lib/fileConfig.ts
export const FILE_CONFIG = {
  QUESTION_PAPER: {
    types: [".pdf", ".docx"],
    maxSizeMB: 5,
  },
  MODEL_PAPER: {
    types: [".pdf", ".docx"],
    maxSizeMB: 5,
  },
  ANSWER_SCRIPT: {
    types: [".pdf", ".docx", ".png", ".jpg", ".jpeg"],
    maxSizeMB: 5,
  },
  IMAGE: {
    types: [".png", ".jpg", ".jpeg", ".webp"],
    maxSizeMB: 5,
  },
  LECTURE_MATERIAL: {
    types: [".pdf", ".docx", ".pptx", ".xlsx"],
    maxSizeMB: 20,
  },
};


export const getMaxSizeInBytes = (mb: number) => mb * 1024 * 1024;
export const getAcceptedExtensions = (types: string[]) =>
  types.map((ext) => ext.toUpperCase().replace(".", "")).join(", ");

export const getMaxSizeLabel = (mb: number) => `${mb}MB`;