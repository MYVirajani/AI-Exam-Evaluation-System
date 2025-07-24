'use client'
import { FileUploadSection } from './FileUploadSection'
import { FileWithPreview } from './types'

interface MultiFileUploadSectionProps {
  title: string
  icon: React.ReactNode
  acceptedTypes: string
  maxSize: string
  uploadedFiles: FileWithPreview[]
  onTriggerUpload: () => void
  onRemoveFile: (index: number) => void
  uploadProgress: { [key: string]: number }
  uploadErrors: { [key: string]: string }
}

export function MultiFileUploadSection({
  title,
  icon,
  acceptedTypes,
  maxSize,
  uploadedFiles,
  onTriggerUpload,
  onRemoveFile,
  uploadProgress,
  uploadErrors
}: MultiFileUploadSectionProps) {
  return (
    <FileUploadSection
      title={title}
      icon={icon}
      acceptedTypes={acceptedTypes}
      maxSize={maxSize}
      uploadedFile={uploadedFiles}
      onTriggerUpload={onTriggerUpload}
      onRemoveFile={onRemoveFile}
      uploadProgress={uploadProgress}
      uploadErrors={uploadErrors}
      multiple={true}
    />
  )
}