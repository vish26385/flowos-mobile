import { useRef, useState } from "react";
import {
  View,
  TouchableOpacity,
  Alert,
  Appearance,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  TextInput as RNTextInput,
  ScrollView
} from "react-native";
import {
  Text,
  TextInput,
  Button,
  Card,
  useTheme,
  Provider as PaperProvider, 
  MD3LightTheme
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { debounceAsync } from "@/utils/debounce";
import { mapApiError } from "@/utils/errorMapper";

export default function ResetPassword() {
  const router = useRouter();
  const { resetPassword } = useAuth();

  // ✅ Hybrid Theme Fix 
  const colorScheme =
    Platform.OS === "web" ? "light" : Appearance.getColorScheme();
  const isDark = colorScheme === "dark";

  const emailRef = useRef<RNTextInput>(null);
  const tokenRef = useRef<RNTextInput>(null);
  const passwordRef = useRef<RNTextInput>(null);

  const params = useLocalSearchParams<{ email?: string; token?: string }>();
  const [email, setEmail] = useState((params.email as string) ?? "");
  const [token, setToken] = useState((params.token as string) ?? "");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    try {
      setLoading(true);
      await resetPassword(email.trim(), token.trim(), password);
      Alert.alert("Success", "Your password has been reset.", [
        {
          text: "OK",
          onPress: () => setTimeout(() => router.replace("/login"), 200),
        },
      ]);
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
    <PaperProvider theme={MD3LightTheme}>
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
                backgroundColor: isDark ? "#1C1A20" : "#FFFFFF",
                shadowOpacity: isDark ? 0.35 : 0.15,
              },
            ]}
          >
            <Card.Content>
              <Text
                style={[
                  styles.title,
                  { color: isDark ? "#EAEAEA" : "#222" },
                ]}
              >
                Reset Password
              </Text>

              <Text
                style={[
                  styles.subtitle,
                  { color: isDark ? "#B9B5C9" : "#666" },
                ]}
              >
                Enter your email, token, and new password to reset your account.
              </Text>

              {/* Email */}
              <TextInput
                label="Email"
                ref={emailRef}
                returnKeyType="next"
                onSubmitEditing={() => tokenRef.current?.focus()}
                mode="outlined"
                autoCapitalize="none"
                keyboardType="email-address"
                accessibilityLabel="Enter your email address"
                value={email}
                onChangeText={setEmail}
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
                    onSurfaceVariant: isDark ? "#C9BFFF" : "#333",
                    outline: isDark ? "#3A3840" : "#DDD",
                  },
                }}
              />

              {/* Token */}
              <TextInput
                label="Reset Token"
                ref={tokenRef}
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                mode="outlined"
                value={token}
                onChangeText={setToken}
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
                    onSurfaceVariant: isDark ? "#C9BFFF" : "#333",
                    outline: isDark ? "#3A3840" : "#DDD",
                  },
                }}
              />

              {/* Password */}
              <TextInput
                label="New Password"
                mode="outlined"
                accessibilityLabel="Enter your password"
                secureTextEntry={!showPwd}
                value={password}
                onChangeText={setPassword}
                right={
                  <TextInput.Icon
                    icon={showPwd ? "eye-off" : "eye"}
                    onPress={() => setShowPwd((s) => !s)}
                    color={isDark ? "#C5B8FF" : "#6F45FF"}
                  />
                }
                style={styles.input}
                outlineStyle={{
                  borderRadius: 12,
                  borderColor: isDark ? "#3A3840" : "#DDD",
                }}
                textColor={isDark ? "#EAEAEA" : "#222"}
                placeholderTextColor={isDark ? "#A9A9A9" : "#777"}
                ref={passwordRef}
                returnKeyType="done"
                onSubmitEditing={safeSubmit}
                theme={{
                  colors: {
                    primary: "#6F45FF",
                    onSurfaceVariant: isDark ? "#C9BFFF" : "#333",
                    outline: isDark ? "#3A3840" : "#DDD",
                  },
                }}
              />

              <Button
                mode="contained"
                onPress={safeSubmit}
                loading={loading}
                disabled={loading || !email || !token || !password}
                accessibilityLabel="Reset your FlowOS password"
                accessibilityHint="Updates your password using the provided reset token"
                style={[
                  styles.submitButton,
                  {
                    opacity: loading ? 0.6 : 1,
                    backgroundColor: "#6F45FF",
                  },
                ]}
                labelStyle={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: "#FFF",
                }}
              >
                Reset Password
              </Button>

              <TouchableOpacity
                onPress={() => router.replace("/login")}
                style={{ alignSelf: "center", marginTop: 16 }}
              >
                <Text
                  style={{
                    color: "#6F45FF",
                    fontSize: 15,
                    fontWeight: "500",
                  }}
                >
                  Back to login
                </Text>
              </TouchableOpacity>
            </Card.Content>
          </Card>
        </View>
       </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
    </PaperProvider>
  );
}

const screenHeight = Dimensions.get("window").height;

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    marginTop: screenHeight < 700 ? 24 : 0, // ✅ Add small safe top margin for compact phones
  },
  card: {
    width: "90%",
    borderRadius: 28,
    padding: 12,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 22,
  },
  input: {
    marginBottom: 14,
  },
  submitButton: {
    marginTop: 8,
    borderRadius: 14,
    paddingVertical: 6,
  },
});
