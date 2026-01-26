import { useMutation, useQueryClient } from '@tanstack/react-query';
import { distribute } from '@/lib/api';

export function useDistribute() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: distribute,
        onSuccess: () => {
            // Invalidate relevant queries (e.g., balances if we had them)
            queryClient.invalidateQueries({ queryKey: ['streams'] });
        },
    });
}
