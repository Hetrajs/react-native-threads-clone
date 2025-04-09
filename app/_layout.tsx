import { Slot, SplashScreen, Stack, useRouter, useSegments } from "expo-router";
import { ClerkLoaded, ClerkProvider, useAuth, useUser } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache"
import {
  useFonts,
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
} from "@expo-google-fonts/dm-sans"
import { useEffect } from "react";
import { ConvexReactClient } from "convex/react"
import { ConvexProviderWithClerk } from "convex/react-clerk"
import * as Sentry from "@sentry/react-native";
import Constants from 'expo-constants';

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!, {
  unsavedChangesWarning: false,
})

const clerkPublishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!


if (!clerkPublishableKey) throw new Error("No clerk publishable key found")

const navigationIntegration = Sentry.reactNavigationIntegration({
  enableTimeToInitialDisplay:
    Constants.executionEnvironment === 'storeClient', // Only in native builds, not in Expo Go.
});
Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN!,
  attachScreenshot: true,
  debug: false,
  tracesSampleRate: 1.0,
  _experiments: {
    profileSampleRate: 1.0,
    replaysSessionSampleRate: 1.0,
    replaysOnErrorSampleRate: 1.0
  },
  integrations: [navigationIntegration],
  enableNativeFramesTracking: true // Only in native builds, not in Expo Go.
});

SplashScreen.preventAutoHideAsync();

// Update the InitialLayout component
const InitialLayout = () => {
  const [fontsLoaded] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold
  })

  const { isLoaded, isSignedIn } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const user = useUser();

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync()
    }
  }, [fontsLoaded]);

  useEffect(() => {
    if (!isLoaded) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (isSignedIn && !inAuthGroup) {
      //@ts-ignore
      router.replace('/(auth)/(tabs)/feed');
    } else if (!isSignedIn && inAuthGroup) {
      router.replace('/(public)');
    }
  }, [isSignedIn, isLoaded, segments]);

  useEffect(() => {
    if (user && user.user) {
      Sentry.setUser({
        email: user.user.emailAddresses?.[0]?.emailAddress || "no-email",
        id: user.user.id
      });
    }
    else {
      Sentry.setUser(null);
    }
  }, [user])


  return (
    <Slot />
  )
}

const RootLayout = () => {
  return (
    <ClerkProvider publishableKey={clerkPublishableKey} tokenCache={tokenCache}>
      <ClerkLoaded>
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
          <InitialLayout />
        </ConvexProviderWithClerk>
      </ClerkLoaded>
    </ClerkProvider>
  );
}

export default Sentry.wrap(RootLayout);