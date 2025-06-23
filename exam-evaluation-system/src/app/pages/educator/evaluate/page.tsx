'use client'
import { useSearchParams } from 'next/navigation'
import { useState, useRef } from 'react'
import { UploadIcon, FileIcon, CheckIcon, BotIcon } from '@/components/Icons'
import Button from '@/components/Button'

export default function UploadPage() {
  const searchParams = useSearchParams()
  const courseId = searchParams.get('courseId')
  
  // State for tracking uploaded files
  const [uploadedFiles, setUploadedFiles] = useState({
    examPaper: null as File | null,
    answerScripts: null as File | null,
    modelAnswer: null as File | null,
    markingScheme: null as File | null
  })

  // Refs for hidden file inputs
  const examPaperInputRef = useRef<HTMLInputElement>(null)
  const answerScriptsInputRef = useRef<HTMLInputElement>(null)
  const modelAnswerInputRef = useRef<HTMLInputElement>(null)
  const markingSchemeInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: keyof typeof uploadedFiles) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Update state to show file is selected
    setUploadedFiles(prev => ({ ...prev, [type]: file }))

    // Prepare form data
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)
    if (courseId) formData.append('courseId', courseId)

    try {
      const response = await fetch('/api/educator', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      console.log(`${type} uploaded successfully`)
    } catch (error) {
      console.error('Error uploading file:', error)
      setUploadedFiles(prev => ({ ...prev, [type]: null }))
    }
  }

  const triggerFileInput = (ref: React.RefObject<HTMLInputElement>) => {
    ref.current?.click()
  }

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Exam Paper Evaluation {courseId ? `- ${courseId}` : ''}
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
          accept=".zip,.pdf"
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
          {/* Exam Paper Upload */}
          <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <FileIcon className="w-5 h-5 text-blue-600" />
                Exam Paper
              </h2>
              <span className="text-sm text-gray-500">PDF, DOCX (Max 10MB)</span>
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <UploadIcon className="w-10 h-10 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500 mb-2">Drag and drop your exam paper here</p>
              <p className="text-gray-400 text-sm mb-4">or</p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => triggerFileInput(examPaperInputRef)}
              >
                Browse Files
              </Button>
            </div>
            {uploadedFiles.examPaper && (
              <div className="mt-4 flex items-center gap-2 text-sm text-green-600">
                <CheckIcon className="w-4 h-4" />
                <span>{uploadedFiles.examPaper.name} uploaded</span>
              </div>
            )}
          </section>

          {/* Answer Scripts Upload */}
          <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <FileIcon className="w-5 h-5 text-blue-600" />
                Student Answer Scripts
              </h2>
              <span className="text-sm text-gray-500">ZIP, PDF (Max 50MB)</span>
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <UploadIcon className="w-10 h-10 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500 mb-2">Drag and drop answer scripts here</p>
              <p className="text-gray-400 text-sm mb-4">or</p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => triggerFileInput(answerScriptsInputRef)}
              >
                Browse Files
              </Button>
            </div>
            {uploadedFiles.answerScripts && (
              <div className="mt-4 flex items-center gap-2 text-sm text-green-600">
                <CheckIcon className="w-4 h-4" />
                <span>{uploadedFiles.answerScripts.name} uploaded</span>
              </div>
            )}
          </section>

          {/* Model Answer Sheet Upload */}
          <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <FileIcon className="w-5 h-5 text-blue-600" />
                Model Answer Sheet
              </h2>
              <span className="text-sm text-gray-500">PDF, DOCX (Max 5MB)</span>
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <UploadIcon className="w-10 h-10 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500 mb-2">Drag and drop model answer sheet here</p>
              <p className="text-gray-400 text-sm mb-4">or</p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => triggerFileInput(modelAnswerInputRef)}
              >
                Browse Files
              </Button>
            </div>
            {uploadedFiles.modelAnswer && (
              <div className="mt-4 flex items-center gap-2 text-sm text-green-600">
                <CheckIcon className="w-4 h-4" />
                <span>{uploadedFiles.modelAnswer.name} uploaded</span>
              </div>
            )}
          </section>

          {/* Start Evaluation Button */}
          <div className="flex justify-end">
            <Button 
              variant="primary" 
              size="lg"
              className="flex items-center gap-2"
              disabled={!uploadedFiles.examPaper || !uploadedFiles.answerScripts}
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