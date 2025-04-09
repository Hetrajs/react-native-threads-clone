import { Colors } from "@/constants/Colors";
import { useSSO } from "@clerk/clerk-expo";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router"; // Add this import

export default function Index() {
  const router = useRouter(); // Add this hook
  const facebookSSO = useSSO();
  const googleSSO = useSSO();

  const handleFacebookLogin = async () => {
    try {
      const { createdSessionId, setActive } = await facebookSSO.startSSOFlow({
        strategy: "oauth_facebook"
      });
      console.log("🔍 ~ Index ~ app/(public)/index.tsx:18 ~ createdSessionId:", createdSessionId)
      if(createdSessionId){
        await setActive!({session: createdSessionId});
        // Use a simpler path that matches your folder structure
        //@ts-ignore
        // router.replace("/(auth)/(tabs)/feed");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { createdSessionId, setActive } = await googleSSO.startSSOFlow({
        strategy: "oauth_google"
      });
      console.log("🔍 ~ Index ~ app/(public)/index.tsx:14 ~ createdSessionId:", createdSessionId)
      if(createdSessionId){
        await setActive!({session: createdSessionId});
        // Use a simpler path that matches your folder structure
        //@ts-ignore
        // router.replace("/(auth)/(tabs)/feed");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View
      style={style.container}
    >
      <Image
        source={require("@/assets/images/login.png")}
        style={style.loginImage}
      />
      <ScrollView contentContainerStyle={style.container}>
        <Text style={style.title}>How would you like to use threads?</Text>
        <View style={style.buttonContainer}>
        <TouchableOpacity style={style.loginButton} onPress={handleFacebookLogin}>
         <View style={style.loginButtonContent}>
            <Image
            source={require("@/assets/images/instagram_icon.webp")}
            style={style.loginButtonIcon}
            />
          <Text style={style.loginButtonText}>Continue with Instagram</Text>
          <Ionicons name="chevron-forward" size={24} color={Colors.border} />
         </View>
         <Text style={style.loginButtonSubtitle}>
          Login or create a Threads profile withy your Instagram account. With a Profile, you can post, interact and get personalised recommendations.
         </Text>
        </TouchableOpacity>

        <TouchableOpacity style={style.loginButton} onPress={handleGoogleLogin}>
         <View style={style.loginButtonContent}>
          <Text style={style.loginButtonText}>Continue with Google</Text>
          <Ionicons name="chevron-forward" size={24} color={Colors.border} />
         </View>
        </TouchableOpacity>

        <TouchableOpacity style={style.loginButton}>
         <View style={style.loginButtonContent}>
          <Text style={style.loginButtonText}>Use without a profile</Text>
          <Ionicons name="chevron-forward" size={24} color={Colors.border} />
         </View>
         <Text style={style.loginButtonSubtitle}>
          You can browse Threads without a profile, but won't be able to post, interact and get personalised recommendations.
         </Text>
        </TouchableOpacity>

        <TouchableOpacity>
          <Text style={style.switchAccountsButtonText}>Switch Accounts</Text>
        </TouchableOpacity>

        </View>
      </ScrollView>
    </View>
  );
}

const style = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    gap: 20,
    backgroundColor: Colors.background,
  },
  loginImage: {
    width: "100%",
    height: 350,
    resizeMode: "cover"
  },
  title: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 17
  },
  loginButton: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border
  },
  buttonContainer:{
    gap: 20
  },
  loginButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  loginButtonIcon: {
    width: 50,
    height: 50
  },
  loginButtonText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 15,
    flex: 1
  },
  loginButtonSubtitle: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    marginTop: 5,
    color:"#333"
  },
  switchAccountsButtonText: {
    fontSize: 14,
    color: Colors.border,
    alignSelf: "center"
  }
})