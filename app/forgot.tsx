import { useState } from "react";
import {
  View,
  TouchableOpacity,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions
} from "react-native";
import {
  Text,
  TextInput,
  Button,
  Card,
  useTheme,
} from "react-native-paper";
import { router } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { debounceAsync } from "@/utils/debounce";
import { mapApiError } from "@/utils/errorMapper";

export default function ForgotPassword() {
  const { requestPasswordReset } = useAuth();
  const theme = useTheme();
  const isDark = theme.dark;
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");

  const canSubmit = /\S+@\S+\.\S+/.test(email);

  const onSubmit = async () => {
    if (!canSubmit) {
      return Alert.alert("Invalid", "Enter a valid email.");
    }

    if (!email.trim()) {
      return Alert.alert("Required", "Please enter your email.");
    }
    try {
      setLoading(true);
      await requestPasswordReset(email.trim());      
      Alert.alert(
        "Check your email",
        "If the email exists, we’ve sent a reset link.",
        [
          {
            text: "OK",
            onPress: () => {
              // Slight delay ensures smooth transition without flicker
              setTimeout(() => {
                //router.replace("/login");
                router.back();
              }, 200);
            },
          },
        ]
      );
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
                // backgroundColor: isDark ? "#1C1A20" : "#FFFFFF",
                // shadowOpacity: isDark ? 0.25 : 0.15,
                // shadowColor: isDark ? "#000" : "#6F45FF33",
                backgroundColor: isDark ? "#221F28" : "#FFFFFF",
                shadowOpacity: isDark ? 0.4 : 0.15,
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
                Forgot Password
              </Text>

              <Text
                style={[
                  styles.subtitle,
                  { color: isDark ? "#B9B5C9" : "#666" },
                ]}
              >
                Enter your account email. We’ll send you a password reset link.
              </Text>

              <TextInput
                label="Email"
                accessibilityLabel="Enter your email address"
                mode="outlined"
                autoCapitalize="none"
                keyboardType="email-address"
                returnKeyType="done"
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
                  roundness: 12,
                }}
              />

              <Button
                mode="contained"
                onPress={safeSubmit}
                loading={loading}
                disabled={loading || !email}
                accessibilityLabel="Send password reset link"
                accessibilityHint="Sends a link to your email to reset your password"
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
                Send Reset Link
              </Button>

              <TouchableOpacity
                onPress={() => router.back()}
                style={{ alignSelf: "center", marginTop: 16 }}
              >
                <Text
                  style={{
                    color: isDark ? "#A48BFF" : "#6F45FF",
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
  );
}

const screenHeight = Dimensions.get("window").height;

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center", // ✅ better centering
    padding: 24,
    marginTop: screenHeight < 700 ? 24 : 0, // ✅ Add small safe top margin for compact phones
  },
  card: {
    width: "90%", // ✅ balanced layout width
    borderRadius: 28,
    padding: 12,
    elevation: 10,
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
    marginBottom: 16,
  },
  submitButton: {
    marginTop: 8,
    borderRadius: 14,
    paddingVertical: 6,
  },
});