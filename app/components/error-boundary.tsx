import { getErrorMessage } from '@/core/utils'
import {
  Link,
  isRouteErrorResponse,
  useParams,
  useRouteError,
} from '@remix-run/react'
import type { ErrorResponse } from '@remix-run/react'
import { TriangleAlert } from 'lucide-react'
import { $path } from 'remix-routes'
import { Button } from './ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './ui/card'

export type StatusHandler = (info: {
  error: ErrorResponse
  params: Record<string, string | undefined>
}) => JSX.Element | null

const defaultStatusHandlers: Record<number, StatusHandler> = {
  403: ({ error }) => (
    <ErrorMessage description="You are not allowed to do that." error={error} />
  ),
}

interface GeneralErrorBoundaryProps {
  defaultStatusHandler?: StatusHandler
  statusHandlers?: Record<number, StatusHandler>
  unexpectedErrorHandler?: (error: unknown) => JSX.Element | null
}

export function GeneralErrorBoundary({
  defaultStatusHandler = ({ error }) => <ErrorMessage error={error} />,
  statusHandlers = defaultStatusHandlers,
  unexpectedErrorHandler = (error) => <p>{getErrorMessage(error)}</p>,
}: GeneralErrorBoundaryProps) {
  const error = useRouteError()
  const params = useParams()

  if (typeof document !== 'undefined') {
    // eslint-disable-next-line no-console
    console.error(error)
  }

  return (
    <div className="container flex items-center justify-center p-20 text-h2 mx-auto">
      {isRouteErrorResponse(error)
        ? (statusHandlers?.[error.status] ?? defaultStatusHandler)({
            error,
            params,
          })
        : unexpectedErrorHandler(error)}
    </div>
  )
}

const ErrorMessage = ({
  error,
  description = 'Something went wrong.',
}: {
  error: ErrorResponse
  description?: string
}) => {
  return (
    <Card className="max-w-sm w-full mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <TriangleAlert className="h-5 w-5" />
          <span>{error?.data.error ?? 'Error'}</span>
        </CardTitle>

        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent>
        <p className="text-sm bg-destructive-foreground text-destructive p-2 rounded-md whitespace-pre-line">
          {error?.data.message}
        </p>
      </CardContent>

      <CardFooter>
        <Link className="w-full" to={$path('/')}>
          <Button className="w-full" variant="outline">
            Go back to home
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
