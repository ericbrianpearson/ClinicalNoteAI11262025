import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CloudUpload, File, X } from "lucide-react";

interface FileUploadProps {
  onFileReady: (file: File) => void;
  disabled?: boolean;
}

export default function FileUpload({ onFileReady, disabled = false }: FileUploadProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allowedTypes = ['audio/mp3', 'audio/wav', 'audio/mpeg', 'audio/x-wav', 'audio/x-m4a'];
  const maxFileSize = 50 * 1024 * 1024; // 50MB

  const validateFile = (file: File): string | null => {
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|m4a)$/i)) {
      return 'Please upload an audio file (MP3, WAV, M4A)';
    }
    if (file.size > maxFileSize) {
      return 'File size must be less than 50MB';
    }
    return null;
  };

  const handleFileSelect = (file: File) => {
    const error = validateFile(file);
    if (error) {
      alert(error);
      return;
    }
    setUploadedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    if (disabled) return;
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setDragOver(true);
    }
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleBrowseClick = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleProcess = () => {
    if (uploadedFile) {
      onFileReady(uploadedFile);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Audio File</CardTitle>
      </CardHeader>
      <CardContent>
        {/* File Drop Zone */}
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragOver 
              ? 'border-blue-600 bg-blue-50' 
              : disabled 
              ? 'border-gray-200 bg-gray-50' 
              : 'border-gray-300 hover:border-blue-600'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <CloudUpload className={`text-3xl mb-3 mx-auto h-8 w-8 ${
            disabled ? 'text-gray-300' : 'text-gray-400'
          }`} />
          <p className={`mb-2 ${disabled ? 'text-gray-400' : 'text-gray-600'}`}>
            Drop audio file here or
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleFileInputChange}
            className="hidden"
            disabled={disabled}
          />
          <Button
            onClick={handleBrowseClick}
            disabled={disabled}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
          >
            Choose File
          </Button>
          <p className="text-xs text-gray-500 mt-2">
            Supported: MP3, WAV, M4A (Max 50MB)
          </p>
        </div>

        {/* Uploaded File Info */}
        {uploadedFile && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <File className="text-blue-600 h-4 w-4" />
                <span className="text-sm font-medium">{uploadedFile.name}</span>
              </div>
              <Button
                onClick={handleRemoveFile}
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700 h-auto p-1"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {formatFileSize(uploadedFile.size)}
            </div>
          </div>
        )}

        {/* Process Button */}
        {uploadedFile && (
          <Button
            onClick={handleProcess}
            disabled={disabled}
            className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-medium"
          >
            Process Audio
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
