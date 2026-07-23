import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/authStore'
import { VotingRound } from '@/types'

export function useVoting(groupId: string) {
  const session = useAuthStore((state) => state.session)
  const queryClient = useQueryClient()

  // Fetch active voting round for group
  const activeRoundQuery = useQuery({
    queryKey: ['active-voting-round', groupId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('voting_rounds')
        .select('*')
        .eq('group_id', groupId)
        .eq('status', 'active')
        .maybeSingle()

      if (error) throw error
      return (data as unknown as VotingRound) ?? null
    },
    enabled: !!groupId,
  })

  // Propose round (Owner start round)
  const startRoundMutation = useMutation({
    mutationFn: async (durationMinutes: number) => {
      const startedAt = new Date().toISOString()
      const endsAt = new Date(Date.now() + durationMinutes * 60000).toISOString()

      const { data, error } = await supabase
        .from('voting_rounds')
        .insert({
          group_id: groupId,
          created_by: session?.user?.id,
          status: 'active',
          started_at: startedAt,
          ends_at: endsAt,
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-voting-round', groupId] })
    },
  })

  // Submit votes
  const castVoteMutation = useMutation({
    mutationFn: async ({
      roundId,
      mediaPoolId,
    }: {
      roundId: string
      mediaPoolId: string
    }) => {
      if (!session?.user?.id) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('votes')
        .insert({
          voting_round_id: roundId,
          user_id: session.user.id,
          group_media_pool_id: mediaPoolId,
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-voting-round', groupId] })
    },
  })

  return {
    activeRound: activeRoundQuery.data ?? null,
    isLoading: activeRoundQuery.isLoading,
    refetchActiveRound: activeRoundQuery.refetch,
    startVotingRound: startRoundMutation.mutateAsync,
    isStarting: startRoundMutation.isPending,
    castVote: castVoteMutation.mutateAsync,
    isCasting: castVoteMutation.isPending,
  }
}
