import { useMutation, useQueryClient } from '@tanstack/react-query';
import { withdraw } from '@/lib/api';

export function useWithdraw() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: withdraw,
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['streams'] });
            queryClient.invalidateQueries({ queryKey: ['stream', variables.streamId] });
        },
    });
}
