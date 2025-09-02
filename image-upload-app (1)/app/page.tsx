"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, X, ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface UploadedImage {
  id: string
  file: File
  url: string
  name: string
}

export default function ImageUploadApp() {
  const [images, setImages] = useState<UploadedImage[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [selectedImage, setSelectedImage] = useState<UploadedImage | null>(null)

  const handleFileUpload = useCallback((files: FileList | null) => {
    if (!files) return

    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/")) {
        const id = Math.random().toString(36).substr(2, 9)
        const url = URL.createObjectURL(file)

        setImages((prev) => [
          ...prev,
          {
            id,
            file,
            url,
            name: file.name,
          },
        ])
      }
    })
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      handleFileUpload(e.dataTransfer.files)
    },
    [handleFileUpload],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const removeImage = useCallback((id: string) => {
    setImages((prev) => {
      const imageToRemove = prev.find((img) => img.id === id)
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.url)
      }
      return prev.filter((img) => img.id !== id)
    })
  }, [])

  const openLightbox = useCallback((image: UploadedImage) => {
    setSelectedImage(image)
  }, [])

  const closeLightbox = useCallback(() => {
    setSelectedImage(null)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold text-foreground">ImageVault</h1>
            </div>
            <Button
              onClick={() => document.getElementById("file-input")?.click()}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Image
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Upload Area */}
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-12 text-center transition-colors mb-8",
            isDragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 rounded-full bg-muted">
              <Upload className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Drag and drop your images here</h3>
              <p className="text-muted-foreground mb-4">or click the button above to browse files</p>
              <p className="text-sm text-muted-foreground">Supports JPG, PNG, GIF, and WebP formats</p>
            </div>
          </div>
        </div>

        {/* Hidden file input */}
        <input
          id="file-input"
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFileUpload(e.target.files)}
        />

        {/* Gallery */}
        {images.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">Your Images ({images.length})</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((image) => (
                <Card key={image.id} className="group overflow-hidden hover:shadow-lg transition-shadow">
                  <CardContent className="p-0 relative">
                    <div className="aspect-square relative overflow-hidden">
                      <img
                        src={image.url || "/placeholder.svg"}
                        alt={image.name}
                        className="w-full h-full object-cover cursor-pointer transition-transform group-hover:scale-105"
                        onClick={() => openLightbox(image)}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeImage(image.id)
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-medium text-foreground truncate">{image.name}</p>
                      <p className="text-xs text-muted-foreground">{(image.file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {images.length === 0 && (
          <div className="text-center py-12">
            <div className="p-6 rounded-full bg-muted inline-block mb-4">
              <ImageIcon className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No images uploaded yet</h3>
            <p className="text-muted-foreground">Upload your first image to get started</p>
          </div>
        )}
      </main>

      {/* Lightbox */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={closeLightbox}>
          <div className="relative max-w-4xl max-h-full">
            <Button size="sm" variant="secondary" className="absolute top-4 right-4 z-10" onClick={closeLightbox}>
              <X className="h-4 w-4" />
            </Button>
            <img
              src={selectedImage.url || "/placeholder.svg"}
              alt={selectedImage.name}
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="absolute bottom-4 left-4 bg-black/60 text-white px-3 py-2 rounded-md">
              <p className="font-medium">{selectedImage.name}</p>
              <p className="text-sm opacity-80">{(selectedImage.file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
