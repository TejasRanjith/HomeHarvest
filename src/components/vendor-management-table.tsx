'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { toast } from 'react-hot-toast'

type VendorFilter = 'all' | 'pending' | 'verified' | 'suspended'

interface VendorManagementTableProps {
  vendors: Array<Record<string, unknown>>
}

export function VendorManagementTable({ vendors }: VendorManagementTableProps) {
  const supabase = createClient()
  const [filter, setFilter] = useState<VendorFilter>('all')
  const [processingId, setProcessingId] = useState<string | null>(null)

  const filtered = vendors.filter((v) => {
    const kycStatus = v.kyc_status as string | null
    const isVerified = Boolean(v.vendor_verified)
    if (filter === 'pending') return kycStatus === 'pending' || kycStatus === 'submitted'
    if (filter === 'verified') return isVerified
    if (filter === 'suspended') return kycStatus === 'rejected'
    return true
  })

  const handleApprove = async (vendorId: string) => {
    setProcessingId(vendorId)
    const { error } = await supabase
      .from('profiles')
      .update({ kyc_status: 'approved', vendor_verified: true })
      .eq('id', vendorId)

    if (error) {
      toast.error('Failed to approve vendor')
    } else {
      toast.success('Vendor approved')
      window.location.reload()
    }
    setProcessingId(null)
  }

  const handleReject = async (vendorId: string) => {
    setProcessingId(vendorId)
    const { error } = await supabase
      .from('profiles')
      .update({ kyc_status: 'rejected' })
      .eq('id', vendorId)

    if (error) {
      toast.error('Failed to reject vendor')
    } else {
      toast.success('Vendor KYC rejected')
      window.location.reload()
    }
    setProcessingId(null)
  }

  const handleSuspend = async (vendorId: string) => {
    setProcessingId(vendorId)
    const { error } = await supabase
      .from('products')
      .update({ is_available: false })
      .eq('vendor_id', vendorId)

    if (error) {
      toast.error('Failed to suspend vendor')
    } else {
      toast.success('Vendor suspended')
      window.location.reload()
    }
    setProcessingId(null)
  }

  const statusColor = (status: string | null) => {
    if (status === 'approved') return 'bg-green-100 text-green-800'
    if (status === 'submitted') return 'bg-amber-100 text-amber-800'
    if (status === 'rejected') return 'bg-red-100 text-red-800'
    return 'bg-gray-100 text-gray-800'
  }

  return (
    <div>
      <div className="flex gap-2 mb-6">
        {(['all', 'pending', 'verified', 'suspended'] as VendorFilter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              filter === f
                ? 'bg-[#8FBC8F] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Vendor</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">KYC Status</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Products</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Joined</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((v) => {
              const products = v.products as Array<Record<string, unknown>> | null
              const productCount = products?.[0]?.count ?? 0
              const kycStatus = v.kyc_status as string | null

              return (
                <tr key={v.id as string} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3">
                    <p className="font-medium">{v.full_name as string}</p>
                    {(v.vendor_name != null) && (
                      <p className="text-xs text-gray-500">{v.vendor_name as string}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(kycStatus)}`}>
                      {kycStatus ?? 'none'}
                    </span>
                  </td>
                  <td className="px-4 py-3">{productCount as number}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {v.created_at
                      ? new Date(v.created_at as string).toLocaleDateString('en-IN')
                      : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {(kycStatus === 'pending' || kycStatus === 'submitted') && (
                        <>
                          <button
                            onClick={() => handleApprove(v.id as string)}
                            disabled={processingId === v.id}
                            className="text-xs text-green-600 hover:underline font-medium disabled:opacity-50"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(v.id as string)}
                            disabled={processingId === v.id}
                            className="text-xs text-red-600 hover:underline disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleSuspend(v.id as string)}
                        disabled={processingId === v.id}
                        className="text-xs text-amber-600 hover:underline disabled:opacity-50"
                      >
                        Suspend
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  No vendors found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
