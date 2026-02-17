import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function useUser() {
  const { data, error, isLoading, mutate } = useSWR('/api/auth/me', fetcher)
  
  return {
    user: data?.user || null,
    isLoading,
    isError: !!error || (data && !data.user),
    mutate,
  }
}
