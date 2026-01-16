import { useQuery } from '@tanstack/react-query'
import { searchArtist, getAlbums, getTopTracks } from '../api/deezerApi'

export const useDeezerArtist = (name: string) => {
    return useQuery({
        queryKey: ['deezer-artist', name],
        queryFn: () => searchArtist(name),
        enabled: !!name,
    })
}

export const useDeezerAlbums = (artistID: number) => {
    return useQuery({
        queryKey: ['deezer-albums', artistID],
        queryFn: () => getAlbums(artistID),
        enabled: !!artistID,
    })
}

export const useDeezerTopTracks = (artistID: number) => {
    return useQuery({
        queryKey: ['deezer-top-tracks', artistID],
        queryFn: () => getTopTracks(artistID),
        enabled: !!artistID,
    })
}
