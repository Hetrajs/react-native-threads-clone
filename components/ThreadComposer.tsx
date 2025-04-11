import {
  Image,
  InputAccessoryView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
  KeyboardAvoidingView,
  Alert,
  ScrollView,
} from "react-native";
import React, { useState } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { Stack, useRouter } from "expo-router";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Colors } from "@/constants/Colors";
import { MaterialIcons, Ionicons, FontAwesome6 } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { ImagePickerAsset } from "expo-image-picker";

type ThreadComposerProps = {
  isPreview?: boolean;
  isReply?: boolean;
  isAutoFocused?: boolean;
  threadId?: Id<"messages">;
};

const ThreadComposer = ({
  isPreview = false,
  isReply,
  threadId,
  isAutoFocused,
}: ThreadComposerProps) => {
  const router = useRouter();
  const [threadContent, setThreadContent] = useState("");
  const { userProfile } = useUserProfile();
  const [mediaFiles, setMediaFiles] = useState<ImagePickerAsset[]>([]);
  const addThread = useMutation(api.messages.addThreadMessage);
  const inputAccessoryViewID = "uniqueId";

  const generateUploadUrl = useMutation(api.messages.generateUploadUrl);

  const handleSubmit = async () => {
    const mediaIds = await Promise.all(mediaFiles.map(uploadMediaFile));
    addThread({
      threadId,
      content: threadContent,
      mediaFiles: mediaIds,
    });
    setThreadContent("");
    setMediaFiles([]);
    router.dismiss();
  };

  const removeThread = () => {
    setThreadContent("");
    setMediaFiles([]);
  };

  const handleCancel = () => {
    setThreadContent("");
    Alert.alert("Discard thread?", "", [
      {
        text: "Discard",
        style: "destructive",
        onPress: () => {
          router.dismiss();
        },
      },
      {
        text: "Save Draft",
        style: "cancel",
      },
      {
        text: "Cancel",
        style: "cancel",
      },
    ]);
  };

  const selectImage = async (type: "library" | "camera") => {
    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [1, 1],
    };

    try {
      let result;
      if (type === "library") {
        result = await ImagePicker.launchImageLibraryAsync(options);
      } else {
        result = await ImagePicker.launchCameraAsync(options);
      }

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setMediaFiles([...mediaFiles, result.assets[0]]);
      }
    } catch (error) {
      console.log("Error selecting image:", error);
    }
  };

  const uploadMediaFile = async (image: ImagePickerAsset) => {
    const uploadUrl = await generateUploadUrl();
    const response = await fetch(image.uri);
    const blob = await response.blob();
    const result = await fetch(uploadUrl, {
      method: "POST",
      body: blob,
      headers: {
        "Content-Type": image.mimeType!,
      },
    });
    const { storageId } = await result.json();
    return storageId;
  };

  // Render keyboard accessory content
  const renderKeyboardAccessory = () => (
    <View style={styles.keyboardAccessory}>
      <Text style={styles.keyboardAccessoryText}>
        {isReply
          ? "Everyone can reply and quote"
          : "Profiles that you follow can reply and quote"}
      </Text>
      <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
        <Text style={styles.submitButtonText}>POST</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <TouchableOpacity
      style={
        isPreview && {
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          pointerEvents: "box-only",
        }
      }
      onPress={() => router.push("/(auth)/(modal)/create")}
      activeOpacity={isPreview ? 0.7 : 1}
      disabled={!isPreview}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1 }}>
          <Stack.Screen
            options={{
              headerLeft: () => (
                <TouchableOpacity onPress={handleCancel} disabled={isPreview}>
                  <Text>Cancel</Text>
                </TouchableOpacity>
              ),
            }}
          />
          <View style={styles.topRow}>
            {userProfile && (
              <Image
                source={{
                  uri:
                    userProfile?.imageUrl ||
                    "https://www.shutterstock.com/shutterstock/photos/535853263/display_1500/stock-vector-profile-photo-vector-placeholder-pic-male-person-default-profile-gray-photo-picture-avatar-535853263.jpg",
                }}
                style={styles.avatar}
              />
            )}
            <View style={styles.centerContainer}>
              <Text style={styles.name}>
                {userProfile?.first_name} {userProfile?.last_name}
              </Text>
              <TextInput
                style={styles.input}
                placeholder={isReply ? "Reply to thread" : `What's new?`}
                value={threadContent}
                onChangeText={setThreadContent}
                multiline
                autoFocus={!isPreview}
                inputAccessoryViewID={inputAccessoryViewID}
                editable={!isPreview}
                pointerEvents={isPreview ? "none" : "auto"}
              />
              {mediaFiles.length > 0 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  scrollEnabled={!isPreview}
                >
                  {mediaFiles.map((file, index) => (
                    <View style={styles.mediaContainer} key={index}>
                      <Image
                        source={{ uri: file.uri }}
                        style={styles.mediaImage}
                      />
                      <TouchableOpacity
                        style={[
                          styles.deleteContainer,
                          { opacity: isPreview ? 0 : 1 },
                        ]}
                        onPress={() => {
                          setMediaFiles(
                            mediaFiles.filter((_, i) => i !== index)
                          );
                        }}
                        disabled={isPreview}
                      >
                        <Ionicons name="close" size={24} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              )}
              <View style={styles.iconRow}>
                <TouchableOpacity
                  style={[styles.iconButton, { opacity: isPreview ? 0.5 : 1 }]}
                  onPress={() => selectImage("library")}
                  disabled={isPreview}
                >
                  <Ionicons
                    name="images-outline"
                    size={24}
                    color={Colors.border}
                  />
                </TouchableOpacity>
                {/* Apply similar changes to other icon buttons */}
                <TouchableOpacity
                  style={[styles.iconButton, { opacity: isPreview ? 0.5 : 1 }]}
                  onPress={() => selectImage("camera")}
                  disabled={isPreview}
                >
                  <Ionicons
                    name="camera-outline"
                    size={24}
                    color={Colors.border}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.iconButton, { opacity: isPreview ? 0.5 : 1 }]}
                  disabled={isPreview}
                >
                  <MaterialIcons name="gif" size={34} color={Colors.border} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.iconButton, { opacity: isPreview ? 0.5 : 1 }]}
                  disabled={isPreview}
                >
                  <Ionicons
                    name="mic-outline"
                    size={24}
                    color={Colors.border}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.iconButton, { opacity: isPreview ? 0.5 : 1 }]}
                  disabled={isPreview}
                >
                  <FontAwesome6
                    name="hashtag"
                    size={24}
                    color={Colors.border}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.iconButton, { opacity: isPreview ? 0.5 : 1 }]}
                  disabled={isPreview}
                >
                  <Ionicons
                    name="stats-chart-outline"
                    size={24}
                    color={Colors.border}
                  />
                </TouchableOpacity>
              </View>
            </View>
            {threadContent.length !== 0 && (
              <TouchableOpacity
                style={[
                  styles.cancelButton,
                  {
                    opacity: isPreview ? 0 : 1,
                  },
                ]}
                onPress={removeThread}
                disabled={isPreview}
              >
                <Ionicons name="close" size={16} color={Colors.border} />
              </TouchableOpacity>
            )}
          </View>

          {/* Platform-specific keyboard accessory */}
          {Platform.OS === "ios" && isPreview === false ? (
            <InputAccessoryView nativeID={inputAccessoryViewID}>
              {renderKeyboardAccessory()}
            </InputAccessoryView>
          ) : (
            isPreview === false && (
              <View style={styles.androidAccessoryContainer}>
                {renderKeyboardAccessory()}
              </View>
            )
          )}
        </View>
      </KeyboardAvoidingView>
    </TouchableOpacity>
  );
};

export default ThreadComposer;

const styles = StyleSheet.create({
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
    padding: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignSelf: "flex-start",
  },
  centerContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
  },
  input: {
    fontSize: 16,
    maxHeight: 100,
  },
  iconRow: {
    flexDirection: "row",
    paddingVertical: 12,
  },
  iconButton: {
    marginRight: 16,
  },
  cancelButton: {
    marginLeft: 12,
    alignSelf: "flex-start",
  },
  androidAccessoryContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
  },
  keyboardAccessory: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    paddingLeft: 64,
  },
  keyboardAccessoryText: {
    flex: 1,
    color: Colors.border,
    fontSize: 12,
  },
  submitButton: {
    backgroundColor: "#000",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  mediaContainer: {
    marginRight: 10,
    marginTop: 10,
  },
  mediaImage: {
    width: 135,
    height: 220,
    borderRadius: 6,
    marginRight: 10,
    marginTop: 10,
  },
  deleteContainer: {
    position: "absolute",
    top: 15,
    right: 15,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 4,
    borderRadius: 12,
  },
});
