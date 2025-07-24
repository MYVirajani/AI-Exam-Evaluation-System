 'use client'
import { useSearchParams } from 'next/navigation'
import { useState, useRef } from 'react'
import { FileIcon, BotIcon } from '@/components/Icons'
import Button from '@/components/Button'
import Dropdown from '@/components/Dropdown'
import { FileUploadSection  } from '@/components/Upload/FileUploadSection'
import { MultiFileUploadSection } from '@/components/Upload/MultiFileUploadSection'

export default function UploadPage() {
  const searchParams = useSearchParams()
  const moduleId = searchParams.get('moduleId')
  
  // State for tracking uploaded files
  const [uploadedFiles, setUploadedFiles] = useState({
    examPaper: null as File | null,
    answerScripts: [] as File[],
    modelAnswer: null as File | null,
    markingScheme: null as File | null
  })

  // Refs for hidden file inputs
  const examPaperInputRef = useRef<HTMLInputElement>(null)
  const answerScriptsInputRef = useRef<HTMLInputElement>(null)
  const modelAnswerInputRef = useRef<HTMLInputElement>(null)
  const markingSchemeInputRef = useRef<HTMLInputElement>(null)

  // Upload progress state
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  const [uploadErrors, setUploadErrors] = useState<{ [key: string]: string }>({})
  const [selectedModel, setSelectedModel] = useState('ChatGPT')
  const models = ['ChatGPT', 'Deepseek', 'Gemini', 'Llama']

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: keyof typeof uploadedFiles
  ) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    if (type === 'answerScripts') {
      const newFiles = Array.from(files).filter(
        (file) => file.type === 'application/pdf' || file.name.endsWith('.pdf')
      )

      setUploadedFiles((prev) => ({
        ...prev,
        [type]: [...prev.answerScripts, ...newFiles],
      }))

      for (const file of newFiles) {
        await uploadFile(file, type)
      }
    } else {
      const file = files[0]
      setUploadedFiles((prev) => ({ ...prev, [type]: file }))
      await uploadFile(file, type)
    }

    e.target.value = ''
  }

  const uploadFile = async (file: File, type: string) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)
    if (moduleId) formData.append('moduleId', moduleId)

    try {
      setUploadProgress((prev) => ({ ...prev, [file.name]: 0 }))
      setUploadErrors((prev) => ({ ...prev, [file.name]: '' }))

      const response = await fetch('/api/educator/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`)
      }

      console.log(`${file.name} uploaded successfully`)
      setUploadProgress((prev) => ({ ...prev, [file.name]: 100 }))
    } catch (error) {
      console.error(`Error uploading ${file.name}:`, error)
      setUploadErrors((prev) => ({
        ...prev,
        [file.name]: error instanceof Error ? error.message : 'Upload failed',
      }))
      
      if (type === 'answerScripts') {
        setUploadedFiles((prev) => ({
          ...prev,
          answerScripts: prev.answerScripts.filter((f) => f.name !== file.name),
        }))
      } else {
        setUploadedFiles((prev) => ({ ...prev, [type]: null }))
      }
    }
  }

  const triggerFileInput = (ref: React.RefObject<HTMLInputElement>) => {
    ref.current?.click()
  }

  const removeAnswerScript = (index: number) => {
    setUploadedFiles((prev) => {
      const updatedScripts = [...prev.answerScripts]
      updatedScripts.splice(index, 1)
      return { ...prev, answerScripts: updatedScripts }
    })
  }

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Exam Paper Evaluation {moduleId ? `- ${moduleId}` : ''}
        </h1>

        {/* Hidden file inputs */}
        <input
          type="file"
          ref={examPaperInputRef}
          onChange={(e) => handleFileChange(e, 'examPaper')}
          accept=".pdf,.docx"
          className="hidden"
        />
        <input
          type="file"
          ref={answerScriptsInputRef}
          onChange={(e) => handleFileChange(e, 'answerScripts')}
          accept=".pdf"
          multiple
          className="hidden"
        />
        <input
          type="file"
          ref={modelAnswerInputRef}
          onChange={(e) => handleFileChange(e, 'modelAnswer')}
          accept=".pdf,.docx"
          className="hidden"
        />
        <input
          type="file"
          ref={markingSchemeInputRef}
          onChange={(e) => handleFileChange(e, 'markingScheme')}
          accept=".pdf,.xlsx"
          className="hidden"
        />

        {/* Upload Sections */}
        <div className="space-y-8">
          <FileUploadSection
            title="Exam Paper"
            icon={<FileIcon className="w-5 h-5 text-blue-600" />}
            acceptedTypes="PDF, DOCX"
            maxSize="10MB"
            uploadedFile={uploadedFiles.examPaper}
            onTriggerUpload={() => triggerFileInput(examPaperInputRef)}
          />

          <MultiFileUploadSection
            title="Student Answer Scripts"
            icon={<FileIcon className="w-5 h-5 text-blue-600" />}
            acceptedTypes="PDF"
            maxSize="50MB each"
            uploadedFiles={uploadedFiles.answerScripts}
            onTriggerUpload={() => triggerFileInput(answerScriptsInputRef)}
            onRemoveFile={removeAnswerScript}
            uploadProgress={uploadProgress}
            uploadErrors={uploadErrors}
          />

          <FileUploadSection
            title="Model Answer Sheet"
            icon={<FileIcon className="w-5 h-5 text-blue-600" />}
            acceptedTypes="PDF, DOCX"
            maxSize="5MB"
            uploadedFile={uploadedFiles.modelAnswer}
            onTriggerUpload={() => triggerFileInput(modelAnswerInputRef)}
          />

          {/* Start Evaluation Button */}
          <div className="flex flex-col sm:flex-row justify-end items-end sm:items-center gap-4 mt-8">
            <div className="w-full sm:w-48">
              <label
                htmlFor="model-select"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Evaluation Model
              </label>
              <Dropdown
                options={models}
                selectedOption={selectedModel}
                onSelect={setSelectedModel}
                direction="top"
                className="w-full sm:w-48"
              />
            </div>

            <Button
              variant="primary"
              size="lg"
              className="flex items-center gap-2 w-full sm:w-auto mt-4 sm:mt-0"
              disabled={
                !uploadedFiles.examPaper ||
                uploadedFiles.answerScripts.length === 0
              }
              onClick={() => {
                console.log(`Starting evaluation with model: ${selectedModel}`)
              }}
            >
              <BotIcon className="w-5 h-5" />
              Start Evaluation
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}