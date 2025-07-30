'use client'
import { FileIcon, UploadIcon, CheckIcon, XIcon } from '../Icons'
import Button from '../Button'
import { FileWithPreview } from './types'
import { useState } from 'react'

interface FileUploadSectionProps {
  title: string
  icon: React.ReactNode
  acceptedTypes: string
  maxSize: string
  uploadedFile: FileWithPreview | FileWithPreview[] | null | File
  onTriggerUpload: () => void
  onRemoveFile?: (index: number) => void
  uploadProgress?: { [key: string]: number }
  uploadErrors?: { [key: string]: string }
  multiple?: boolean
  disabled?: boolean
  description?: string
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
  multiple = false,
  disabled = false,
  description
}: FileUploadSectionProps) {
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) {
      setIsDragOver(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    if (!disabled) {
      // Note: Actual file handling would need to be implemented in parent component
      onTriggerUpload()
    }
  }

  const getFileTypeIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    switch (extension) {
      case 'pdf':
        return (
          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
            </svg>
          </div>
        )
      case 'docx':
      case 'doc':
        return (
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
            </svg>
          </div>
        )
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return (
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          </div>
        )
      default:
        return (
          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
            <FileIcon className="w-4 h-4 text-gray-600" />
          </div>
        )
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getUploadStatus = (fileName: string) => {
    if (uploadErrors[fileName]) {
      return 'error'
    }
    if (uploadProgress[fileName] === 100) {
      return 'success'
    }
    if (uploadProgress[fileName] > 0) {
      return 'uploading'
    }
    return 'ready'
  }

  const renderProgressBar = (fileName: string) => {
    const progress = uploadProgress[fileName] || 0
    const status = getUploadStatus(fileName)

    if (status === 'success') {
      return (
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
            <CheckIcon className="w-3 h-3 text-green-600" />
          </div>
          <span className="text-xs text-green-600 font-medium">Uploaded</span>
        </div>
      )
    }

    if (status === 'error') {
      return (
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center">
            <XIcon className="w-3 h-3 text-red-600" />
          </div>
          <span className="text-xs text-red-600 font-medium">Failed</span>
        </div>
      )
    }

    if (status === 'uploading') {
      return (
        <div className="flex items-center gap-2">
          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-blue-600 font-medium">{progress}%</span>
        </div>
      )
    }

    return (
      <span className="text-xs text-gray-500 font-medium">Ready</span>
    )
  }

  const renderFileList = () => {
    if (!uploadedFile) return null

    const files = Array.isArray(uploadedFile) ? uploadedFile : [uploadedFile]

    return (
      <div className="mt-4 space-y-3">
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            {multiple ? 'Selected Files' : 'Selected File'} ({files.length})
          </h4>
          {files.map((file, index) => {
            const fileName = file.name
            const fileSize = file.size
            const status = getUploadStatus(fileName)
            
            return (
              <div
                key={`${fileName}-${index}`}
                className={`flex items-center gap-4 p-4 rounded-lg border transition-all duration-200 ${
                  status === 'success' 
                    ? 'bg-green-50 border-green-200' 
                    : status === 'error'
                    ? 'bg-red-50 border-red-200'
                    : status === 'uploading'
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
              >
                {getFileTypeIcon(fileName)}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {fileName}
                    </p>
                    {onRemoveFile && (
                      <button
                        onClick={() => onRemoveFile(index)}
                        className="ml-2 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                        aria-label="Remove file"
                        disabled={status === 'uploading'}
                      >
                        <XIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {formatFileSize(fileSize)}
                    </span>
                    {renderProgressBar(fileName)}
                  </div>
                  
                  {uploadErrors[fileName] && (
                    <p className="text-xs text-red-600 mt-1">
                      {uploadErrors[fileName]}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <section className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              {icon}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              {description && (
                <p className="text-sm text-gray-600 mt-1">{description}</p>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-700">{acceptedTypes}</p>
            <p className="text-xs text-gray-500">Max {maxSize}</p>
          </div>
        </div>
      </div>

      {/* Upload Area */}
      <div className="p-6">
        <div
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
            disabled
              ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
              : isDragOver
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {disabled && (
            <div className="absolute inset-0 bg-gray-50 bg-opacity-50 flex items-center justify-center rounded-xl">
              <div className="text-center">
                <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 0h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <p className="text-sm text-gray-500 font-medium">Upload disabled</p>
              </div>
            </div>
          )}

          <div className={`space-y-4 ${disabled ? 'opacity-50' : ''}`}>
            <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
              <UploadIcon className="w-8 h-8 text-blue-600" />
            </div>
            
            <div>
              <p className="text-lg font-medium text-gray-900 mb-2">
                {isDragOver ? 'Drop files here' : 'Drag and drop your files here'}
              </p>
              <p className="text-sm text-gray-500 mb-4">
                or click the button below to browse
              </p>
            </div>

            <Button
              variant="outline"
              size="lg"
              onClick={onTriggerUpload}
              disabled={disabled}
              className="transition-all duration-200 hover:scale-105"
            >
              <UploadIcon className="w-4 h-4 mr-2" />
              Choose {multiple ? 'Files' : 'File'}
            </Button>

            <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
              <span>Supported: {acceptedTypes}</span>
              <span>•</span>
              <span>Max size: {maxSize}</span>
            </div>
          </div>
        </div>

        {/* File List */}
        {renderFileList()}

        {/* Upload Tips */}
        {!uploadedFile && !disabled && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm">
                <p className="font-medium text-blue-900 mb-1">Upload Tips:</p>
                <ul className="text-blue-700 space-y-1 list-disc list-inside">
                  <li>Ensure your file is in the correct format ({acceptedTypes})</li>
                  <li>Keep file size under {maxSize} for faster upload</li>
                  <li>Use clear, descriptive file names</li>
                  {multiple && <li>You can select multiple files at once</li>}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}