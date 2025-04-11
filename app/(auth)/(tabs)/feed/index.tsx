import {
  StyleSheet,
  Text,
  View,
  RefreshControl,
  FlatList,
  Image,
} from "react-native";
import React, { useState } from "react";
import { usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Colors } from "@/constants/Colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ThreadComposer from "@/components/ThreadComposer";
import Thread from "@/components/Thread";
import { Doc } from "@/convex/_generated/dataModel";
import { useNavigation } from "expo-router";
import Animated, {
  runOnJS,
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useIsFocused } from "@react-navigation/native";

const Page = () => {
  const { results, status, loadMore } = usePaginatedQuery(
    api.messages.getThreads,
    {},
    {
      initialNumItems: 5,
    }
  );

  const [refreshing, setRefreshing] = useState(false);
  const { top } = useSafeAreaInsets();

  // Animation
  const navigation = useNavigation();
  const scrollOffset = useSharedValue(0);
  const tabBarHeight = useBottomTabBarHeight();
  const isFocused = useIsFocused();

  const updateTabBar = () => {
    let NewMarginBottom = 0;
    if (scrollOffset.value >= 0 && scrollOffset.value <= tabBarHeight) {
      NewMarginBottom = -scrollOffset.value;
    } else if (scrollOffset.value > tabBarHeight) {
      NewMarginBottom = -tabBarHeight;
    }
    navigation.getParent()?.setOptions({
      tabBarStyle: {
        marginBottom: NewMarginBottom,
      },
    });
  };

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      if (isFocused) {
        scrollOffset.value = event.contentOffset.y;
        runOnJS(updateTabBar)();
      }
    },
  });

  const onLoadMore = () => {
    loadMore(5);
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  return (
    <Animated.FlatList
      onScroll={scrollHandler}
      scrollEventThrottle={16}
      data={results}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => (
        <Thread thread={item as Doc<"messages"> & { creator: Doc<"users"> }} />
      )}
      keyExtractor={(item) => item._id}
      onEndReached={onLoadMore}
      onEndReachedThreshold={0.5}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      ItemSeparatorComponent={() => (
        <View
          style={{
            height: StyleSheet.hairlineWidth,
            backgroundColor: Colors.border,
          }}
        ></View>
      )}
      contentContainerStyle={{ paddingTop: top }}
      ListHeaderComponent={
        <View style={{ paddingTop: 16 }}>
          <Image
            source={require("@/assets/images/threads-logo-black.png")}
            style={{
              width: 40,
              height: 40,
              alignSelf: "center",
            }}
          />
          <ThreadComposer isPreview={true} />
        </View>
      }
    />
  );
};

export default Page;

const styles = StyleSheet.create({});
