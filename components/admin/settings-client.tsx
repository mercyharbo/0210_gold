'use client'

import { useState, useTransition } from 'react'
import {
  Bell,
  Building,
  CreditCard,
  Globe,
  Save,
  Shield,
  Sliders,
} from 'lucide-react'

import { updateStoreSettingsAction } from '@/app/(admin)/admin/settings/actions'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import type { StoreSettingsRecord } from '@/lib/settings/types'
import { useToast } from '@/stores/hooks/use-toast'

type SettingsClientProps = {
  initialSettings: StoreSettingsRecord
}

type TabKey = 'general' | 'currency' | 'shipping' | 'payments' | 'notifications' | 'security'

export function SettingsClient({ initialSettings }: SettingsClientProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('general')
  const [formData, setFormData] = useState<StoreSettingsRecord>(initialSettings)
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  const handleInputChange = (field: keyof StoreSettingsRecord, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    startTransition(async () => {
      const res = await updateStoreSettingsAction(formData)
      if (res.success) {
        toast('Store configurations updated successfully.', 'success')
      } else {
        toast(res.error || 'Failed to update store settings.', 'error')
      }
    })
  }

  const tabs: Array<{ id: TabKey; label: string; icon: any }> = [
    { id: 'general', label: 'General Info', icon: Building },
    { id: 'currency', label: 'Currency & Sourcing', icon: Globe },
    { id: 'shipping', label: 'Shipping & Delivery', icon: Sliders },
    { id: 'payments', label: 'Payment Gateway', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security & Access', icon: Shield },
  ]

  return (
    <form onSubmit={handleSubmit} className='flex flex-col gap-6 font-sans text-black'>
      {/* Top Header Controls (Frameless) */}
      <div className='flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-border'>
        {/* Minimal Underline Tab Navigation */}
        <div className='flex items-center gap-6 overflow-x-auto scrollbar-none -mb-px'>
          {tabs.map((t) => {
            const Icon = t.icon
            const isActive = activeTab === t.id
            return (
              <button
                key={t.id}
                type='button'
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 py-3 text-xs font-semibold transition-colors cursor-pointer border-b-2 shrink-0 ${
                  isActive
                    ? 'border-black text-black font-bold'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className={`size-3.5 ${isActive ? 'text-gold' : 'text-muted-foreground'}`} />
                <span>{t.label}</span>
              </button>
            )
          })}
        </div>

        <Button
          type='submit'
          disabled={isPending}
          className='bg-black text-white hover:bg-gold hover:text-black h-9 mb-2.5 px-5 text-xs font-semibold gap-2 rounded-none cursor-pointer shrink-0'
        >
          {isPending ? <Spinner className='size-4' /> : <Save className='size-4' />}
          Save Configurations
        </Button>
      </div>

      {/* Main Settings Form Body (Clean Frameless Panel) */}
      <div className='space-y-6 pt-2'>
        {/* Tab 1: General Info */}
        {activeTab === 'general' && (
          <div className='space-y-6 animate-in fade-in duration-150'>
            <div className='border-b border-border/60 pb-3'>
              <h2 className='text-base font-bold text-foreground font-sans'>General Store Details</h2>
              <p className='text-xs text-muted-foreground'>
                Manage your public luxury store name, customer support contacts, and location info.
              </p>
            </div>

            <div className='grid sm:grid-cols-2 gap-5 text-xs'>
              <div className='space-y-1.5'>
                <label className='font-semibold text-foreground block'>Store Brand Name *</label>
                <input
                  type='text'
                  value={formData.store_name}
                  onChange={(e) => handleInputChange('store_name', e.target.value)}
                  className='w-full h-10 px-3 bg-white border border-border rounded-md outline-none focus:border-gold font-medium'
                />
              </div>

              <div className='space-y-1.5'>
                <label className='font-semibold text-foreground block'>Support Email *</label>
                <input
                  type='email'
                  value={formData.support_email}
                  onChange={(e) => handleInputChange('support_email', e.target.value)}
                  className='w-full h-10 px-3 bg-white border border-border rounded-md outline-none focus:border-gold font-medium'
                />
              </div>

              <div className='space-y-1.5'>
                <label className='font-semibold text-foreground block'>Support Phone / WhatsApp *</label>
                <input
                  type='text'
                  value={formData.support_phone}
                  onChange={(e) => handleInputChange('support_phone', e.target.value)}
                  className='w-full h-10 px-3 bg-white border border-border rounded-md outline-none focus:border-gold font-medium'
                />
              </div>

              <div className='space-y-1.5'>
                <label className='font-semibold text-foreground block'>Business Hours</label>
                <input
                  type='text'
                  value={formData.business_hours}
                  onChange={(e) => handleInputChange('business_hours', e.target.value)}
                  className='w-full h-10 px-3 bg-white border border-border rounded-md outline-none focus:border-gold font-medium'
                />
              </div>

              <div className='sm:col-span-2 space-y-1.5'>
                <label className='font-semibold text-foreground block'>Physical Boutique / Office Address</label>
                <input
                  type='text'
                  value={formData.store_address}
                  onChange={(e) => handleInputChange('store_address', e.target.value)}
                  className='w-full h-10 px-3 bg-white border border-border rounded-md outline-none focus:border-gold font-medium'
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Currency & Sourcing Rates */}
        {activeTab === 'currency' && (
          <div className='space-y-6 animate-in fade-in duration-150'>
            <div className='border-b border-border/60 pb-3'>
              <h2 className='text-base font-bold text-foreground font-sans'>Currency & Sourcing Exchange Rates</h2>
              <p className='text-xs text-muted-foreground'>
                Configure primary storefront currency and international sourcing conversion multipliers.
              </p>
            </div>

            <div className='grid sm:grid-cols-2 gap-5 text-xs'>
              <div className='space-y-1.5'>
                <label className='font-semibold text-foreground block'>Primary Base Currency</label>
                <input
                  type='text'
                  disabled
                  value={`${formData.primary_currency} (₦)`}
                  className='w-full h-10 px-3 bg-neutral-100 border border-border rounded-md font-bold text-neutral-600'
                />
              </div>

              <div className='space-y-1.5'>
                <label className='font-semibold text-foreground block'>GBP Sourcing Rate (£1 = ₦)</label>
                <input
                  type='number'
                  value={formData.gbp_rate}
                  onChange={(e) => handleInputChange('gbp_rate', Number(e.target.value))}
                  className='w-full h-10 px-3 bg-white border border-border rounded-md outline-none focus:border-gold font-bold text-foreground'
                />
                <span className='text-3xs text-muted-foreground'>Used to calculate UK luxury sourcing item prices in Naira.</span>
              </div>

              <div className='space-y-1.5'>
                <label className='font-semibold text-foreground block'>USD Sourcing Rate ($1 = ₦)</label>
                <input
                  type='number'
                  value={formData.usd_rate}
                  onChange={(e) => handleInputChange('usd_rate', Number(e.target.value))}
                  className='w-full h-10 px-3 bg-white border border-border rounded-md outline-none focus:border-gold font-bold text-foreground'
                />
                <span className='text-3xs text-muted-foreground'>Used for US luxury personal shopper quotes.</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Shipping & Delivery */}
        {activeTab === 'shipping' && (
          <div className='space-y-6 animate-in fade-in duration-150'>
            <div className='border-b border-border/60 pb-3'>
              <h2 className='text-base font-bold text-foreground font-sans'>Fulfillment & Delivery Schedules</h2>
              <p className='text-xs text-muted-foreground'>
                Set local delivery fees, international freight rates, and free shipping triggers.
              </p>
            </div>

            <div className='grid sm:grid-cols-2 gap-5 text-xs'>
              <div className='space-y-1.5'>
                <label className='font-semibold text-foreground block'>Standard Local Delivery Fee (₦)</label>
                <input
                  type='number'
                  value={formData.local_shipping_fee}
                  onChange={(e) => handleInputChange('local_shipping_fee', Number(e.target.value))}
                  className='w-full h-10 px-3 bg-white border border-border rounded-md outline-none focus:border-gold font-bold text-foreground'
                />
              </div>

              <div className='space-y-1.5'>
                <label className='font-semibold text-foreground block'>UK Freight Sourcing Rate / kg (₦)</label>
                <input
                  type='number'
                  value={formData.uk_shipping_rate_per_kg}
                  onChange={(e) => handleInputChange('uk_shipping_rate_per_kg', Number(e.target.value))}
                  className='w-full h-10 px-3 bg-white border border-border rounded-md outline-none focus:border-gold font-bold text-foreground'
                />
              </div>

              <div className='space-y-1.5 sm:col-span-2'>
                <label className='font-semibold text-foreground block'>Free Shipping Minimum Order Threshold (₦)</label>
                <input
                  type='number'
                  value={formData.free_shipping_threshold}
                  onChange={(e) => handleInputChange('free_shipping_threshold', Number(e.target.value))}
                  className='w-full h-10 px-3 bg-white border border-border rounded-md outline-none focus:border-gold font-bold text-foreground'
                />
                <span className='text-3xs text-muted-foreground'>Orders with total amount above this threshold get zero delivery charges.</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Payment Gateway */}
        {activeTab === 'payments' && (
          <div className='space-y-6 animate-in fade-in duration-150'>
            <div className='border-b border-border/60 pb-3'>
              <h2 className='text-base font-bold text-foreground font-sans'>Payment Gateway Integrations</h2>
              <p className='text-xs text-muted-foreground'>
                Manage Paystack checkout environment and active merchant payment channels.
              </p>
            </div>

            <div className='grid sm:grid-cols-2 gap-5 text-xs'>
              <div className='space-y-1.5'>
                <label className='font-semibold text-foreground block'>Paystack Environment Mode</label>
                <select
                  value={formData.paystack_mode}
                  onChange={(e) => handleInputChange('paystack_mode', e.target.value)}
                  className='w-full h-10 px-3 bg-white border border-border rounded-md outline-none focus:border-gold font-semibold'
                >
                  <option value='sandbox'>Sandbox (Test Mode)</option>
                  <option value='live'>Live Mode (Real Payments)</option>
                </select>
              </div>

              <div className='space-y-1.5'>
                <label className='font-semibold text-foreground block'>Accepted Payment Channels</label>
                <div className='p-3.5 bg-neutral-50 rounded-lg space-y-2 text-xs'>
                  <p className='font-medium text-foreground'>✓ Debit / Credit Card (Mastercard, Visa, Verve)</p>
                  <p className='font-medium text-foreground'>✓ Direct Bank Transfer & USSD</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Notifications */}
        {activeTab === 'notifications' && (
          <div className='space-y-6 animate-in fade-in duration-150'>
            <div className='border-b border-border/60 pb-3'>
              <h2 className='text-base font-bold text-foreground font-sans'>Notification & Alert Preferences</h2>
              <p className='text-xs text-muted-foreground'>
                Choose when store managers receive automatic email notifications.
              </p>
            </div>

            <div className='space-y-3 text-xs'>
              <label className='flex items-center gap-3 p-4 bg-neutral-50 rounded-lg cursor-pointer hover:bg-neutral-100 transition-colors'>
                <input
                  type='checkbox'
                  checked={formData.order_email_notifications}
                  onChange={(e) => handleInputChange('order_email_notifications', e.target.checked)}
                  className='size-4 rounded border-border accent-black cursor-pointer'
                />
                <div>
                  <span className='font-bold text-foreground block'>New Customer Order Alerts</span>
                  <span className='text-muted-foreground'>Send an immediate email alert to support email whenever a new order is placed.</span>
                </div>
              </label>

              <label className='flex items-center gap-3 p-4 bg-neutral-50 rounded-lg cursor-pointer hover:bg-neutral-100 transition-colors'>
                <input
                  type='checkbox'
                  checked={formData.request_email_notifications}
                  onChange={(e) => handleInputChange('request_email_notifications', e.target.checked)}
                  className='size-4 rounded border-border accent-black cursor-pointer'
                />
                <div>
                  <span className='font-bold text-foreground block'>Personal Shopper Sourcing Request Alerts</span>
                  <span className='text-muted-foreground'>Receive instant alerts when clients submit custom bespoke sourcing briefs.</span>
                </div>
              </label>

              <label className='flex items-center gap-3 p-4 bg-neutral-50 rounded-lg cursor-pointer hover:bg-neutral-100 transition-colors'>
                <input
                  type='checkbox'
                  checked={formData.low_stock_alerts}
                  onChange={(e) => handleInputChange('low_stock_alerts', e.target.checked)}
                  className='size-4 rounded border-border accent-black cursor-pointer'
                />
                <div>
                  <span className='font-bold text-foreground block'>Low Inventory Alerts</span>
                  <span className='text-muted-foreground'>Notify admins when a luxury item stock falls below 3 units.</span>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* Tab 6: Security & Access */}
        {activeTab === 'security' && (
          <div className='space-y-6 animate-in fade-in duration-150'>
            <div className='border-b border-border/60 pb-3'>
              <h2 className='text-base font-bold text-foreground font-sans'>Security & Staff Access Control</h2>
              <p className='text-xs text-muted-foreground'>
                Configure manager session durations and administrator account security rules.
              </p>
            </div>

            <div className='grid sm:grid-cols-2 gap-5 text-xs'>
              <div className='space-y-1.5'>
                <label className='font-semibold text-foreground block'>Admin Session Inactivity Expiry</label>
                <select
                  value={formData.session_expiry_days}
                  onChange={(e) => handleInputChange('session_expiry_days', Number(e.target.value))}
                  className='w-full h-10 px-3 bg-white border border-border rounded-md outline-none focus:border-gold font-semibold'
                >
                  <option value={1}>1 Day</option>
                  <option value={7}>7 Days (Recommended)</option>
                  <option value={30}>30 Days</option>
                </select>
              </div>

              <div className='space-y-1.5'>
                <label className='font-semibold text-foreground block'>Multi-Factor Authentication (MFA)</label>
                <select
                  value={formData.mfa_required ? 'true' : 'false'}
                  onChange={(e) => handleInputChange('mfa_required', e.target.value === 'true')}
                  className='w-full h-10 px-3 bg-white border border-border rounded-md outline-none focus:border-gold font-semibold'
                >
                  <option value='false'>Optional for Staff</option>
                  <option value='true'>Required for all Admin Roles</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </form>
  )
}
