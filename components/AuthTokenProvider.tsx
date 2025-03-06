import { useContext, createContext, type PropsWithChildren } from "react";
import { useStorageState } from "@/hooks/useStorageState";

const AuthContext = createContext<{
  setAuthToken: (authToken: string | null) => void;
  authToken?: string | null;
  isLoading: boolean;
}>({
  setAuthToken: () => null,
  authToken: null,
  isLoading: false,
});

// This hook can be used to access the user info.
export function useAuthToken() {
  const value = useContext(AuthContext);
  if (process.env.NODE_ENV !== "production") {
    if (!value) {
      throw new Error("useSession must be wrapped in a <SessionProvider />");
    }
  }

  return value;
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [[isLoading, authToken], setAuthToken] = useStorageState("auth-token");

  return (
    <AuthContext.Provider
      value={{
        setAuthToken: (authToken) => {
          // Perform sign-in logic here
          setAuthToken(authToken);
        },
        authToken: authToken,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
