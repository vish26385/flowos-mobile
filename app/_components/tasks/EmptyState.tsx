import React from "react";
import { View, StyleSheet, Pressable, Platform } from "react-native";
import { Text, Button, useTheme } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";

export default function EmptyState() {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      {/* 📘 Illustration / Icon */}
      <Ionicons
        name="clipboard-outline"
        size={80}
        color={theme.colors.primary}
        style={{ marginBottom: 16 }}
      />

      {/* 🧭 Message */}
      <Text style={[styles.title, { color: theme.colors.onSurface }]}>
        You have no tasks yet
      </Text>

      <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
        Start by adding a new task to stay organized and productive.
      </Text>
            
      <Link
        href="/tasks/new"
        {...(Platform.OS === "web"
          ? { asChild: true }
          : { style: { textDecorationLine: "none" } })}
      >
        <Button
          mode="contained"
          icon="plus"
          style={{
            ...styles.addButton,
            backgroundColor: theme.colors.primary,
          }}
          labelStyle={{ fontWeight: "600", color: theme.colors.onPrimary }}
        >
          Add Your First Task
        </Button>
      </Link>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 80,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    opacity: 0.8,
    marginBottom: 20,
  },
  addButton: {
    borderRadius: 25,
    paddingHorizontal: 24,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
});
