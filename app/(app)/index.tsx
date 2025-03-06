import { useSdk } from "@/components/SdkProvider";
import { useAuthToken as useSession } from "@/components/AuthTokenProvider";
import { UserProfile } from "@spotify/web-api-ts-sdk";
import { useEffect, useState, useTransition } from "react";
import {
  ActivityIndicator,
  SectionList,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function Index() {
  const { setAuthToken } = useSession();
  const sdk = useSdk();

  const [isPending, startTransition] = useTransition();
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    sdk.currentUser.profile().then(setUser);
  }, []);

  async function addPlaylist() {
    setSections([
      ...sections,
      {
        title: `Playlist${sections.length}`,
        data: [...Array(1).keys()].map(String),
      },
    ]);
  }

  async function createPlaylist() {
    const user_id = (await sdk.currentUser.profile()).id;
    sdk.playlists.createPlaylist(user_id, {
      name: "Spacken",
    });
  }

  enum Arranging {
    NORMALVERTEILT,
    ABSOLUT,
  }

  type PlaylistCollection = {
    arrangment: Arranging;
    absolut?: number;
    children: (PlaylistCollection | Playlist)[];
  };

  type Playlist = {
    url: string;
  };

  const [sections, setSections] = useState<(PlaylistCollection | Playlist)[]>(
    []
  );

  return (
    <View style={[styles.container]}>
      <Text onPress={addPlaylist}>Add Playlist</Text>
      <SectionList/>
    </View>
  );
}

// function

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  item: {
    backgroundColor: "#f9c2ff",
    padding: 20,
    marginVertical: 8,
  },
  header: {
    fontSize: 32,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
  },
});
