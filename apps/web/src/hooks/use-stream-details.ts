import { useQuery } from '@tanstack/react-query';
import { fetchStream } from '@/lib/api';

export function useStreamDetails(streamId: number | undefined) {
    return useQuery({
        queryKey: ['stream', streamId],
        queryFn: () => (streamId ? fetchStream(streamId) : Promise.resolve(null)),
        enabled: !!streamId,
    });
}
