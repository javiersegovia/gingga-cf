import type { loader as projectAPILoader } from '@/routes/api+/projects+/$projectId'
import type { loader as projectModuleAPILoader } from '@/routes/api+/projects+/$projectId.modules.$id'
import type { loader as functionalityAPILoader } from '@/routes/api+/projects+/$projectId.functionalities.$id'
import type { loader as timelineAPILoader } from '@/routes/api+/projects+/$projectId.timeline'
import type {
  ProjectUpdate,
  Functionality,
  UpdateProjectModule,
  UpdateFunctionality,
} from '@/schemas/project-schema'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { UseQueryOptions } from '@tanstack/react-query'

const getProject = async (projectId?: string) => {
  if (!projectId) {
    throw new Error('Project ID is required')
  }

  const response = await fetch(`/api/projects/${projectId}`)
  if (!response.ok) {
    throw new Error('Failed to fetch project')
  }
  return (await response.json()) as GetProjectResponse
}

export const getProjectQueryKey = (projectId?: string) => ['project', projectId]

export type GetProjectResponse = Awaited<
  ReturnType<Awaited<ReturnType<typeof projectAPILoader>>['json']>
>

export const useProjectQuery = (projectId?: string) =>
  useQuery<GetProjectResponse>({
    queryKey: getProjectQueryKey(projectId),
    queryFn: () => getProject(projectId),
    enabled: !!projectId,
  })

export const useProjectMutation = (projectId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: ProjectUpdate) => {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        throw new Error('Failed to update project')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getProjectQueryKey(projectId),
      })
    },
  })
}

// Project Module queries and mutations

const getProjectModule = async (projectId: string, moduleId: string) => {
  const response = await fetch(`/api/projects/${projectId}/modules/${moduleId}`)
  if (!response.ok) {
    throw new Error('Failed to fetch project module')
  }
  return response.json() as Promise<GetProjectModuleResponse>
}

export const getProjectModuleQueryKey = (
  projectId: string,
  moduleId: string,
) => ['projectModule', projectId, moduleId]

export type GetProjectModuleResponse = Awaited<
  ReturnType<Awaited<ReturnType<typeof projectModuleAPILoader>>['json']>
>

export const useProjectModuleQuery = (
  projectId: string,
  moduleId: string,
  queryOptions?: Pick<UseQueryOptions<GetProjectModuleResponse>, 'enabled'>,
) =>
  useQuery<GetProjectModuleResponse>({
    queryKey: getProjectModuleQueryKey(projectId, moduleId),
    queryFn: () => getProjectModule(projectId, moduleId),
    enabled: !!projectId && !!moduleId,
    ...queryOptions,
  })

export const useUpdateProjectModuleMutation = (
  projectId: string,
  moduleId: string,
) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: UpdateProjectModule) => {
      const response = await fetch(
        `/api/projects/${projectId}/modules/${moduleId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        },
      )
      if (!response.ok) {
        throw new Error('Failed to update project module')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getProjectModuleQueryKey(projectId, moduleId),
      })
      // Also invalidate the project query as the module data might have changed
      queryClient.invalidateQueries({
        queryKey: getProjectQueryKey(projectId),
      })
    },
  })
}

export const useDeleteProjectModuleMutation = (projectId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const response = await fetch(`/api/projects/${projectId}/modules/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      })
      if (!response.ok) {
        throw new Error('Failed to delete project module')
      }
      return response.json()
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: getProjectQueryKey(projectId),
      })
      queryClient.invalidateQueries({
        queryKey: getProjectModuleQueryKey(projectId, id),
      })
    },
  })
}

// Project Modules (plural) queries and mutations

export const getProjectModulesQueryKey = (projectId: string) => [
  'projectModules',
  projectId,
]

export const useProjectModulesQuery = (projectId: string) =>
  useQuery({
    queryKey: getProjectModulesQueryKey(projectId),
    queryFn: async () => {
      const response = await fetch(`/api/projects/${projectId}/modules`)
      if (!response.ok) {
        throw new Error('Failed to fetch project modules')
      }
      return response.json()
    },
    enabled: !!projectId,
  })

export const useUpdateProjectModulesMutation = (projectId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Partial<GetProjectModuleResponse>[]) => {
      const response = await fetch(`/api/projects/${projectId}/modules`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        throw new Error('Failed to update project modules')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getProjectModulesQueryKey(projectId),
      })
      // Also invalidate the project query as the modules might have changed
      queryClient.invalidateQueries({
        queryKey: getProjectQueryKey(projectId),
      })
    },
  })
}

// Functionality queries and mutations

export type GetFunctionalityResponse = Awaited<
  ReturnType<Awaited<ReturnType<typeof functionalityAPILoader>>['json']>
>

export const useGenerateFunctionalitiesMutation = (
  projectId: string,
  moduleId: string,
) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/projects/${projectId}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          intent: 'generate-functionalities',
          moduleId,
        }),
      })
      if (!response.ok) {
        throw new Error('Failed to generate functionalities')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getProjectModuleQueryKey(projectId, moduleId),
      })
    },
  })
}

export const useCreateFunctionalityMutation = (
  projectId: string,
  moduleId: string,
) => {
  // const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Omit<Functionality, 'id'>) => {
      const response = await fetch(
        `/api/projects/${projectId}/functionalities`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ moduleId, ...data }),
        },
      )
      if (!response.ok) {
        throw new Error('Failed to create functionality')
      }
      return response.json()
    },
    onSuccess: () => {},
  })
}

export const useUpdateFunctionalityMutation = (
  projectId: string,
  functionalityId: string,
  moduleId: string,
) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: UpdateFunctionality) => {
      const response = await fetch(
        `/api/projects/${projectId}/functionalities/${functionalityId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        },
      )
      if (!response.ok) {
        throw new Error('Failed to update functionality')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getFunctionalityQueryKey(projectId, functionalityId),
      })
      queryClient.invalidateQueries({
        queryKey: getProjectModuleQueryKey(projectId, moduleId),
      })
    },
  })
}

export const useDeleteFunctionalityMutation = (
  projectId: string,
  functionalityId: string,
  moduleId: string,
) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const response = await fetch(
        `/api/projects/${projectId}/functionalities/${functionalityId}`,
        {
          method: 'DELETE',
        },
      )
      if (!response.ok) {
        throw new Error('Failed to delete functionality')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getProjectModuleQueryKey(projectId, moduleId),
      })
    },
  })
}

export const getFunctionalityQueryKey = (
  projectId: string,
  functionalityId: string,
) => ['functionality', projectId, functionalityId]

export const useFunctionalityQuery = (
  projectId?: string,
  functionalityId?: string | null,
) =>
  useQuery<GetFunctionalityResponse>({
    queryKey:
      projectId && functionalityId
        ? getFunctionalityQueryKey(projectId, functionalityId)
        : [],
    queryFn: async ({ signal }) => {
      const response = await fetch(
        `/api/projects/${projectId}/functionalities/${functionalityId}`,
        { signal },
      )

      if (!response.ok) {
        throw new Error('Failed to fetch functionality')
      }
      return response.json() as Promise<GetFunctionalityResponse>
    },
    enabled: !!projectId && !!functionalityId,
  })

export const useGenerateComplexityMetricsMutation = (
  projectId: string,
  moduleId: string,
) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const response = await fetch(
        `/api/projects/${projectId}/modules/${moduleId}/complexities`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        },
      )

      if (!response.ok) {
        throw new Error('Failed to generate complexity metrics')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getProjectQueryKey(projectId),
      })
      queryClient.invalidateQueries({
        queryKey: getProjectModuleQueryKey(projectId, moduleId),
      })
      queryClient.invalidateQueries({
        queryKey: ['functionality'],
      })
    },
  })
}

// Timeline queries and mutations
export type GetTimelineResponse = Awaited<
  ReturnType<Awaited<ReturnType<typeof timelineAPILoader>>['json']>
>

export const getTimelineQueryKey = (projectId: string) => [
  'timeline',
  projectId,
]

export const useTimelineQuery = (projectId: string) =>
  useQuery<GetTimelineResponse>({
    queryKey: getTimelineQueryKey(projectId),
    queryFn: async () => {
      const response = await fetch(`/api/projects/${projectId}/timeline`)
      if (!response.ok) {
        throw new Error('Failed to fetch timeline')
      }
      return response.json() as Promise<GetTimelineResponse>
    },
    enabled: !!projectId,
  })

export const useGenerateTimelineMutation = (projectId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/projects/${projectId}/timeline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      if (!response.ok) {
        throw new Error('Failed to generate timeline')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getTimelineQueryKey(projectId),
      })
    },
  })
}
