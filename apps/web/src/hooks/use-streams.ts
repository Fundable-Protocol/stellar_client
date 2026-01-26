import { useQuery } from '@tanstack/react-query';
import { fetchUserStreams } from '@/lib/api';
import { Stream } from '@/types';

export function useStreams(address: string | undefined) {
    return useQuery({
        queryKey: ['streams', address],
        queryFn: () => (address ? fetchUserStreams(address) : Promise.resolve([])),
        enabled: !!address,
        staleTime: 60 * 1000,
    });
}
