import React, { useState } from 'react'

const CHUNK_SIZE = 5 * 1024 * 1024 // 5MB per chunk

const TestVideoUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState<number>(0)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null
    setFile(selectedFile)
  }

  const uploadFileInChunks = async () => {
    if (!file) return

    console.log('Upload started...')
    setUploading(true)
    setProgress(0)

    const fileId = `test-${file.name}`
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE)

    for (let chunkNumber = 0; chunkNumber < totalChunks; chunkNumber++) {
      const start = chunkNumber * CHUNK_SIZE
      const end = Math.min(start + CHUNK_SIZE, file.size)
      const chunk = file.slice(start, end)

      const formData = new FormData()
      formData.append('file_id', fileId)
      formData.append('chunk_number', chunkNumber.toString())
      formData.append('total_chunks', totalChunks.toString())
      formData.append('file', chunk)

      console.log('posting this...', formData)

      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/video/upload`,
          {
            method: 'POST',
            body: formData,
          }
        )

        if (!response.ok) {
          console.error(`Chunk ${chunkNumber} failed`, response.statusText)
          setUploading(false)
          alert(`Upload failed at chunk ${chunkNumber + 1}`)
          return
        }

        const uploadProgress = Math.round(
          ((chunkNumber + 1) / totalChunks) * 100
        )
        setProgress(uploadProgress)
      } catch (error) {
        console.error('Error uploading chunk:', error)
        setUploading(false)
        alert(`Upload failed at chunk ${chunkNumber + 1}`)
        return
      }
    }

    setUploading(false)
    alert('Upload completed!')
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (file) {
      uploadFileInChunks()
    } else {
      alert('Please select a file first')
    }
  }

  return (
    <div className="flex min-h-40 flex-col">
      <form onSubmit={handleSubmit}>
        <input
          title="upload"
          type="file"
          accept="video/*"
          onChange={handleFileChange}
          disabled={uploading}
        />

        <br />
        <br />

        <button type="submit" disabled={uploading || !file}>
          {uploading ? 'Uploading...' : 'Upload Video'}
        </button>
      </form>

      {uploading && (
        <div>
          <p>Uploading: {progress}%</p>
          <progress value={progress} max="100" />
        </div>
      )}
    </div>
  )
}

export default TestVideoUpload
