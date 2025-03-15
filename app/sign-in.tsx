import { StyleSheet, Button, View, Text } from "react-native";

import * as WebBrowser from "expo-web-browser";
import {
  makeRedirectUri,
  useAuthRequest,
  useAuthRequestResult,
} from "expo-auth-session";
import { useEffect, useState, useTransition } from "react";
import { SpotifyApi, AccessToken } from "@spotify/web-api-ts-sdk";
import { useAuthToken as useSession } from "@/components/AuthTokenProvider";
import { router } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";

WebBrowser.maybeCompleteAuthSession();

// Endpoint
const discovery = {
  authorizationEndpoint: "https://accounts.spotify.com/authorize",
  tokenEndpoint: "https://accounts.spotify.com/api/token",
};

export default function SignIn() {

  const redirectUri = makeRedirectUri({
    scheme: "spotify-util",
    path: "redirect",
  });

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID!,
      scopes: [
        "user-library-modify",
        "user-library-read",
        "user-read-email",
        "playlist-read-private",
        "playlist-read-collaborative",
        "playlist-modify-public",
        "playlist-modify-private",
      ],
      // To follow the "Authorization Code Flow" to fetch token after authorizationEndpoint
      // this must be set to false
      usePKCE: true,
      redirectUri: redirectUri,
    },
    discovery
  );

  const { setAuthToken } = useSession();

  useEffect(() => {
    if (response?.type === "success") {
      const { code } = response.params;

      fetch(discovery.tokenEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID!,
          grant_type: "authorization_code",
          code,
          redirect_uri: redirectUri,
          code_verifier: request?.codeVerifier!,
        }),
      }).then(async function (res) {
        const resJSON = await res.json();
        setAuthToken(JSON.stringify(resJSON));
        router.replace("/");
      });
    }
  }, [response]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <FontAwesome
        name="spotify"
        size={36}
        color="black"
        disabled={!request}
        onPress={() => {
          promptAsync();
        }}
      />
    </View>
  );
}
