import { useContext, createContext, type PropsWithChildren } from "react";
import { SpotifyApi } from "@spotify/web-api-ts-sdk";
import { useAuthToken } from "./AuthTokenProvider";
import { makeRedirectUri } from "expo-auth-session";

// We only consider the authenticated case, therefore nul is acceptable
const SdkContext = createContext<SpotifyApi>(null as any);

export function useSdk() {
  const value = useContext(SdkContext);
  if (process.env.NODE_ENV !== "production") {
    if (!value) {
      throw new Error("useSdk must be wrapped in a <AuthTokenProvider />");
    }
  }

  return value;
}

export function SdkProvider({ children }: PropsWithChildren) {
  const { authToken } = useAuthToken();

  const token = JSON.parse(authToken as string);

  const sdk = SpotifyApi.withAccessToken(
    process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID!,
    token
  );

  return <SdkContext.Provider value={sdk}>{children}</SdkContext.Provider>;
}
