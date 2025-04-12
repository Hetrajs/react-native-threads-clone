import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React from "react";
import { useLocalSearchParams } from "expo-router";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import Thread from "@/components/Thread";

const Page = () => {
  const { id } = useLocalSearchParams();
  const thread = useQuery(api.messages.getThreadById, {
    messageId: id as Id<"messages">,
  });
  return (
    <ScrollView>
      {thread ? (
        <Thread
          thread={thread as Doc<"messages"> & { creator: Doc<"users"> }}
        />
      ) : (
        <ActivityIndicator />
      )}
    </ScrollView>
  );
};

export default Page;

const styles = StyleSheet.create({});
