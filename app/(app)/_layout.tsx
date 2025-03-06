import { Text, View, StyleSheet } from "react-native";
import { Link, Redirect, Stack } from "expo-router";
import {
  SessionProvider,
  useAuthToken as useSession,
} from "@/components/AuthTokenProvider";
import { SdkProvider } from "@/components/SdkProvider";
import FontAwesome from "@expo/vector-icons/FontAwesome";

export default function AppLayout() {
  const { authToken: session, isLoading, setAuthToken } = useSession();

  // You can keep the splash screen open, or render a loading screen like we do here.
  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  // Only require authentication within the (app) group's layout as users
  // need to be able to access the (auth) group and sign in again.
  if (!session) {
    // On web, static rendering will stop here as the user is not authenticated
    // in the headless Node process that the pages are rendered in.
    return <Redirect href="/sign-in" />;
  }

  // This layout can be deferred because it's not the root layout.
  return (
    <SdkProvider>
      <Stack
        screenOptions={{
          headerRight(props) {
            return (
              <View style={[styles.headerRightContainer]}>
                <FontAwesome
                  name="sign-out"
                  size={24}
                  color="black"
                  onPress={() => setAuthToken(null)}
                />
              </View>
            );
          },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: "Home",
          }}
        />
      </Stack>
    </SdkProvider>
  );
}

const styles = StyleSheet.create({
  headerRightContainer: {
    // backgroundColor: "red",
    paddingRight: 20,
  },
});
