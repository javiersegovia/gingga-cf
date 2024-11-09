import { useToast } from '@/hooks/use-toast'
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from './toast'

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {/* We will use the "Type" prop to determine the styling */}
      {toasts.map(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ({ id, title, description, action, type, toastType, ...props }) => (
          <Toast
            key={id}
            {...props}
            variant={toastType === 'error' ? 'destructive' : 'default'}
          >
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        ),
      )}
      <ToastViewport />
    </ToastProvider>
  )
}
