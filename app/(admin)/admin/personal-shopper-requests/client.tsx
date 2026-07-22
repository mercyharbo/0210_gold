'use client'

import { useState, useTransition } from 'react'
import {
  CheckCircle,
  Clock,
  ExternalLink,
  FileText,
  Filter,
  Loader2,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react'

import { AdminPlaceholderCard } from '@/components/admin/admin-placeholder-card'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { StatusBadge } from '@/components/ui/status-badge'

import { updateAdminNotesAction, updateRequestStatusAction } from './actions'
import type { PersonalShopperRequestRecord } from './page'

type ClientProps = {
  initialRequests: PersonalShopperRequestRecord[]
}

export function PersonalShopperRequestsClient({ initialRequests }: ClientProps) {
  const [requests, setRequests] = useState<PersonalShopperRequestRecord[]>(initialRequests)
  const [selectedStatus, setSelectedStatus] = useState<string>('All')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest')
  const [searchQuery, setSearchQuery] = useState<string>('')
  
  const [activeRequest, setActiveRequest] = useState<PersonalShopperRequestRecord | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState<boolean>(false)

  const [notesInput, setNotesInput] = useState<string>('')
  const [statusSelect, setStatusSelect] = useState<string>('')
  const [isPending, startTransition] = useTransition()
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Calculations
  const totalCount = requests.length
  const pendingCount = requests.filter((r) => r.status === 'Pending' || r.status === 'Sourcing').length
  const completedCount = requests.filter((r) => r.status === 'Completed').length

  // Filtered & Sorted requests
  const filteredRequests = requests
    .filter((req) => {
      const matchesStatus = selectedStatus === 'All' || req.status === selectedStatus
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        req.full_name.toLowerCase().includes(q) ||
        req.email.toLowerCase().includes(q) ||
        req.category.toLowerCase().includes(q) ||
        (req.delivery_city && req.delivery_city.toLowerCase().includes(q))
      return matchesStatus && matchesSearch
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      if (sortBy === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      return 0
    })

  const activeFilterCount =
    (selectedStatus !== 'All' ? 1 : 0) +
    (sortBy !== 'newest' ? 1 : 0)

  const resetFilters = () => {
    setSelectedStatus('All')
    setSortBy('newest')
  }

  const openDrawer = (req: PersonalShopperRequestRecord) => {
    setActiveRequest(req)
    setStatusSelect(req.status)
    setNotesInput(req.admin_notes || '')
    setFeedbackMsg(null)
  }

  const handleUpdate = () => {
    if (!activeRequest) return
    setFeedbackMsg(null)

    startTransition(async () => {
      let statusRes = { success: true }
      let notesRes = { success: true }

      if (statusSelect !== activeRequest.status) {
        statusRes = await updateRequestStatusAction(activeRequest.id, statusSelect)
      }

      if (notesInput !== (activeRequest.admin_notes || '')) {
        notesRes = await updateAdminNotesAction(activeRequest.id, notesInput)
      }

      if (statusRes.success && notesRes.success) {
        setFeedbackMsg({ type: 'success', text: 'Request updated successfully!' })
        // Local state update
        setRequests((prev) =>
          prev.map((r) =>
            r.id === activeRequest.id
              ? { ...r, status: statusSelect, admin_notes: notesInput }
              : r
          )
        )
        setActiveRequest((prev) =>
          prev ? { ...prev, status: statusSelect, admin_notes: notesInput } : null
        )
      } else {
        setFeedbackMsg({ type: 'error', text: 'Failed to update request. Try again.' })
      }
    })
  }

  return (
    <div className='grid gap-6 font-sans'>
      {/* Metrics Header Cards */}
      <div className='grid gap-4 sm:grid-cols-3'>
        <AdminPlaceholderCard
          title='Total Requests'
          value={totalCount}
          icon={FileText}
        />
        <AdminPlaceholderCard
          title='Active / Sourcing'
          value={pendingCount}
          icon={Clock}
        />
        <AdminPlaceholderCard
          title='Completed Sourcing'
          value={completedCount}
          icon={CheckCircle}
        />
      </div>

      {/* Search & Sheet Filter Bar */}
      <div className='flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 py-1'>
        <div className='flex items-center gap-3 flex-1 max-w-md'>
          <div className='relative flex-1'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground' />
            <input
              type='text'
              placeholder='Search name, email, city...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='w-full h-10 pl-9 pr-4 text-xs bg-white border border-border rounded-md outline-none focus:border-gold'
            />
          </div>

          {/* Sheet Filter Drawer Trigger Button */}
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button
                variant='outline'
                size='sm'
                className='h-10 px-3.5 gap-2 border-border bg-white hover:bg-neutral-100 text-xs font-semibold shrink-0 cursor-pointer relative'
              >
                <SlidersHorizontal className='size-4 text-gold' />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span className='size-5 rounded-full bg-black text-white text-[10px] font-bold flex items-center justify-center ml-0.5'>
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </SheetTrigger>

            {/* Sheet Filter Drawer Content */}
            <SheetContent side='right' showCloseButton className='p-0 bg-white text-black max-w-md w-full font-sans flex flex-col justify-between'>
              <SheetHeader className='p-6 border-b border-border space-y-1 text-left'>
                <div className='flex items-center gap-2 text-gold'>
                  <Filter className='size-5' />
                  <SheetTitle className='text-lg font-bold text-foreground font-sans'>
                    Filter Sourcing Requests
                  </SheetTitle>
                </div>
                <SheetDescription className='text-xs text-muted-foreground font-sans'>
                  Filter bespoke personal shopper requests by status and chronological order.
                </SheetDescription>
              </SheetHeader>

              <div className='p-6 space-y-6 flex-1 overflow-y-auto text-xs'>
                {/* Request Status Section */}
                <div className='space-y-3'>
                  <label className='font-bold uppercase text-muted-foreground text-[11px] block'>
                    Request Status
                  </label>
                  <div className='flex flex-wrap gap-2'>
                    {['All', 'Pending', 'Sourcing', 'Approved', 'Completed', 'Cancelled'].map((st) => (
                      <button
                        key={st}
                        type='button'
                        onClick={() => setSelectedStatus(st)}
                        className={`px-3 py-1.5 rounded-md border text-xs font-medium transition-colors cursor-pointer capitalize ${
                          selectedStatus === st
                            ? 'bg-black text-white border-black'
                            : 'bg-neutral-50 text-neutral-700 border-border hover:bg-neutral-100'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sort Order Section */}
                <div className='space-y-3 pt-4 border-t border-border'>
                  <label className='font-bold uppercase text-muted-foreground text-[11px] block'>
                    Sort Requests By
                  </label>
                  <div className='grid grid-cols-2 gap-2'>
                    {[
                      { key: 'newest', label: 'Newest First' },
                      { key: 'oldest', label: 'Oldest First' },
                    ].map((opt) => (
                      <button
                        key={opt.key}
                        type='button'
                        onClick={() => setSortBy(opt.key as any)}
                        className={`p-2.5 rounded-md border text-xs font-medium text-center transition-colors cursor-pointer ${
                          sortBy === opt.key
                            ? 'bg-black text-white border-black'
                            : 'bg-neutral-50 text-neutral-700 border-border hover:bg-neutral-100'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sheet Footer Actions */}
              <SheetFooter className='p-6 border-t border-border flex flex-row items-center justify-between gap-3 bg-neutral-50'>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={resetFilters}
                  className='h-10 px-4 text-xs font-semibold gap-1.5 border-border bg-white cursor-pointer'
                >
                  <RotateCcw className='size-3.5 text-muted-foreground' />
                  Reset Filters
                </Button>

                <SheetClose asChild>
                  <Button
                    type='button'
                    size='sm'
                    className='h-10 px-6 bg-black text-white hover:bg-gold hover:text-black text-xs font-semibold cursor-pointer'
                  >
                    Apply Filters
                  </Button>
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Main Table */}
      <AdminPlaceholderCard
        title='Client Bespoke Briefs'
        description={`Displaying ${filteredRequests.length} request(s)`}
      >
        <div className='overflow-x-auto'>
          <table className='w-full border-collapse text-left text-sm'>
            <thead>
              <tr className='border-b border-border font-semibold text-muted-foreground text-xs uppercase'>
                <th className='px-4 py-3 font-semibold'>Client</th>
                <th className='px-4 py-3 font-semibold'>Category</th>
                <th className='px-4 py-3 font-semibold'>Budget</th>
                <th className='px-4 py-3 font-semibold'>Delivery City</th>
                <th className='px-4 py-3 font-semibold'>Date</th>
                <th className='px-4 py-3 text-center font-semibold'>Status</th>
                <th className='px-4 py-3 text-right font-semibold'>Action</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-border'>
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className='py-8 text-center text-sm text-muted-foreground'>
                    No requests found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr key={req.id} className='transition-colors hover:bg-muted/40'>
                    <td className='px-4 py-4'>
                      <div className='font-semibold text-foreground text-sm'>{req.full_name}</div>
                      <div className='text-xs text-muted-foreground flex items-center gap-2 mt-0.5'>
                        <Mail className='size-3' /> {req.email}
                      </div>
                    </td>
                    <td className='px-4 py-4 font-medium text-foreground text-xs'>
                      {req.category}
                    </td>
                    <td className='px-4 py-4 font-medium text-xs text-foreground'>
                      {req.budget || '—'}
                    </td>
                    <td className='px-4 py-4 text-xs text-muted-foreground'>
                      {req.delivery_city || '—'}
                    </td>
                    <td className='px-4 py-4 text-xs text-muted-foreground'>
                      {new Date(req.created_at).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className='px-4 py-4 text-center'>
                      <StatusBadge status={req.status} />
                    </td>
                    <td className='px-4 py-4 text-right'>
                      <Button
                        variant='outline'
                        size='xs'
                        onClick={() => openDrawer(req)}
                        className='h-8 gap-1.5 border-border bg-white hover:bg-muted cursor-pointer'
                      >
                        Details
                        <ExternalLink className='size-3 text-muted-foreground' />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </AdminPlaceholderCard>

      {/* Details & Action Drawer Modal */}
      {activeRequest && (
        <div className='fixed inset-0 z-50 bg-black/60 flex justify-end animate-in fade-in duration-200'>
          <div className='bg-white text-black w-full max-w-xl h-full overflow-y-auto border-l border-border p-6 sm:p-8 space-y-6 flex flex-col justify-between font-sans'>
            <div className='space-y-6'>
              <div className='flex items-center justify-between border-b border-border pb-4'>
                <div>
                  <p className='text-xs text-muted-foreground'>ID: #{activeRequest.id.slice(0, 8)}</p>
                  <h3 className='font-sans text-xl font-bold'>{activeRequest.full_name}</h3>
                </div>
                <button
                  onClick={() => setActiveRequest(null)}
                  className='p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted cursor-pointer'
                >
                  <X className='size-5' />
                </button>
              </div>

              {feedbackMsg && (
                <div
                  className={`p-3 text-xs font-medium rounded-md border ${
                    feedbackMsg.type === 'success'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}
                >
                  {feedbackMsg.text}
                </div>
              )}

              {/* Contact & Meta */}
              <div className='grid grid-cols-2 gap-4 bg-neutral-50 p-4 rounded-lg border border-border text-xs'>
                <div className='space-y-1'>
                  <span className='font-semibold text-muted-foreground uppercase text-3xs'>Phone / WhatsApp</span>
                  <p className='text-foreground flex items-center gap-1.5 font-medium'>
                    <Phone className='size-3 text-gold' /> {activeRequest.phone}
                  </p>
                </div>
                <div className='space-y-1'>
                  <span className='font-semibold text-muted-foreground uppercase text-3xs'>Email</span>
                  <p className='text-foreground flex items-center gap-1.5 truncate font-medium'>
                    <Mail className='size-3 text-gold' /> {activeRequest.email}
                  </p>
                </div>
                <div className='space-y-1'>
                  <span className='font-semibold text-muted-foreground uppercase text-3xs'>Target Budget</span>
                  <p className='font-bold text-foreground'>{activeRequest.budget || 'N/A'}</p>
                </div>
                <div className='space-y-1'>
                  <span className='font-semibold text-muted-foreground uppercase text-3xs'>Delivery City</span>
                  <p className='text-foreground flex items-center gap-1.5 font-medium'>
                    <MapPin className='size-3 text-gold' /> {activeRequest.delivery_city || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Category & Specifications */}
              <div className='space-y-3'>
                <h4 className='text-xs font-bold uppercase text-muted-foreground'>Request Details</h4>
                <div className='space-y-2 text-xs'>
                  <div>
                    <span className='font-semibold text-muted-foreground'>Category: </span>
                    <span className='font-medium text-foreground'>{activeRequest.category}</span>
                  </div>
                  {activeRequest.size && (
                    <div>
                      <span className='font-semibold text-muted-foreground'>Size / Specs: </span>
                      <span className='font-medium text-foreground'>{activeRequest.size}</span>
                    </div>
                  )}
                  {activeRequest.preferred_stores_or_links && (
                    <div>
                      <span className='font-semibold text-muted-foreground'>Stores / Links: </span>
                      <span className='font-medium text-foreground break-all'>{activeRequest.preferred_stores_or_links}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Message */}
              <div className='space-y-2'>
                <h4 className='text-xs font-bold uppercase text-muted-foreground flex items-center gap-1.5'>
                  <MessageSquare className='size-3.5 text-gold' /> Sourcing Brief / Description
                </h4>
                <div className='p-4 bg-neutral-50 border border-border rounded-lg text-xs leading-relaxed text-foreground whitespace-pre-wrap'>
                  {activeRequest.message}
                </div>
              </div>

              {/* Update Status */}
              <div className='space-y-2 pt-2 border-t border-border'>
                <label className='text-xs font-bold uppercase text-muted-foreground block'>
                  Update Status
                </label>
                <select
                  value={statusSelect}
                  onChange={(e) => setStatusSelect(e.target.value)}
                  className='w-full h-10 px-3 bg-white border border-border rounded-md text-xs font-medium focus:border-gold outline-none'
                >
                  <option value='Pending'>Pending</option>
                  <option value='Sourcing'>Sourcing</option>
                  <option value='Approved'>Approved</option>
                  <option value='Completed'>Completed</option>
                  <option value='Cancelled'>Cancelled</option>
                </select>
              </div>

              {/* Admin Notes */}
              <div className='space-y-2'>
                <label className='text-xs font-bold uppercase text-muted-foreground block'>
                  Internal Admin Notes
                </label>
                <textarea
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  placeholder='Record sourcing cost, supplier contact, tracking reference...'
                  className='w-full min-h-24 p-3 bg-white border border-border rounded-md text-xs focus:border-gold outline-none resize-none'
                />
              </div>
            </div>

            {/* Bottom Actions */}
            <div className='flex items-center justify-end gap-3 border-t border-border pt-4'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setActiveRequest(null)}
                className='h-10 text-xs cursor-pointer'
              >
                Close
              </Button>
              <Button
                size='sm'
                disabled={isPending}
                onClick={handleUpdate}
                className='h-10 text-xs gap-2 bg-black text-white hover:bg-gold hover:text-black cursor-pointer'
              >
                {isPending ? <Loader2 className='size-3.5 animate-spin' /> : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
