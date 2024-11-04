import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useOptionalUser } from '@/core/auth/user'
import { Form, Link } from '@remix-run/react'
import { LogOut } from 'lucide-react'
import type { Users } from '@/db/schema'

type UserDropdownProps = {
  user: Pick<typeof Users.$inferSelect, 'firstName' | 'lastName' | 'email'>
}

function UserDropdown({ user }: UserDropdownProps) {
  const displayName =
    user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.email
  const initials =
    user.firstName && user.lastName
      ? `${user.firstName[0]}${user.lastName[0]}`
      : user.email[0]

  return (
    <DropdownMenu modal={true}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/avatars/01.png" alt={displayName} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-56 bg-gray-900 border-gray-800"
        align="end"
        forceMount
      >
        <DropdownMenuItem className="flex flex-col items-start">
          <div className="text-sm font-medium text-gray-200">{displayName}</div>
          <div className="text-xs text-gray-400">{user.email}</div>
        </DropdownMenuItem>

        {/* <DropdownMenuItem
          asChild
          className="cursor-pointer hover:bg-gray-800 text-gray-300"
        >
          <Link to="/account" className="w-full">
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem> */}

        <DropdownMenuItem
          asChild
          className="cursor-pointer hover:bg-gray-800 text-gray-300"
        >
          <Form action="/logout" method="POST">
            <button type="submit" className="w-full flex items-center">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </button>
          </Form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function Navbar() {
  const user = useOptionalUser()

  return (
    <>
      {/* Desktop Navbar */}
      <div className="hidden md:block h-20" />
      <nav className="hidden md:flex items-center justify-between py-4 px-6 bg-gray-950/90 text-gray-200 fixed top-2 left-1/2 transform -translate-x-1/2 z-50 w-11/12 max-w-6xl border border-gray-800 rounded-xl backdrop-blur-md">
        <Link to="/" className="relative z-10">
          <img
            src="/assets/img/logo/logo-dark.webp"
            alt="GINGGA"
            width={127}
            className="object-contain"
          />
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <UserDropdown user={user} />
          ) : (
            <>
              <Link
                to="/ai"
                className="text-gray-400 hover:text-gray-200 text-base"
              >
                <Button
                  size="lg"
                  className="bg-gray-800 hover:bg-gray-700 text-gray-200  text-base border border-gray-700"
                >
                  Start new project
                </Button>
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Mobile Navbar */}
      <nav className="md:hidden fixed top-0 left-0 right-0 bg-gray-950/80 text-gray-200 border-b border-gray-800 backdrop-blur-md px-4 py-3 z-50">
        <div className="flex items-center justify-between">
          <Link to="/">
            <img
              src="/assets/img/logo/logo-light.webp"
              alt="GINGGA"
              width={100}
              className="object-contain"
            />
          </Link>

          {user ? (
            <UserDropdown user={user} />
          ) : (
            <Link to="/login" className="text-gray-400 hover:text-gray-200">
              Sign in
            </Link>
          )}
        </div>
      </nav>
    </>
  )
}
