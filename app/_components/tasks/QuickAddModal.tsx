import React, { useState, useEffect, useMemo } from "react";
import { View, StyleSheet, Platform } from "react-native";
import {
  Portal,
  Modal,
  TextInput,
  Button,
  SegmentedButtons,
  useTheme,
} from "react-native-paper";
//import debounce from "lodash.debounce";
//import { suggestPriority } from "@/hooks/aiSuggestions"; // 🧠 AI helper

type Props = {
  visible: boolean;
  onDismiss: () => void;
  onAdd: (title: string, priority: number) => void;
};

export default function QuickAddModal({ visible, onDismiss, onAdd }: Props) {
  const theme = useTheme();
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("2"); // default = medium
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  //const [manualChange, setManualChange] = useState(false);
  
  // // 🧠 Debounced AI suggestion logic
  // const handleAIPriority = async (text: string) => {
  //   if (!text.trim()) return;
  //   setAiLoading(true);
  //   const suggestion = await suggestPriority(text.trim());
  //   if (!manualChange) {
  //     setPriority(String(suggestion || "2"));
  //   }
  //   setAiLoading(false);
  // };

  // // const debouncedSuggest = useMemo(() => debounce(handleAIPriority, 600), []);

  // // Run suggestion whenever title changes
  // useEffect(() => {
  //   if (title.trim()) debouncedSuggest(title);
  // }, [title]);

  // // Reset modal state on close
  // useEffect(() => {
  //   if (!visible) {
  //     //setLoading(false);
  //     setTitle("");
  //     setPriority("2");
  //     setManualChange(false);
  //     setAiLoading(false);
  //   }
  // }, [visible]);

  // Handle Add click
  const handleAdd = () => {
    if (!title.trim()) return;
    onAdd(title.trim(), Number(priority));
    setTitle("");
    setPriority("2");
    onDismiss();
  };

  // //Handle Add click
  // const handleAdd = async () => {
  //   if (!title.trim()) return;
  //   setLoading(true);
  //   try {
  //       const aiPriority = await suggestPriority(title.trim());
  //       onAdd(title.trim(), Number(aiPriority || priority));
  //       setTitle("");
  //       setPriority("2");
  //   } catch (err) {
  //       console.error("AI suggestion failed:", err);
  //   } finally {
  //       setLoading(false); // ✅ ensure reset
  //       onDismiss();
  //   }
  // };

  // 🎨 Adaptive colors
  const cancelBg = theme.dark ? "#2C2C2C" : "#E8E8E8";
  const cancelText = theme.dark ? theme.colors.onSurface : "#222";
  const modalBg = theme.dark ? "#1C1C1E" : "#FFFFFF";

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        overlayAccessibilityLabel="Add task modal"
        contentContainerStyle={[
          styles.modalContainer,
          {
            backgroundColor: modalBg,
            borderColor: theme.colors.outlineVariant,
            borderWidth: Platform.OS === "web" ? 0.5 : 0,
            shadowColor: theme.colors.primary,
          },
        ]}
      >
        {/* ✏️ Title input */}
        <TextInput
          label="Task title"
          value={title}
          onChangeText={(text) => {
            setTitle(text);
            //setManualChange(false); // allow AI to re-suggest
          }}
          mode="outlined"
          style={styles.input}
          outlineColor={theme.colors.outlineVariant}
          activeOutlineColor={theme.colors.primary}
        />

        {/* 🎯 Priority selector (live AI hint) */}
        <SegmentedButtons
          value={priority}
          onValueChange={(val) => {
            setPriority(val);
            //setManualChange(true); // user overrides AI
          }}
          buttons={[
            { value: "1", label: "Low" },
            { value: "2", label: "Med" },
            { value: "3", label: "High" },
          ]}
          // buttons={[
          //   {
          //     value: "1",
          //     label: aiLoading && priority === "1" ? "Low • 🔄" : "Low",
          //   },
          //   {
          //     value: "2",
          //     label: aiLoading && priority === "2" ? "Med • 🔄" : "Med",
          //   },
          //   {
          //     value: "3",
          //     label: aiLoading && priority === "3" ? "High • 🔄" : "High",
          //   },
          // ]}
          style={styles.segment}
        />

        {/* 🧭 Buttons */}
        <View style={styles.btnRow}>
          <Button
            mode="contained-tonal"
            onPress={onDismiss}
            style={[styles.cancelBtn, { backgroundColor: cancelBg }]}
            textColor={cancelText}
          >
            Cancel
          </Button>

          <Button
            mode="contained"
            onPress={handleAdd}
            loading={loading}
            disabled={loading || !title.trim()}
            style={[styles.addBtn, { backgroundColor: theme.colors.primary }]}
            labelStyle={{ color: theme.colors.onPrimary, fontWeight: "600" }}
          >
            {/* {loading ? "Thinking..." : "Add"} */}
            Add
          </Button>
        </View>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    margin: 24,
    borderRadius: 16,
    padding: 20,
    elevation: 6,
  },
  input: { marginBottom: 12 },
  segment: { marginBottom: 20 },
  btnRow: { flexDirection: "row", justifyContent: "flex-end", gap: 12 },
  cancelBtn: { borderRadius: 8 },
  addBtn: { borderRadius: 8 },
});