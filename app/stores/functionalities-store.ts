import { create } from 'zustand'
import { useNavigate, useSearchParams } from '@remix-run/react'

type FunctionalitiesStore = {
  functionalityId: string | null
  setFunctionalityId: (id: string | null) => void
}

const useFunctionalitiesStore = create<FunctionalitiesStore>((set) => ({
  functionalityId: null,
  setFunctionalityId: (id) => set({ functionalityId: id }),
}))

export const useSelectedFunctionality = () => {
  const { functionalityId, setFunctionalityId } = useFunctionalitiesStore()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const updateUrl = (id: string | null) => {
    const newSearchParams = new URLSearchParams(searchParams)

    if (id) {
      newSearchParams.set('pf', id)
    } else {
      newSearchParams.delete('pf')
    }
    navigate(`?${newSearchParams.toString()}`, { replace: true })
  }

  return {
    functionalityId,
    setFunctionalityId: (id: string | null) => {
      setFunctionalityId(id)
      updateUrl(id)
    },
  }
}
