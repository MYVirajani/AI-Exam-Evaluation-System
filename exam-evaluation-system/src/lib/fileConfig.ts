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
    types: [".pdf", ".docx"],
    maxSizeMB: 10,
  },
  IMAGE: {
    types: [".png", ".jpg", ".jpeg", ".webp"],
    maxSizeMB: 2,
  },
};

export const getAcceptedExtensions = (types: string[]) => types.join(",");
export const getMaxSizeInBytes = (mb: number) => mb * 1024 * 1024;
