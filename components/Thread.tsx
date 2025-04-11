import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Doc } from "@/convex/_generated/dataModel";
import { Feather, Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

type ThreadProps = {
  thread: Doc<"messages"> & {
    creator: Doc<"users">;
  };
};

const Thread = ({ thread }: ThreadProps) => {
  const {
    content,
    commentCount,
    creator,
    websiteUrl,
    retweetCount,
    mediaFiles,
    likeCount,
  } = thread;
  
  const likeThread = useMutation(api.messages.likeThread);
  const hasLiked = useQuery(api.messages.hasUserLikedThread, { 
    threadId: thread._id 
  });
  
  // Local state to show immediate UI feedback
  const [optimisticLikeCount, setOptimisticLikeCount] = useState(likeCount || 0);
  const [optimisticHasLiked, setOptimisticHasLiked] = useState(false);

  // Update optimistic state when the real data comes in
  useEffect(() => {
    if (hasLiked !== undefined) {
      setOptimisticHasLiked(hasLiked);
    }
  }, [hasLiked]);

  // Update optimistic like count when thread changes
  useEffect(() => {
    setOptimisticLikeCount(likeCount || 0);
  }, [likeCount]);

  const handleLike = () => {
    // Optimistic update
    setOptimisticHasLiked(!optimisticHasLiked);
    setOptimisticLikeCount(optimisticHasLiked ? 
      Math.max(0, optimisticLikeCount - 1) : 
      optimisticLikeCount + 1
    );
    
    // Actual mutation
    likeThread({ threadId: thread._id });
  };
  
  return (
    <View style={styles.container}>
      <Image
        source={{
          uri:
            creator.imageUrl ||
            "https://www.shutterstock.com/shutterstock/photos/535853263/display_1500/stock-vector-profile-photo-vector-placeholder-pic-male-person-default-profile-gray-photo-picture-avatar-535853263.jpg",
        }}
        style={styles.avatar}
      />
      <View style={{ flex: 1 }}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.headerTextName}>
              {creator.first_name} {creator.last_name}
            </Text>
            <Text style={styles.timestamp}>
              {new Date(thread._creationTime).toLocaleDateString()}
            </Text>
          </View>
          <Ionicons
            name="ellipsis-horizontal"
            size={24}
            color={Colors.border}
          />
        </View>
        <Text style={styles.content}>{content}</Text>
        {mediaFiles && mediaFiles.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.mediaContainer}
          >
            {mediaFiles.map((imageUrl, index) => (
              <Image
                key={index}
                source={{ uri: imageUrl }}
                style={styles.mediaImages}
              />
            ))}
          </ScrollView>
        )}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleLike}
          >
            <Ionicons 
              name={optimisticHasLiked ? "heart" : "heart-outline"} 
              size={24} 
              color={optimisticHasLiked ? "red" : "black"} 
            />
            <Text style={styles.actionText}>{optimisticLikeCount}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="chatbubble-outline" size={24} color="black" />
            <Text style={styles.actionText}>{commentCount}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="repeat-outline" size={24} color="black" />
            <Text style={styles.actionText}>{retweetCount}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Feather name="send" size={22} color="black" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default Thread;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flexDirection: "row",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  headerText: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  headerTextName: {
    fontWeight: "bold",
    marginRight: 5,
    gap: 4,
    alignItems: "center",
    fontSize: 16,
  },
  timestamp: {
    color: "#777",
    fontSize: 12,
  },
  content: {
    fontSize: 16,
    marginBottom: 10,
  },
  actions: {
    flexDirection: "row",
    marginTop: 10,
    gap: 16,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionText: {
    marginLeft: 5,
  },
  mediaImages: {
    width: 200,
    height: 250,
    borderRadius: 10,
    marginBottom: 10,
  },
  mediaContainer: {
    paddingRight: 10,
    gap: 14,
  },
});
