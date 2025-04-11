import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "@clerk/clerk-react";
import { useRouter } from "expo-router";
import UserProfile from "@/components/UserProfile"; // Fixed capitalization
import Tabs from "@/components/Tabs";
import { usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Thread from "@/components/Thread";

type ProfileProps = {
  userId?: Id<"users">;
  showBackButton?: boolean;
};

const Profile = ({ userId, showBackButton = false }: ProfileProps) => {
  const { userProfile } = useUserProfile();
  const { top } = useSafeAreaInsets();

  const { signOut } = useAuth();

  const router = useRouter();

  const { results, status, loadMore } = usePaginatedQuery(
    api.messages.getThreads,
    { userId: userId || userProfile?._id },
    {
      initialNumItems: 5,
    }
  );

  return (
    <View style={[styles.container, { padding: top }]}>
      <FlatList
        data={results}
        renderItem={({ item }) => (
          <Thread
            thread={item as Doc<"messages"> & { creator: Doc<"users"> }}
          />
        )}
        ListEmptyComponent={
          <View style={{ alignItems: "center", padding: 20 }}>
            <Text style={{ fontSize: 16, color: "#666", fontWeight: "500" }}>
              You haven't posted anthing yet! 💭
            </Text>
          </View>
        }
        ItemSeparatorComponent={() => (
          <View
            style={{
              height: StyleSheet.hairlineWidth,
              backgroundColor: Colors.border,
            }}
          />
        )}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              {showBackButton ? (
                <TouchableOpacity onPress={() => router.back()}>
                  <Ionicons name="chevron-back" size={24} color="black" />
                </TouchableOpacity>
              ) : (
                <MaterialCommunityIcons name="web" size={24} />
              )}
              <View style={styles.headerIcons}>
                <Ionicons name="logo-instagram" size={24} color="black" />
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => signOut()}
                >
                  <Ionicons name="log-out-outline" size={24} color="black" />
                </TouchableOpacity>
              </View>
            </View>
            {userId && <UserProfile userId={userId} />}
            {!userId && userProfile && (
              <UserProfile userId={userProfile?._id} />
            )}
            <Tabs onTabChange={() => {}} />
          </>
        }
      />
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  separator: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});
