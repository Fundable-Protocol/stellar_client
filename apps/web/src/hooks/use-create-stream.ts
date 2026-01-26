import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createStream } from '@/lib/api';

export function useCreateStream() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createStream,
        onMutate: async (newStream) => {
            await queryClient.cancelQueries({ queryKey: ['streams'] });
            const previousStreams = queryClient.getQueryData(['streams']);

            // Optimistically update
            queryClient.setQueryData(['streams'], (old: any[]) => {
                return old ? [...old, { ...newStream, id: -1, status: 'Active' }] : [];
            });

            return { previousStreams };
        },
        onError: (err, newStream, context) => {
            queryClient.setQueryData(['streams'], context?.previousStreams);
        },
        onSuccess: (newStreamId, variables) => {
            // Invalidate queries to refresh data
            queryClient.invalidateQueries({ queryKey: ['streams'] });
        },
    });
}
