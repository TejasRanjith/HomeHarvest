'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { toast } from 'react-hot-toast'

interface KycBannerProps {
  profile: Record<string, unknown>
}

export function KycBanner({ profile }: KycBannerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const supabase = createClient()

  const kycStatus = profile.kyc_status as string | undefined
  const shouldShow = kycStatus === 'pending' || kycStatus === 'rejected'

  if (!shouldShow) return null

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file')
      return
    }

    setIsUploading(true)

    try {
      const userId = profile.id as string
      const fileName = `${userId}/${Date.now()}-${selectedFile.name}`

      const { error: uploadError } = await supabase.storage
        .from('kyc-documents')
        .upload(fileName, selectedFile)

      if (uploadError) {
        toast.error('Failed to upload document')
        setIsUploading(false)
        return
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ kyc_status: 'submitted' })
        .eq('id', userId)

      if (updateError) {
        toast.error('Failed to update KYC status')
        setIsUploading(false)
        return
      }

      toast.success('KYC document submitted!')
      setIsModalOpen(false)
      window.location.reload()
    } catch {
      toast.error('An unexpected error occurred')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <>
      <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg
              className="w-5 h-5 text-amber-600 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <p className="text-sm font-medium text-amber-800">
                {kycStatus === 'rejected'
                  ? 'Your KYC was rejected. Please resubmit your documents.'
                  : 'Complete your KYC verification to start selling.'}
              </p>
              {kycStatus === 'rejected' && profile.kyc_rejection_reason != null && (
                <p className="text-xs text-amber-600 mt-1">
                  Reason: {String(profile.kyc_rejection_reason ?? '')}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex-shrink-0 px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition"
          >
            Complete KYC
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Upload KYC Document
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Upload your Aadhaar card or business registration document.
            </p>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null
                setSelectedFile(file)
              }}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#8FBC8F] file:text-white hover:file:bg-[#7daa7d] cursor-pointer mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={isUploading || !selectedFile}
                className="flex-1 px-4 py-2 bg-[#8FBC8F] text-white text-sm font-medium rounded-lg hover:bg-[#7daa7d] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? 'Uploading...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
