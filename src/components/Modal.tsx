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
      <button aria-label="Close modal" className="absolute inset-0 bg-stone-900/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-[30px] border border-stone-200 bg-[linear-gradient(180deg,#fffdfa,#f6f0e6)] shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-stone-200 px-5 py-4 sm:px-6">
          <div>
            <h3 className="text-lg font-semibold tracking-tight text-stone-900">{title}</h3>
            {description ? <p className="mt-1 text-sm text-stone-600">{description}</p> : null}
          </div>
          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-stone-200 bg-white/85 text-stone-600 transition hover:border-stone-300 hover:text-stone-900"
            onClick={onClose}
            type="button"
          >
            <span aria-hidden="true">✕</span>
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-5 text-stone-800 sm:px-6">{children}</div>
        {footer ? <div className="border-t border-stone-200 px-5 py-4 sm:px-6">{footer}</div> : null}
      </div>
    </div>
  )
}
