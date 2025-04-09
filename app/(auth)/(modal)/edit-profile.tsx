import { Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Colors } from '@/constants/Colors';
import { ImagePickerAsset } from "expo-image-picker"
import * as ImagePicker from 'expo-image-picker';

const Page = () => {
  const { biostring, linkstring, userId, imageUrl } = useLocalSearchParams<{
    biostring: string,
    linkstring: string,
    userId: string,
    imageUrl: string
  }>();

  const [bio, setBio] = useState(biostring);
  const [link, setLink] = useState(linkstring);
  const updateUser = useMutation(api.users.updateUser);
  const router = useRouter();

  const [selectedImage, setSelectedImage] = useState<ImagePickerAsset | null>(null);


  const onDone = async () => {
    await updateUser({
      _id: userId as Id<'users'>,
      bio,
      websiteUrl: link,
    });
    router.dismiss();
  }

  const pickImage = async () => {
    Alert.alert(
      'Change Profile Picture',
      'Choose an option',
      [
        {
          text: 'Take Photo',
          onPress: async () => {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
              alert('Sorry, we need camera permissions to make this work!');
              return;
            }
            
            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: ['images'],
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.7,
            });
            
            if (!result.canceled) {
              setSelectedImage(result.assets[0]);
            }
          }
        },
        {
          text: 'Choose from Gallery',
          onPress: async () => {
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ['images'],
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.7,
            });
            
            if (!result.canceled) {
              setSelectedImage(result.assets[0]);
            }
          }
        },
        {
          text: 'Cancel',
          style: 'cancel'
        },
      ]
    );
  }

  return (
    <View>
      <Stack.Screen
        options={{
          headerRight: () => (
            <TouchableOpacity onPress={onDone}>
              <Text>Done</Text>
            </TouchableOpacity>
          )
        }}
      />
     <TouchableOpacity onPress={pickImage}>
     {selectedImage ? (
        <Image
          source={{ uri: selectedImage.uri }}
          style={styles.image}
        />
      ) : (
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
        />
      )}
     </TouchableOpacity>
      <View style={styles.section}>
        <Text style={styles.label}>Bio</Text>
        <TextInput
          value={bio}
          onChangeText={setBio}
          style={styles.bioInput}
          multiline
          numberOfLines={4}
          textAlignVertical='top'
          placeholder='Tell us something about yourself...'
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Link</Text>
        <TextInput
          value={link}
          onChangeText={setLink}
          placeholder='https://www.example.com/'
          autoCapitalize='none'
        />
      </View>
    </View>
  )
}

export default Page

const styles = StyleSheet.create({
  section: {
    marginBottom: 16,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: 4,
    padding: 10,
    margin: 16
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: "center"
  },
  bioInput: {
    fontSize: 14,
    fontWeight: "500",
    height: 100
  }
})