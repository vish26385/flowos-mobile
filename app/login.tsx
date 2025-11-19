import React, { useRef,useState } from "react";
import {
  View,
  Image,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
  TouchableOpacity,
  Alert,
  StyleSheet,
  TextInput as RNTextInput,
  ScrollView,
  Dimensions
} from "react-native";
import {
  Text,
  TextInput,
  Button,
  Card,
  HelperText,
  useTheme,
} from "react-native-paper";
import { useAuth } from "@/context/AuthContext";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { debounceAsync } from "@/utils/debounce";
import { mapApiError } from "@/utils/errorMapper";

export default function Login() {
  const { login } = useAuth();
  const theme = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isDark = theme.dark;

  // inside your component
  const emailRef = useRef<RNTextInput>(null);
  const passwordRef = useRef<RNTextInput>(null);

  const canSubmit = /\S+@\S+\.\S+/.test(email) && password.length >= 6;
    
  const onSubmit = async () => {
    setError(null);

    if (!canSubmit) {
      setError("Enter a valid email and password");
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
    }    
    catch (e: any) {
      Alert.alert("Error", mapApiError(e));
    }
    finally {
      setLoading(false);
    }
  };

  const safeSubmit = debounceAsync(onSubmit);

  return (
    <SafeAreaView
      style={[
        styles.safe,
        { backgroundColor: isDark ? "#141218" : "#F3F3F7" },
      ]}
    >
      <StatusBar style="light" backgroundColor="#6F45FF" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
        <View style={styles.container}>
          <Card
            mode="elevated"
            style={[
              styles.card,
              {
                // ✅ #3 card background contrast
                backgroundColor: isDark ? "#221F28" : "#FFFFFF",
                shadowOpacity: isDark ? 0.4 : 0.15,
              },
            ]}
          >
            <Card.Content>
              <Image
                source={require("../assets/icon.png")}
                style={styles.logo}
              />
              <Text
                style={[
                  styles.title,
                  { color: isDark ? "#A48BFF" : "#5A3EC8" },
                ]}
              >
                Welcome to FlowOS
              </Text>

              {/* ✅ #1 Brighter label color */}
              <TextInput
                label="Email"
                mode="outlined"
                accessibilityLabel="Enter your email address"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}  // 👈 jump to password
                ref={emailRef}
                style={styles.input}
                outlineStyle={{
                  borderRadius: 12,
                  borderColor: isDark ? "#3A3840" : "#DDD",
                }}
                textColor={isDark ? "#EAEAEA" : "#222"}
                placeholderTextColor={isDark ? "#A9A9A9" : "#777"}
                theme={{
                  colors: {
                    primary: "#6F45FF",
                    onSurfaceVariant: isDark ? "#BCAEFF" : "#333", // brighter label
                    outline: isDark ? "#3A3840" : "#DDD",
                  },
                }}
              />

              <TextInput
                label="Password"
                accessibilityLabel="Enter your password"
                mode="outlined"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPwd}                
                right={
                  <TextInput.Icon
                    icon={showPwd ? "eye-off" : "eye"}
                    onPress={() => setShowPwd((s) => !s)}
                    // ✅ #2 Brighter eye icon color
                    color={isDark ? "#A48BFF" : "#6F45FF"}
                  />
                }
                style={styles.input}
                outlineStyle={{
                  borderRadius: 12,
                  borderColor: isDark ? "#3A3840" : "#DDD",
                }}
                textColor={isDark ? "#EAEAEA" : "#222"}
                placeholderTextColor={isDark ? "#A9A9A9" : "#777"}
                returnKeyType="done"
                onSubmitEditing={safeSubmit}
                ref={passwordRef}
                theme={{
                  colors: {
                    primary: "#6F45FF",
                    onSurfaceVariant: isDark ? "#BCAEFF" : "#333", // brighter label
                    outline: isDark ? "#3A3840" : "#DDD",
                  },
                }}
              />

              <TouchableOpacity
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                onPress={() => {
                  Keyboard.dismiss(); // ✅ Close keyboard first (smoothly)
                  setTimeout(() => router.push("/forgot" as never), 100); // small delay to let animation finish
                }}
                //onPress={() => router.push("/forgot" as never)}
                style={styles.forgotLinkContainer}
              >
                <Text
                  style={{
                    color: "#6F45FF",
                    fontSize: 14,
                    textAlign: "right",
                  }}
                >
                  Forgot password?
                </Text>
              </TouchableOpacity>

              {error ? (
                <HelperText type="error" visible>
                  {error}
                </HelperText>
              ) : null}

              <Button
                mode="contained"
                onPress={safeSubmit}
                loading={loading}
                disabled={!canSubmit || loading}
                accessibilityLabel="Sign in to your FlowOS account"
                accessibilityHint="Authenticates you and opens your dashboard"
                style={[
                  styles.signInButton,
                  {
                    opacity: !canSubmit || loading ? 0.6 : 1,
                    backgroundColor: "#6F45FF",
                  },
                ]}
                labelStyle={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: "#FFF",
                }}
              >
                Sign in
              </Button>

              <TouchableOpacity
                onPress={() => router.replace("/register")}
                style={{ alignSelf: "center", marginTop: 16 }}
              >
                <Text
                  style={{
                    color: isDark ? "#EAEAEA" : "#555",
                    fontSize: 14,
                  }}
                >
                  Don’t have an account?{" "}
                  <Text style={{ color: "#6F45FF", fontWeight: "600" }}>
                    Register
                  </Text>
                </Text>
              </TouchableOpacity>
            </Card.Content>
          </Card>
        </View>
       </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const screenHeight = Dimensions.get("window").height;

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    marginTop: screenHeight < 700 ? 24 : 0, // ✅ Add small safe top margin for compact phones
  },
  card: {
    borderRadius: 28,
    padding: 8,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  logo: {
    width: 72,
    height: 72,
    alignSelf: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 20,
  },
  input: { marginBottom: 14 },
  forgotLinkContainer: {
    alignSelf: "flex-end",
    marginBottom: 6,
  },
  signInButton: {
    marginTop: 8,
    borderRadius: 14,
    paddingVertical: 6,
  },
});