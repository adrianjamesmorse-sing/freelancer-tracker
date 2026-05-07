import { useEffect, type PropsWithChildren, type ReactNode } from 'react'

interface ModalProps extends PropsWithChildren {
  open: boolean
  title: string
  description?: string
  onClose: () => void
  footer?: ReactNode
}

export function Modal({ open, title, description, onClose, footer, children }: ModalProps) {
  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = originalOverflow
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <button
        aria-label="Close modal"
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-slate-800/90 bg-slate-900 shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 px-5 py-4 sm:px-6">
          <div>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            {description ? <p className="mt-1 text-sm text-slate-400">{description}</p> : null}
          </div>
          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 bg-slate-950/70 text-slate-300 transition hover:border-slate-600 hover:text-white"
            onClick={onClose}
            type="button"
          >
            <span aria-hidden="true">✕</span>
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
        {footer ? <div className="border-t border-slate-800 px-5 py-4 sm:px-6">{footer}</div> : null}
      </div>
    </div>
  )
}
