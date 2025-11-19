import React, { useRef, useState } from "react";
import {
  View,
  Image,
  Platform,
  KeyboardAvoidingView,
  TouchableOpacity,
  StyleSheet,
  TextInput as RNTextInput,
  ScrollView,
} from "react-native";
import {
  Text,
  TextInput,
  Button,
  Card,
  useTheme,
} from "react-native-paper";
import { useAuth } from "@/context/AuthContext";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Toast from "react-native-root-toast";
import { debounceAsync } from "@/utils/debounce";
import { mapApiError } from "@/utils/errorMapper";

export default function Register() {
  const { register } = useAuth();
  const theme = useTheme();
  const isDark = theme.dark;

  const nameRef = useRef<RNTextInput>(null);
  const emailRef = useRef<RNTextInput>(null);
  const passwordRef = useRef<RNTextInput>(null);
  const confirmRef = useRef<RNTextInput>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  const canSubmit =
    fullName.trim().length > 0 &&
    /\S+@\S+\.\S+/.test(email) &&
    password.length >= 6 &&
    confirmPassword === password;

  const onSubmit = async () => {
    setError(null);

    if (!canSubmit) {
      setError("Please fill all fields correctly.");
      return;
    }

    setLoading(true);
    try {
      await register(fullName.trim(), email.trim(), password);

      // ✅ Show success toast animation
      Toast.show("🎉 Welcome to FlowOS! Your account is ready.", {
        duration: Toast.durations.SHORT,
        position: Toast.positions.BOTTOM - 40,
        shadow: true,
        animation: true,
        backgroundColor: "#6F45FF",
        textColor: "#fff",
      });

    } catch (e: any) {
      const msg = mapApiError(e);
      Toast.show(msg, {
        duration: Toast.durations.SHORT,
        position: Toast.positions.BOTTOM,
        backgroundColor: "#FF4B4B",
        textColor: "#fff",
      });
    } finally {
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

      {/* ✅ KeyboardAvoidingView + ScrollView fix */}
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
                  Create Your FlowOS Account
                </Text>

                <Text
                  style={[
                    styles.subtitle,
                    { color: isDark ? "#B9B5C9" : "#666" },
                  ]}
                >
                  Enter your details to start your FlowOS journey.
                </Text>

                {/* Full Name */}
                <TextInput
                  label="Full Name"
                  ref={nameRef}
                  returnKeyType="next"
                  onSubmitEditing={() => emailRef.current?.focus()}
                  accessibilityLabel="Full name"
                  accessibilityHint="Enter your full name as it will appear in FlowOS"
                  mode="outlined"
                  value={fullName}
                  onChangeText={setFullName}
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
                      onSurfaceVariant: isDark ? "#BCAEFF" : "#333",
                      outline: isDark ? "#3A3840" : "#DDD",
                    },
                  }}
                />

                {/* Email */}
                <TextInput
                  label="Email"
                  ref={emailRef}
                  returnKeyType="next"
                  onSubmitEditing={() => passwordRef.current?.focus()}
                  accessibilityLabel="Email address"
                  accessibilityHint="Enter your email address to register your FlowOS account"
                  mode="outlined"
                  autoCapitalize="none"
                  keyboardType="email-address"
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
                      onSurfaceVariant: isDark ? "#BCAEFF" : "#333",
                      outline: isDark ? "#3A3840" : "#DDD",
                    },
                  }}
                />

                {/* Password */}
                <TextInput
                  label="Password"
                  ref={passwordRef}
                  returnKeyType="next"
                  onSubmitEditing={() => confirmRef.current?.focus()}
                  accessibilityLabel="Password"
                  accessibilityHint="Enter a password with at least six characters"
                  mode="outlined"
                  secureTextEntry={!showPwd}
                  value={password}
                  onChangeText={setPassword}
                  right={
                    <TextInput.Icon
                      icon={showPwd ? "eye-off" : "eye"}
                      onPress={() => setShowPwd((s) => !s)}
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
                  theme={{
                    colors: {
                      primary: "#6F45FF",
                      onSurfaceVariant: isDark ? "#BCAEFF" : "#333",
                      outline: isDark ? "#3A3840" : "#DDD",
                    },
                  }}
                />

                {/* Confirm Password */}
                <TextInput
                  label="Confirm Password"
                  ref={confirmRef}
                  returnKeyType="done"
                  onSubmitEditing={safeSubmit}
                  accessibilityLabel="Confirm password"
                  accessibilityHint="Re-enter your password to confirm"
                  mode="outlined"
                  secureTextEntry={!showConfirmPwd}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  right={
                    <TextInput.Icon
                      icon={showConfirmPwd ? "eye-off" : "eye"}
                      onPress={() => setShowConfirmPwd((s) => !s)}
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
                  theme={{
                    colors: {
                      primary: "#6F45FF",
                      onSurfaceVariant: isDark ? "#BCAEFF" : "#333",
                      outline: isDark ? "#3A3840" : "#DDD",
                    },
                  }}
                />

                {error ? (
                  <Text style={styles.errorText}>{error}</Text>
                ) : null}

                <Button
                  mode="contained"
                  accessibilityLabel="Register your FlowOS account"
                  accessibilityHint="Creates your FlowOS account and signs you in automatically"
                  onPress={safeSubmit}
                  loading={loading}
                  disabled={!canSubmit || loading}
                  style={[
                    styles.submitButton,
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
                  Register
                </Button>

                <TouchableOpacity
                  onPress={() => router.replace("/login")}
                  accessibilityLabel="Already have an account? Sign in"
                  accessibilityHint="Navigates back to the login screen"
                  style={{ alignSelf: "center", marginTop: 16 }}
                >
                  <Text
                    style={{
                      color: isDark ? "#EAEAEA" : "#555",
                      fontSize: 14,
                    }}
                  >
                    Already have an account?{" "}
                    <Text style={{ color: "#6F45FF", fontWeight: "600" }}>
                      Sign in
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

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
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
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 22,
  },
  input: { marginBottom: 14 },
  errorText: {
    color: "#FF4B4B",
    fontSize: 13,
    textAlign: "center",
    marginBottom: 8,
  },
  submitButton: {
    marginTop: 8,
    borderRadius: 14,
    paddingVertical: 6,
  },
});
