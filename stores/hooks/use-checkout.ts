'use client'

import { create } from 'zustand'

export type PaymentMethod = 'paystack' | 'bank_transfer'

type CheckoutState = {
  customerName: string
  customerEmail: string
  customerPhone: string
  shippingAddress: string
  shippingCity: string
  shippingState: string
  createAccount: boolean
  password: string
  selectedAddressId: string
  validationError: string | null
  showPassword: boolean
  statesList: any[]
  paymentMethod: PaymentMethod

  setCustomerName: (val: string) => void
  setCustomerEmail: (val: string) => void
  setCustomerPhone: (val: string) => void
  setShippingAddress: (val: string) => void
  setShippingCity: (val: string) => void
  setShippingState: (val: string) => void
  setCreateAccount: (val: boolean) => void
  setPassword: (val: string) => void
  setSelectedAddressId: (val: string) => void
  setValidationError: (val: string | null) => void
  setShowPassword: (val: boolean) => void
  setStatesList: (val: any[]) => void
  setPaymentMethod: (val: PaymentMethod) => void
  resetForm: () => void
}

export const useCheckout = create<CheckoutState>((set) => ({
  customerName: '',
  customerEmail: '',
  customerPhone: '',
  shippingAddress: '',
  shippingCity: '',
  shippingState: '',
  createAccount: false,
  password: '',
  selectedAddressId: '',
  validationError: null,
  showPassword: false,
  statesList: [],
  paymentMethod: 'paystack',

  setCustomerName: (customerName) => set({ customerName }),
  setCustomerEmail: (customerEmail) => set({ customerEmail }),
  setCustomerPhone: (customerPhone) => set({ customerPhone }),
  setShippingAddress: (shippingAddress) => set({ shippingAddress }),
  setShippingCity: (shippingCity) => set({ shippingCity }),
  setShippingState: (shippingState) => set({ shippingState }),
  setCreateAccount: (createAccount) => set({ createAccount }),
  setPassword: (password) => set({ password }),
  setSelectedAddressId: (selectedAddressId) => set({ selectedAddressId }),
  setValidationError: (validationError) => set({ validationError }),
  setShowPassword: (showPassword) => set({ showPassword }),
  setStatesList: (statesList) => set({ statesList }),
  setPaymentMethod: (paymentMethod) => set({ paymentMethod }),
  resetForm: () =>
    set({
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      shippingAddress: '',
      shippingCity: '',
      shippingState: '',
      createAccount: false,
      password: '',
      selectedAddressId: '',
      validationError: null,
      showPassword: false,
      statesList: [],
      paymentMethod: 'paystack',
    }),
}))
