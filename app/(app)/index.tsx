import { useSdk } from "@/components/SdkProvider";
import { useAuthToken as useSession } from "@/components/AuthTokenProvider";
import { Market, MaxInt, Page, Playlist, PlaylistedTrack, QueryAdditionalTypes, SpotifyApi, Track, TrackItem, UserProfile, } from "@spotify/web-api-ts-sdk";
import { useEffect, useState, useTransition } from "react";
import * as SpotifyParse from "spotify-uri"

import {
  ActivityIndicator,
  Button,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

async function getAllPlaylistItems(sdk: SpotifyApi, playlist_id: string): Promise<PlaylistedTrack<Track>[]> {
  const playlist = await sdk.playlists.getPlaylist(playlist_id)

  let res: PlaylistedTrack<Track>[] = []

  for (let i = 0; i < playlist.tracks.total; i += 100) {
    const page = await sdk.playlists.getPlaylistItems(playlist_id, undefined, undefined, undefined, i, undefined)
    res.push(...page.items)
  }

  return res
}

async function removeAllItemsFromPlaylist(sdk: SpotifyApi, playlist_id: string) {

  const tracks = await getAllPlaylistItems(sdk, playlist_id)

  let uniqueUris: string[] = []
  for (const trackInfo of tracks) {
    if (!uniqueUris.find(uniqueUri => uniqueUri === trackInfo.track.uri)) {
      uniqueUris.push(trackInfo.track.uri)
    }
  }

  for (let i = 0; i < uniqueUris.length; i += 100) {
    await sdk.playlists.removeItemsFromPlaylist(playlist_id, {
      tracks: uniqueUris.map(uri => {
        return {
          uri: uri
        }
      }).slice(i, i + 100)
    })
  }
}

async function addAllItemsToPlaylist(sdk: SpotifyApi, playlist_id: string, uris: string[]) {
  for (let i = 0; i < uris.length; i += 100) {
    await sdk.playlists.addItemsToPlaylist(playlist_id, uris.slice(i, i + 100))
  }
}

async function getAllUsersPlaylists(sdk: SpotifyApi, user_id: string) {
  const currentUser = await sdk.currentUser.profile()
  const usersPlaylists = await sdk.playlists.getUsersPlaylists(currentUser.id)

  let res: Playlist<TrackItem>[] = []

  for (let i = 0; i < usersPlaylists.total; i += 100) {
    const page = await sdk.playlists.getUsersPlaylists(user_id, undefined, i)
    res.push(...page.items)
  }

  return res
}

export default function Index() {

  const sdk = useSdk()
  const [playlistsLinks, setPlaylistsLinks] = useState(["", ""])
  const [playlistsIds, setPlaylistsIds] = useState<[string, string]>(["", ""])
  const [targetPlaylistName, setTargetPlaylistName] = useState("")

  function setPlaylistId(num: 0 | 1) {
    if (num === 0) {
      try {
        const parse = SpotifyParse.parse(playlistsLinks[0])
        setPlaylistsIds([parse.id, playlistsIds[1]])
      } catch (e) {
        setPlaylistsIds(["", playlistsIds[1]])
      }
    } else {
      try {
        const parse = SpotifyParse.parse(playlistsLinks[1])
        setPlaylistsIds([playlistsIds[0], parse.id])
      } catch (e) {
        setPlaylistsIds([playlistsIds[0], ""])
      }
    }
  }

  async function clearTargetPlaylist() {
    const currentUser = await sdk.currentUser.profile()
    const userPlaylists = await getAllUsersPlaylists(sdk, currentUser.id)

    const playlist = userPlaylists.find(playlist => playlist.name === targetPlaylistName)

    if (playlist) {
      await removeAllItemsFromPlaylist(sdk, playlist.id)
    }
  }

  async function modifyTargetPlaylist() {
    const currentUser = await sdk.currentUser.profile()
    const userPlaylists = await getAllUsersPlaylists(sdk, currentUser.id)

    const playlist = userPlaylists.find(playlist => playlist.name === targetPlaylistName) ?? await sdk.playlists.createPlaylist(currentUser.id, {
      name: targetPlaylistName,
    })

    const playlist1 = await sdk.playlists.getPlaylist(playlistsIds[0])
    const playlist2 = await sdk.playlists.getPlaylist(playlistsIds[1])

    const tracks1 = await getAllPlaylistItems(sdk, playlist1.id)
    const tracks2 = await getAllPlaylistItems(sdk, playlist2.id)

    const [smallerPlaylist, biggerPlaylist] = tracks1.length < tracks2.length ? [tracks1, tracks2] : [tracks2, tracks1]

    const ratio = smallerPlaylist.length / biggerPlaylist.length

    let tracks = []
    tracks.push(...smallerPlaylist)
    for (const track of biggerPlaylist) {
      if (Math.random() <= ratio) {
        tracks.push(track)
      }
    }

    await addAllItemsToPlaylist(sdk, playlist.id, tracks.map(trackInfo => trackInfo.track.uri))
  }

  return (
    <View style={[styles.container]}>
      <View style={[styles.playlist, styles.subcontainer]}>
        <View style={[styles.playlistInfo]}>
          <Text>Playlist1</Text>
          <Text>Playlist-Id: {playlistsIds[0]}</Text>
        </View>
        <TextInput
          placeholder="Playlist1-Link"
          style={styles.linkInput}
          value={playlistsLinks[0]}
          onChange={({ nativeEvent: { text } }) => {
            setPlaylistsLinks([text, playlistsLinks[1]])
            setPlaylistId(0)
          }}
          onSubmitEditing={({ nativeEvent: { text } }) => {
            setPlaylistsLinks([text, playlistsLinks[1]])
            setPlaylistId(0)
          }}
        />
      </View>
      <View style={[styles.playlist, styles.subcontainer]}>
        <View style={[styles.playlistInfo]}>
          <Text>Playlist2</Text>
          <Text>Playlist-Id: {playlistsIds[1]}</Text>
        </View>
        <TextInput
          style={styles.linkInput}
          placeholder="Playlist2-Link"
          value={playlistsLinks[1]}
          onChange={({ nativeEvent: { text } }) => {
            setPlaylistsLinks([playlistsLinks[0], text])
            setPlaylistId(1)
          }}
          onSubmitEditing={({ nativeEvent: { text } }) => {
            setPlaylistsLinks([playlistsLinks[0], text])
            setPlaylistId(1)
          }}
        />
      </View>
      <View style={[styles.subcontainer, styles.target]}>
        <TextInput
          style={styles.linkInput}
          placeholder="Target-Playlist-Name"
          value={targetPlaylistName}
          onChangeText={setTargetPlaylistName}
        />
        <Button title="Clear" onPress={clearTargetPlaylist} disabled={!(targetPlaylistName)} />
        <Button title="Modify" onPress={modifyTargetPlaylist} disabled={!(playlistsIds[0] && playlistsIds[1] && targetPlaylistName)} />
      </View>
    </View >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 20,
    padding: 10,
    // alignItems: 'flex-start'
  },
  subcontainer: {
    backgroundColor: 'lightgrey',
    borderRadius: 10,
    padding: 10,
    gap: 10,
  },
  playlist: {
  },
  playlistInfo: {
  },
  linkInput: {
    width: 'auto',
    // alignSelf: 'flex-start',
    backgroundColor: 'white',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  target: {

  }
});
