'use client'
import { FileIcon, UploadIcon, CheckIcon, XIcon } from '../Icons'
import Button from '../Button'
import { FileWithPreview } from './types'

interface FileUploadSectionProps {
  title: string
  icon: React.ReactNode
  acceptedTypes: string
  maxSize: string
  uploadedFile: FileWithPreview | FileWithPreview[] | null
  onTriggerUpload: () => void
  onRemoveFile?: (index: number) => void
  uploadProgress?: { [key: string]: number }
  uploadErrors?: { [key: string]: string }
  multiple?: boolean
}

export function FileUploadSection({
  title,
  icon,
  acceptedTypes,
  maxSize,
  uploadedFile,
  onTriggerUpload,
  onRemoveFile,
  uploadProgress = {},
  uploadErrors = {},
  multiple = false
}: FileUploadSectionProps) {
  return (
    <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          {icon}
          {title}
        </h2>
        <span className="text-sm text-gray-500">
          {acceptedTypes} (Max {maxSize})
        </span>
      </div>
      
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <UploadIcon className="w-10 h-10 mx-auto text-gray-400 mb-2" />
        <p className="text-gray-500 mb-2">Drag and drop your files here</p>
        <p className="text-gray-400 text-sm mb-4">or</p>
        <Button
          variant="outline"
          size="sm"
          onClick={onTriggerUpload}
        >
          Browse Files
        </Button>
      </div>

      {uploadedFile && (
        <div className="mt-4 space-y-2">
          {Array.isArray(uploadedFile) ? (
            uploadedFile.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200"
              >
                <div className="flex items-center gap-3">
                  <FileIcon className="w-4 h-4 text-blue-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {uploadProgress[file.name] === 100 ? (
                    <CheckIcon className="w-4 h-4 text-green-500" />
                  ) : uploadErrors[file.name] ? (
                    <span className="text-xs text-red-500">Error</span>
                  ) : (
                    <div className="h-2 w-12 bg-gray-200 rounded-full">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${uploadProgress[file.name] || 0}%` }}
                      />
                    </div>
                  )}
                  {onRemoveFile && (
                    <button
                      onClick={() => onRemoveFile(index)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      aria-label="Remove file"
                    >
                      <XIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="mt-4 flex items-center gap-2 text-sm text-green-600">
              <CheckIcon className="w-4 h-4" />
              <span>{uploadedFile.name}</span>
            </div>
          )}
        </div>
      )}
    </section>
  )
}