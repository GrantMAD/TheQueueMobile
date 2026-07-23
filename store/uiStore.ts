import { create } from 'zustand'

export type ToastVariant = 'success' | 'error' | 'info'

export interface ToastItem {
  id: string
  message: string
  variant: ToastVariant
}

interface UIState {
  // Toast queue
  toasts: ToastItem[]
  showToast: (message: string, variant?: ToastVariant) => void
  dismissToast: (id: string) => void

  // Loading overlay
  isLoadingOverlay: boolean
  setLoadingOverlay: (value: boolean) => void

  // Active bottom sheet identifier (for coordinating multiple sheets)
  activeSheet: string | null
  openSheet: (sheetId: string) => void
  closeSheet: () => void
}

let toastCounter = 0

export const useUIStore = create<UIState>((set) => ({
  toasts: [],
  showToast: (message, variant = 'info') => {
    const id = `toast_${Date.now()}_${toastCounter++}`
    set((state) => ({ toasts: [...state.toasts, { id, message, variant }] }))
    // Auto-dismiss after 3.5 seconds
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
    }, 3500)
  },
  dismissToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),

  isLoadingOverlay: false,
  setLoadingOverlay: (value) => set({ isLoadingOverlay: value }),

  activeSheet: null,
  openSheet: (sheetId) => set({ activeSheet: sheetId }),
  closeSheet: () => set({ activeSheet: null }),
}))
