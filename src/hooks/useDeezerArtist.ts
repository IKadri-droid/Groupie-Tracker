import { useQuery } from '@tanstack/react-query'

export const useDeezerArtist = (name: string) => {
    return useQuery({
        queryKey: ['deezer-artist', name],
        queryFn: () => fetch(`http://localhost:8080/api/deezer/search?name=${name}`).then(res => res.json()),
        enabled: !!name,
    })
}

export const useDeezerAlbums = (artistID: number) => {
    return useQuery({
        queryKey: ['deezer-albums', artistID],
        queryFn: () => fetch(`http://localhost:8080/api/deezer/albums?artistID=${artistID}`).then(res => res.json()),
        enabled: !!artistID,
    })
}

export const useDeezerTopTracks = (artistID: number) => {
    return useQuery({
        queryKey: ['deezer-top-tracks', artistID],
        queryFn: () => fetch(`http://localhost:8080/api/deezer/top-tracks?artistID=${artistID}`).then(res => res.json()),
        enabled: !!artistID,
    })
}