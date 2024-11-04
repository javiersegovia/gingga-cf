import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Plus, LogOut, Folder, PanelLeft } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useUser } from '@/core/auth/user'
import { Form, Link, useLocation } from '@remix-run/react'
import { cn } from '@/core/utils'
import { Projects } from '@/db/schema'

type ProjectItemProps = {
  project: Pick<typeof Projects.$inferSelect, 'id' | 'name'>
  isExpanded: boolean
  isActive: boolean
}

function ProjectItem({ project, isActive }: ProjectItemProps) {
  return (
    <div className="w-full">
      <Link to={`/ai/${project.id}/chat`}>
        <Button
          variant="ghost"
          className={cn(
            'flex items-center w-full justify-start font-normal rounded-xl hover:bg-gray-800 py-[6px] px-2 h-auto text-gray-300 hover:text-white',
            isActive && 'bg-gray-800 text-gray-200',
          )}
        >
          <span className="truncate text-sm flex-grow text-left ml-4">
            {project.name}
          </span>
        </Button>
      </Link>
    </div>
  )
}

type AccountMenuProps = {
  isExpanded: boolean
}

function AccountMenu({ isExpanded }: AccountMenuProps) {
  const user = useUser()
  const initials =
    user.firstName && user.lastName
      ? `${user.firstName[0]}${user.lastName[0]}`
      : user.email[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={`w-full ${isExpanded ? 'justify-start py-6 px-2' : 'p-0 justify-center'} bg-transparent hover:bg-gray-800 border-transparent  rounded-xl text-gray-300 hover:text-white`}
        >
          <Avatar className="h-8 w-8 rounded-xl">
            {/* <AvatarImage src={image.} alt={email} /> */}
            <AvatarFallback className="bg-gray-600 rounded-xl">
              {initials}
            </AvatarFallback>
          </Avatar>
          {isExpanded && (
            <div className="flex flex-col items-start ml-2">
              <p className="text-sm font-medium leading-none">{user.email}</p>
              {/* <p className="text-xs text-gray-400">{user.accountType}</p> */}
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56 bg-gray-900 border-gray-700"
        align="end"
        forceMount
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none text-gray-300">
              {user.email}
            </p>
            {/* <p className="text-xs leading-none text-gray-400">{user.accountType}</p> */}
          </div>
        </DropdownMenuLabel>
        {/* <DropdownMenuSeparator className="bg-gray-700" />
        <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-gray-800">
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-gray-700" />
        <DropdownMenuLabel className="text-gray-400">Theme</DropdownMenuLabel>
        <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-gray-800">
          <Sun className="mr-2 h-4 w-4" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-gray-800">
          <Moon className="mr-2 h-4 w-4" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-gray-800">
          <Laptop className="mr-2 h-4 w-4" />
          <span>System</span>
        </DropdownMenuItem> */}
        <DropdownMenuSeparator className="bg-gray-700" />
        <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-gray-800">
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

type SidebarProps = {
  projects: Pick<typeof Projects.$inferSelect, 'id' | 'name'>[]
}

export function Sidebar({ projects }: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const { pathname } = useLocation()

  return (
    <div className="relative z-20">
      <motion.div
        className="flex flex-col h-screen bg-gray-950 border-r border-gray-800 overflow-hidden"
        initial={false}
        animate={{ width: isExpanded ? 256 : 56 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-start justify-between px-2 py-4">
          {isExpanded ? (
            <motion.div
              className="flex items-center overflow-hidden w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Link
                to="/"
                className="text-2xl font-bold flex-1 flex items-center justify-center col-span-1 relative z-10"
              >
                <img
                  src="/assets/img/logo/logo-dark.svg"
                  alt="GINGGA"
                  width={127}
                  className="object-contain"
                />
              </Link>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-gray-400 hover:text-white h-10 w-10 p-0 hover:bg-gray-800"
              >
                <PanelLeft className="h-4 w-4" />
              </Button>
            </motion.div>
          ) : (
            <motion.div
              className="flex flex-col items-start justify-center w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-10 h-10 rounded-xl bg-transparent text-white flex items-center justify-center">
                <Link
                  to="/ai"
                  className="text-2xl font-bold col-span-1 relative z-10"
                >
                  <img
                    src="/assets/img/logo/logo-iso-light.svg"
                    alt="GINGGA"
                    width={127}
                    className="object-contain"
                  />
                </Link>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-4 text-gray-400 absolute top-0 ml-4 translate-x-full hover:text-white h-10 w-10 p-0 bg-transparent hover:bg-gray-700"
              >
                <PanelLeft className="h-4 w-4" />
              </Button>
            </motion.div>
          )}
        </div>

        <Separator className="bg-gray-800 mb-4" />

        <div className="px-2 mb-4">
          <Link to="/ai">
            <Button
              className={cn(
                'text-white',
                isExpanded
                  ? 'w-full bg-gray-800 border-gray-700 hover:bg-gray-700'
                  : 'bg-transparent border hover:bg-gray-700 border-gray-700 p-0 h-10 w-10 rounded-xl',
              )}
            >
              <Plus className={cn('h-4 w-4', isExpanded ? 'mr-2' : '')} />
              {isExpanded && 'New Project'}
            </Button>
          </Link>
        </div>

        <Separator className="bg-gray-800 mb-4" />

        <div className="px-2 space-y-2">
          {isExpanded ? (
            <div className="flex items-center px-2 py-1 text-gray-400">
              <Folder className="h-4 w-4 mr-2" />
              <span className="text-sm font-semibold truncate">
                Recent Projects
              </span>
            </div>
          ) : (
            <Button
              variant="ghost"
              className="p-0 h-10 w-10 text-gray-400 rounded-xl hover:text-white hover:bg-gray-700"
              onClick={() => setIsExpanded(true)}
            >
              <Folder className="h-4 w-4" />
            </Button>
          )}
          <div className="space-y-1">
            {isExpanded &&
              projects.map((project) => (
                <ProjectItem
                  key={project.id}
                  project={project}
                  isExpanded={isExpanded}
                  isActive={pathname.includes(project.id)}
                />
              ))}
          </div>
        </div>

        {isExpanded && (
          <div className="px-2 mt-4">
            <Button
              variant="outline"
              className="w-full text-gray-300 bg-transparent border-gray-700 hover:text-white hover:bg-gray-800"
            >
              View all
            </Button>
          </div>
        )}

        <Separator className="mt-auto bg-gray-800" />

        <div className="p-4">
          <AccountMenu isExpanded={isExpanded} />
        </div>
      </motion.div>
    </div>
  )
}
