import {
  StyleSheet,
  Button,
  View,
  Text,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useGlobalSearchParams, Link } from "expo-router";
import { useEffect } from "react";

export default function TabRedirectScreen() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
