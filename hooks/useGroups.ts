import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/authStore'
import { Group } from '@/types'

export function useGroups() {
  const session = useAuthStore((state) => state.session)
  const queryClient = useQueryClient()

  // Fetch groups user is member of
  const groupsQuery = useQuery({
    queryKey: ['groups', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return []

      const { data, error } = await (supabase
        .from('group_members')
        .select('groups (*)')
        .eq('user_id', session.user.id) as any)

      if (error) throw error
      return (data.map((m: any) => m.groups).filter(Boolean) as unknown as Group[]) ?? []
    },
    enabled: !!session?.user?.id,
  })

  // Create group
  const createGroupMutation = useMutation({
    mutationFn: async ({
      name,
      description,
      type,
    }: {
      name: string
      description: string
      type: 'public' | 'private'
    }) => {
      if (!session?.user?.id) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('groups')
        .insert({
          name,
          description,
          type,
          owner_id: session.user.id,
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups', session?.user?.id] })
    },
  })

  // Join public group
  const joinGroupMutation = useMutation({
    mutationFn: async (groupId: string) => {
      if (!session?.user?.id) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('group_members')
        .insert({
          group_id: groupId,
          user_id: session.user.id,
          role: 'member',
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups', session?.user?.id] })
    },
  })

  // Leave group
  const leaveGroupMutation = useMutation({
    mutationFn: async (groupId: string) => {
      if (!session?.user?.id) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', session.user.id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups', session?.user?.id] })
    },
  })

  return {
    groups: groupsQuery.data ?? [],
    isLoading: groupsQuery.isLoading,
    refetch: groupsQuery.refetch,
    createGroup: createGroupMutation.mutateAsync,
    isCreating: createGroupMutation.isPending,
    joinGroup: joinGroupMutation.mutateAsync,
    isJoining: joinGroupMutation.isPending,
    leaveGroup: leaveGroupMutation.mutateAsync,
    isLeaving: leaveGroupMutation.isPending,
  }
}
