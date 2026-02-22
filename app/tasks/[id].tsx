// import React, { useEffect, useState, useMemo, useRef } from "react";
// import {
//   KeyboardAvoidingView,
//   Platform,
//   ScrollView,
//   TouchableOpacity,
//   View,
//   Alert,
//   Animated,
// } from "react-native";
// import {
//   ActivityIndicator,
//   Button,
//   Card,
//   HelperText,
//   SegmentedButtons,
//   Text,
//   TextInput,
//   useTheme,
//   Icon
// } from "react-native-paper";
// import DateTimePicker from "@react-native-community/datetimepicker";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { useLocalSearchParams, router } from "expo-router";
// import dayjs from "dayjs";
// import debounce from "lodash.debounce";
// import { useTasks } from "@/context/TaskContext";
// import { Task, UpdateTaskRequest } from "@/types/task";
// import SuccessCelebration from "@/app/_components/common/SuccessCelebration";
// import { suggestPriority } from "@/hooks/aiSuggestions"; // 🧠 same import as new.tsx

// type Priority = -1 | 1 | 2 | 3;

// export default function EditTask() {
//   const theme = useTheme();
//   const { id } = useLocalSearchParams<{ id: string }>();
//   const { getTaskById, updateTask, deleteTask, isUpdating, isDeleting } = useTasks();

//   // Loaded Task
//   const [task, setTask] = useState<Task | null>(null);
//   const [loading, setLoading] = useState(true);

//   // Form fields
//   const [title, setTitle] = useState("");
//   const [description, setDescription] = useState("");
//   const [dueDate, setDueDate] = useState<Date>(new Date());
//   const [priority, setPriority] = useState<Priority>(2);

//   const priorityRef = useRef<Priority>(2);

//   // UI state
//   const [showPicker, setShowPicker] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const titleTouched = useRef(false);

//   // ✅ Success Overlay
//   const [showSuccess, setShowSuccess] = useState(false);

//   // 🤖 AI suggestion state
//   const [aiSuggested, setAiSuggested] = useState<Priority | null>(null);
//   const aiOpacity = useRef(new Animated.Value(0)).current;

//   // Theme tokens
//   const bg = theme.colors.background;
//   const outline = theme.colors.outlineVariant;
//   const cardBg = theme.colors.elevation.level2;

//   // Load Task
//   useEffect(() => {
//     let isMounted = true;
//     const load = async () => {
//       try {
//         const fetched = await getTaskById(Number(id));
//         if (isMounted && fetched) {
//           setTask(fetched);
//           setTitle(fetched.title);
//           setDescription(fetched.description || "");
//           const d = new Date(fetched.dueDate); // ISO string -> Date (UTC parsed properly)
//           setDueDate(d);
//           //const d = dayjs(fetched.dueDate).toDate();
//           //setDueDate(d);

//           const p = (fetched.priority as Priority) ?? 2;
//           setPriority(p);
//           priorityRef.current = p; // ✅ sync for AI comparison
//         }
//       } finally {
//         if (isMounted) setLoading(false);
//       }
//     };
//     load();
//     return () => {
//       isMounted = false;
//     };
//   }, [id]);

//   // Validation
//   const titleError = useMemo(
//     () => titleTouched.current && title.trim().length === 0,
//     [title]
//   );
//   const dateError = useMemo(
//     () => dayjs(dueDate).startOf("day").isBefore(dayjs().startOf("day")),
//     [dueDate]
//   );

//   const canSubmit =
//     !titleError && !dateError && title.trim().length > 0 && !isUpdating;

//   function onChangeDate(_: any, selected?: Date) {
//     setShowPicker(false);
//     if (selected) setDueDate(selected);
//   }

//   // 🤖 Debounced AI suggestion (same as new.tsx)
//   const runAISuggestion = useRef(
//     debounce(async (text: string) => {
//       if (!text.trim() || text.trim().length < 3) {
//         setAiSuggested(null);
//         return;
//       }

//       const ai = await suggestPriority(text);

//       if (ai !== priorityRef.current) {
//         setAiSuggested(ai as Priority);

//         if (ai > 0) {
//           Animated.timing(aiOpacity, {
//             toValue: 1,
//             duration: 100,
//             useNativeDriver: true,
//           }).start();
//         } else {
//           setAiSuggested(null);
//         }
//       } else {
//         setAiSuggested(null);
//       }
//     }, 600)
//   ).current;

//   function onTitleChange(t: string) {
//     setTitle(t);
//     runAISuggestion(t);
//   }

//   // Update Priority
//   function handlePriorityChange(v: string) {
//     const p = Number(v) as Priority;
//     setPriority(p);
//     priorityRef.current = p;
//   }

//   // Save
//   const onSubmit = async () => {
//     if (!task || !canSubmit) return;

//     setError(null);
//     const payload: UpdateTaskRequest = {
//       title: title.trim(),
//       description: description.trim(),
//       dueDate: dayjs(dueDate).toISOString(),
//       priority,
//       completed: task.completed,
//     };

//     try {
//       await updateTask(task.id, payload);

//       setShowSuccess(true);
//     } catch (err) {
//       console.error("❌ Update failed:", err);
//       setError("Failed to update task. Please try again.");
//     }
//   };

//   // Delete
//   const onDelete = () => {
//     if (!task) return;

//     // 🖥️ Web: Use window.confirm
//     if (Platform.OS === "web") {
//       const confirmed = window.confirm("Are you sure you want to delete this task?");
//       if (!confirmed) return;

//       deleteTask(task.id)
//         .then(() => router.back())
//         .catch(() => alert("Failed to delete task."));
//       return;
//     }

//     Alert.alert("Delete Task", "Are you sure you want to delete this task?", [
//       { text: "Cancel", style: "cancel" },
//       {
//         text: "Delete",
//         style: "destructive",
//         onPress: async () => {
//           try {
//             await deleteTask(task.id);
//             router.back();
//           } catch {
//             Alert.alert("Error", "Failed to delete task.");
//           }
//         },
//       },
//     ]);
//   };

//   if (loading) {
//     return (
//       <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
//         <ActivityIndicator size="large" />
//       </SafeAreaView>
//     );
//   }

//   if (!task) {
//     return (
//       <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
//         <Card mode="elevated" style={{ borderRadius: 16 }}>
//           <Card.Content>
//             <Text>Task not found</Text>
//             <Button mode="contained" onPress={() => router.back()} style={{ marginTop: 12 }}>
//               Go Back
//             </Button>
//           </Card.Content>
//         </Card>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
//       <KeyboardAvoidingView
//         style={{ flex: 1, backgroundColor: bg }}
//         behavior={Platform.OS === "ios" ? "padding" : undefined}
//       >
//         <ScrollView
//           style={{ flex: 1, backgroundColor: bg }}
//           contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
//           keyboardShouldPersistTaps="handled"
//         >
//           <Card
//             mode="elevated"
//             style={{
//               borderRadius: 20,
//               backgroundColor: cardBg,
//               overflow: "hidden",
//               elevation: 3,
//             }}
//           >
//             <Card.Title
//               title="Edit Task"
//               titleVariant="titleLarge"
//               titleStyle={{ fontWeight: "700" }}
//             />

//             <Card.Content style={{ paddingBottom: 16 }}>
//               {/* Title */}
//               <TextInput
//                 mode="outlined"
//                 label="Title"
//                 value={title}
//                 onChangeText={onTitleChange}
//                 onBlur={() => (titleTouched.current = true)}
//                 error={titleError}
//                 outlineColor={outline}
//                 style={{ marginBottom: 6 }}
//                 autoCapitalize="sentences"
//               />
//               <HelperText type={titleError ? "error" : "info"} visible>
//                 {titleError ? "Title is required." : "Update your task title if needed."}
//               </HelperText>

//               {/* Description */}
//               <TextInput
//                 mode="outlined"
//                 label="Description (optional)"
//                 value={description}
//                 onChangeText={setDescription}
//                 outlineColor={outline}
//                 multiline
//                 numberOfLines={3}
//                 style={{ marginTop: 8 }}
//               />

//               {/* Due Date */}
//               <View style={{ marginTop: 16 }}>
//                 <Text variant="labelLarge" style={{ marginBottom: 6 }}>
//                   Due Date
//                 </Text>

//                 <TouchableOpacity activeOpacity={0.7} onPress={() => setShowPicker(true)}>
//                   <TextInput
//                     mode="outlined"
//                     editable={false}
//                     value={dayjs(dueDate).format("YYYY-MM-DD")}
//                     right={<TextInput.Icon icon="calendar" />}
//                     outlineColor={outline}
//                   />
//                 </TouchableOpacity>

//                 {dateError && (
//                   <HelperText type="error" visible>
//                     Date can’t be in the past.
//                   </HelperText>
//                 )}

//                 {showPicker && (
//                   <DateTimePicker
//                     value={dueDate}
//                     mode="date"
//                     display={Platform.OS === "ios" ? "inline" : "default"}
//                     onChange={onChangeDate}
//                     minimumDate={new Date()}
//                   />
//                 )}
//               </View>

//               {/* 🤖 AI Suggested Priority */}
//               {aiSuggested && (
//                 <Animated.View
//                   style={{
//                     opacity: aiOpacity,
//                     backgroundColor:
//                       aiSuggested === 3
//                         ? "#EF5350"
//                         : aiSuggested === 2
//                         ? "#FFA726"
//                         : "#66BB6A",
//                     padding: 10,
//                     borderRadius: 10,
//                     marginTop: 12,
//                   }}
//                 >
//                   <View
//                     style={{
//                       flexDirection: "row",
//                       justifyContent: "space-between",
//                       alignItems: "center",
//                     }}
//                   >
//                     {/* <Text style={{ color: "#fff", fontWeight: "700" }}>
//                       🔥 AI Suggests:{" "}
//                       {aiSuggested === 3 ? "High" : aiSuggested === 2 ? "Medium" : "Low"}
//                     </Text> */}

//                    <View style={{ flexDirection: "row", alignItems: "center" }}>
//                       <Icon
//                         source={
//                           aiSuggested === 3
//                             ? "fire"
//                             : aiSuggested === 2
//                             ? "gauge-low"
//                             : "tailwind"
//                         }
//                         color="#fff"
//                         size={20}
//                       />

//                       <Text style={{ color: "#fff", fontWeight: "700", marginLeft: 6 }}>
//                         AI Suggests:{" "}
//                         {aiSuggested === 3
//                           ? "High"
//                           : aiSuggested === 2
//                           ? "Medium"
//                           : "Low"}
//                       </Text>
//                     </View>

//                     <TouchableOpacity onPress={() => setAiSuggested(null)}>
//                       <Text style={{ color: "#fff", fontWeight: "600", padding: 4 }}>✖</Text>
//                     </TouchableOpacity>
//                   </View>

//                   <Button
//                     mode="contained"
//                     onPress={() => {
//                       handlePriorityChange(String(aiSuggested!));
//                       setAiSuggested(null);
//                     }}
//                     style={{ marginTop: 6, backgroundColor: "rgba(255,255,255,0.2)" }}
//                     labelStyle={{ color: "#fff", fontWeight: "600" }}
//                   >
//                     Apply Suggestion
//                   </Button>
//                 </Animated.View>
//               )}

//               {/* Priority */}
//               <View style={{ marginTop: 16 }}>
//                 <Text variant="labelLarge" style={{ marginBottom: 6 }}>
//                   Priority
//                 </Text>
//                 <SegmentedButtons
//                   value={priority.toString()}
//                   onValueChange={handlePriorityChange}
//                   density="regular"
//                   buttons={[
//                     {
//                       value: "1",
//                       label: "Low",
//                       icon: "tailwind",
//                       style: {
//                         flex: 1,
//                         backgroundColor:
//                           priority === 1 ? theme.colors.primaryContainer : undefined,
//                       },
//                     },
//                     {
//                       value: "2",
//                       label: "Med",
//                       icon: "gauge-low",
//                       style: {
//                         flex: 1,
//                         backgroundColor:
//                           priority === 2 ? theme.colors.primaryContainer : undefined,
//                       },
//                     },
//                     {
//                       value: "3",
//                       label: "High",
//                       icon: "fire",
//                       style: {
//                         flex: 1,
//                         backgroundColor:
//                           priority === 3 ? theme.colors.primaryContainer : undefined,
//                       },
//                     },
//                   ]}
//                 />
//                 <HelperText type="info" visible>
//                   Adjust if priority has changed.
//                 </HelperText>
//               </View>

//               {/* Error */}
//               {error ? (
//                 <HelperText type="error" visible>
//                   {error}
//                 </HelperText>
//               ) : null}

//               {/* Save */}
//               <Button
//                 mode="contained"
//                 onPress={onSubmit}
//                 disabled={!canSubmit}
//                 loading={isUpdating}
//                 buttonColor={theme.colors.primary}
//                 textColor={theme.colors.onPrimary}
//                 style={{
//                   marginTop: 12,
//                   borderRadius: 18,
//                   elevation: 3,
//                   shadowOpacity: 0.25,
//                   shadowRadius: 6,
//                   shadowOffset: { width: 0, height: 2 },
//                 }}
//                 contentStyle={{ height: 54 }}
//                 labelStyle={{ fontWeight: "700", letterSpacing: 0.3 }}
//               >
//                 Save
//               </Button>

//               {/* Delete */}
//               <Button
//                 mode="outlined"
//                 onPress={onDelete}
//                 loading={isDeleting}
//                 textColor={theme.colors.error}
//                 style={{
//                   borderRadius: 18,
//                   marginTop: 12,
//                   borderColor: theme.colors.error,
//                   borderWidth: 1.2,
//                 }}
//                 contentStyle={{ height: 50 }}
//                 labelStyle={{ fontWeight: "600" }}
//               >
//                 Delete
//               </Button>
//             </Card.Content>
//           </Card>
//         </ScrollView>
//       </KeyboardAvoidingView>

//       {/* ✅ Success Celebration */}
//       <SuccessCelebration
//         visible={showSuccess}
//         message="Task Updated!"
//         variant="fullscreen"
//         duration={1100}
//         onFinish={() => {
//           setShowSuccess(false);
//           router.back();
//         }}
//       />
//     </SafeAreaView>
//   );
// }

import React, { useEffect, useState, useMemo, useRef } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
  Alert,
  Animated,
} from "react-native";
import {
  ActivityIndicator,
  Button,
  Card,
  HelperText,
  SegmentedButtons,
  Text,
  TextInput,
  useTheme,
  Icon,
} from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import dayjs from "dayjs";
import debounce from "lodash.debounce";
import { useTasks } from "@/context/TaskContext";
import { Task, UpdateTaskRequest } from "@/types/task";
import SuccessCelebration from "@/app/_components/common/SuccessCelebration";
import { suggestPriority } from "@/hooks/aiSuggestions";

type Priority = -1 | 1 | 2 | 3;

function mergeDateAndTime(datePart: Date, timePart: Date) {
  const d = new Date(datePart);
  d.setHours(timePart.getHours(), timePart.getMinutes(), 0, 0);
  return d;
}

export default function EditTask() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getTaskById, updateTask, deleteTask, isUpdating, isDeleting } = useTasks();

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState<Date>(new Date());
  const [priority, setPriority] = useState<Priority>(2);

  // ✅ NEW: planned times
  const [plannedStartLocal, setPlannedStartLocal] = useState<Date | null>(null);
  const [plannedEndLocal, setPlannedEndLocal] = useState<Date | null>(null);

  const priorityRef = useRef<Priority>(2);

  // UI state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const titleTouched = useRef(false);

  const [showSuccess, setShowSuccess] = useState(false);

  const [aiSuggested, setAiSuggested] = useState<Priority | null>(null);
  const aiOpacity = useRef(new Animated.Value(0)).current;

  const bg = theme.colors.background;
  const outline = theme.colors.outlineVariant;
  const cardBg = theme.colors.elevation.level2;

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const fetched = await getTaskById(Number(id));
        if (isMounted && fetched) {
          setTask(fetched);
          setTitle(fetched.title);
          setDescription(fetched.description || "");

          // dueDate ISO -> Date
          const d = new Date(fetched.dueDate);
          setDueDate(d);

          const p = (fetched.priority as Priority) ?? 2;
          setPriority(p);
          priorityRef.current = p;

          // ✅ NEW: load planned times if present
          setPlannedStartLocal(fetched.plannedStartUtc ? new Date(fetched.plannedStartUtc) : null);
          setPlannedEndLocal(fetched.plannedEndUtc ? new Date(fetched.plannedEndUtc) : null);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const titleError = useMemo(
    () => titleTouched.current && title.trim().length === 0,
    [title]
  );

  const dateError = useMemo(
    () => dayjs(dueDate).startOf("day").isBefore(dayjs().startOf("day")),
    [dueDate]
  );

  const plannedTimeError = useMemo(() => {
    if (!plannedStartLocal || !plannedEndLocal) return null;
    if (plannedEndLocal <= plannedStartLocal) return "End time must be after start time.";
    return null;
  }, [plannedStartLocal, plannedEndLocal]);

  const canSubmit =
    !titleError && !dateError && !plannedTimeError && title.trim().length > 0 && !isUpdating;

  function onChangeDate(_: any, selected?: Date) {
    setShowDatePicker(false);
    if (!selected) return;

    setDueDate(selected);

    // keep planned times on same selected date (if they exist)
    if (plannedStartLocal) setPlannedStartLocal(mergeDateAndTime(selected, plannedStartLocal));
    if (plannedEndLocal) setPlannedEndLocal(mergeDateAndTime(selected, plannedEndLocal));
  }

  function onChangeStartTime(_: any, selected?: Date) {
    setShowStartTimePicker(false);
    if (!selected) return;

    const merged = mergeDateAndTime(dueDate, selected);
    setPlannedStartLocal(merged);

    if (!plannedEndLocal) {
      setPlannedEndLocal(new Date(merged.getTime() + 30 * 60 * 1000));
    }
  }

  function onChangeEndTime(_: any, selected?: Date) {
    setShowEndTimePicker(false);
    if (!selected) return;

    const merged = mergeDateAndTime(dueDate, selected);
    setPlannedEndLocal(merged);
  }

  const runAISuggestion = useRef(
    debounce(async (text: string) => {
      if (!text.trim() || text.trim().length < 3) {
        setAiSuggested(null);
        return;
      }

      const ai = await suggestPriority(text);

      if (ai !== priorityRef.current) {
        setAiSuggested(ai as Priority);

        if (ai > 0) {
          Animated.timing(aiOpacity, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }).start();
        } else {
          setAiSuggested(null);
        }
      } else {
        setAiSuggested(null);
      }
    }, 600)
  ).current;

  function onTitleChange(t: string) {
    setTitle(t);
    runAISuggestion(t);
  }

  function handlePriorityChange(v: string) {
    const p = Number(v) as Priority;
    setPriority(p);
    priorityRef.current = p;
  }

  const onSubmit = async () => {
    if (!task || !canSubmit) return;

    setError(null);

    const plannedStartUtc = plannedStartLocal ? dayjs(plannedStartLocal).toISOString() : null;
    const plannedEndUtc = plannedEndLocal ? dayjs(plannedEndLocal).toISOString() : null;

    const payload: UpdateTaskRequest = {
      title: title.trim(),
      description: description.trim(),
      dueDate: dayjs(dueDate).toISOString(),
      priority,
      completed: task.completed,

      plannedStartUtc, // ✅ NEW
      plannedEndUtc,   // ✅ NEW
    };

    try {
      await updateTask(task.id, payload);
      setShowSuccess(true);
    } catch (err) {
      console.error("❌ Update failed:", err);
      setError("Failed to update task. Please try again.");
    }
  };

  const onDelete = () => {
    if (!task) return;

    if (Platform.OS === "web") {
      const confirmed = window.confirm("Are you sure you want to delete this task?");
      if (!confirmed) return;

      deleteTask(task.id)
        .then(() => router.back())
        .catch(() => alert("Failed to delete task."));
      return;
    }

    Alert.alert("Delete Task", "Are you sure you want to delete this task?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteTask(task.id);
            router.back();
          } catch {
            Alert.alert("Error", "Failed to delete task.");
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  if (!task) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Card mode="elevated" style={{ borderRadius: 16 }}>
          <Card.Content>
            <Text>Task not found</Text>
            <Button mode="contained" onPress={() => router.back()} style={{ marginTop: 12 }}>
              Go Back
            </Button>
          </Card.Content>
        </Card>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: bg }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={{ flex: 1, backgroundColor: bg }}
          contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
          keyboardShouldPersistTaps="handled"
        >
          <Card
            mode="elevated"
            style={{
              borderRadius: 20,
              backgroundColor: cardBg,
              overflow: "hidden",
              elevation: 3,
            }}
          >
            <Card.Title
              title="Edit Task"
              titleVariant="titleLarge"
              titleStyle={{ fontWeight: "700" }}
            />

            <Card.Content style={{ paddingBottom: 16 }}>
              {/* Title */}
              <TextInput
                mode="outlined"
                label="Title"
                value={title}
                onChangeText={onTitleChange}
                onBlur={() => (titleTouched.current = true)}
                error={titleError}
                outlineColor={outline}
                style={{ marginBottom: 6 }}
                autoCapitalize="sentences"
              />
              <HelperText type={titleError ? "error" : "info"} visible>
                {titleError ? "Title is required." : "Update your task title if needed."}
              </HelperText>

              {/* Description */}
              <TextInput
                mode="outlined"
                label="Description (optional)"
                value={description}
                onChangeText={setDescription}
                outlineColor={outline}
                multiline
                numberOfLines={3}
                style={{ marginTop: 8 }}
              />

              {/* Due Date */}
              <View style={{ marginTop: 16 }}>
                <Text variant="labelLarge" style={{ marginBottom: 6 }}>
                  Due Date
                </Text>

                <TouchableOpacity activeOpacity={0.7} onPress={() => setShowDatePicker(true)}>
                  <TextInput
                    mode="outlined"
                    editable={false}
                    value={dayjs(dueDate).format("YYYY-MM-DD")}
                    right={<TextInput.Icon icon="calendar" />}
                    outlineColor={outline}
                  />
                </TouchableOpacity>

                {dateError && (
                  <HelperText type="error" visible>
                    Date can’t be in the past.
                  </HelperText>
                )}

                {showDatePicker && (
                  <DateTimePicker
                    value={dueDate}
                    mode="date"
                    display={Platform.OS === "ios" ? "inline" : "default"}
                    onChange={onChangeDate}
                    minimumDate={new Date()}
                  />
                )}
              </View>

              {/* ✅ Planned Time (optional) */}
              <View style={{ marginTop: 16 }}>
                <Text variant="labelLarge" style={{ marginBottom: 6 }}>
                  Planned Time (optional)
                </Text>

                <View style={{ flexDirection: "row", gap: 10 }}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={{ flex: 1 }}
                    onPress={() => setShowStartTimePicker(true)}
                  >
                    <TextInput
                      mode="outlined"
                      editable={false}
                      label="Start"
                      value={plannedStartLocal ? dayjs(plannedStartLocal).format("HH:mm") : ""}
                      right={<TextInput.Icon icon="clock-outline" />}
                      outlineColor={outline}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={{ flex: 1 }}
                    onPress={() => setShowEndTimePicker(true)}
                  >
                    <TextInput
                      mode="outlined"
                      editable={false}
                      label="End"
                      value={plannedEndLocal ? dayjs(plannedEndLocal).format("HH:mm") : ""}
                      right={<TextInput.Icon icon="clock-outline" />}
                      outlineColor={outline}
                    />
                  </TouchableOpacity>
                </View>

                <HelperText type={plannedTimeError ? "error" : "info"} visible>
                  {plannedTimeError
                    ? plannedTimeError
                    : "If set, FlowOS will respect these times (AI won’t change them)."}
                </HelperText>

                {showStartTimePicker && (
                  <DateTimePicker
                    value={plannedStartLocal ?? new Date()}
                    mode="time"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={onChangeStartTime}
                    is24Hour={true}
                  />
                )}

                {showEndTimePicker && (
                  <DateTimePicker
                    value={plannedEndLocal ?? new Date()}
                    mode="time"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={onChangeEndTime}
                    is24Hour={true}
                  />
                )}

                {(plannedStartLocal || plannedEndLocal) && (
                  <Button
                    mode="text"
                    onPress={() => {
                      setPlannedStartLocal(null);
                      setPlannedEndLocal(null);
                    }}
                    style={{ alignSelf: "flex-start", marginTop: 4 }}
                  >
                    Clear planned time
                  </Button>
                )}
              </View>

              {/* Priority */}
              <View style={{ marginTop: 16 }}>
                <Text variant="labelLarge" style={{ marginBottom: 6 }}>
                  Priority
                </Text>
                <SegmentedButtons
                  value={priority.toString()}
                  onValueChange={handlePriorityChange}
                  density="regular"
                  buttons={[
                    {
                      value: "1",
                      label: "Low",
                      icon: "tailwind",
                      style: {
                        flex: 1,
                        backgroundColor:
                          priority === 1 ? theme.colors.primaryContainer : undefined,
                      },
                    },
                    {
                      value: "2",
                      label: "Med",
                      icon: "gauge-low",
                      style: {
                        flex: 1,
                        backgroundColor:
                          priority === 2 ? theme.colors.primaryContainer : undefined,
                      },
                    },
                    {
                      value: "3",
                      label: "High",
                      icon: "fire",
                      style: {
                        flex: 1,
                        backgroundColor:
                          priority === 3 ? theme.colors.primaryContainer : undefined,
                      },
                    },
                  ]}
                />
                <HelperText type="info" visible>
                  Adjust if priority has changed.
                </HelperText>
              </View>

              {error ? (
                <HelperText type="error" visible>
                  {error}
                </HelperText>
              ) : null}

              {/* Save */}
              <Button
                mode="contained"
                onPress={onSubmit}
                disabled={!canSubmit}
                loading={isUpdating}
                buttonColor={theme.colors.primary}
                textColor={theme.colors.onPrimary}
                style={{
                  marginTop: 12,
                  borderRadius: 18,
                  elevation: 3,
                  shadowOpacity: 0.25,
                  shadowRadius: 6,
                  shadowOffset: { width: 0, height: 2 },
                }}
                contentStyle={{ height: 54 }}
                labelStyle={{ fontWeight: "700", letterSpacing: 0.3 }}
              >
                Save
              </Button>

              {/* Delete */}
              <Button
                mode="outlined"
                onPress={onDelete}
                loading={isDeleting}
                textColor={theme.colors.error}
                style={{
                  borderRadius: 18,
                  marginTop: 12,
                  borderColor: theme.colors.error,
                  borderWidth: 1.2,
                }}
                contentStyle={{ height: 50 }}
                labelStyle={{ fontWeight: "600" }}
              >
                Delete
              </Button>
            </Card.Content>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>

      <SuccessCelebration
        visible={showSuccess}
        message="Task Updated!"
        variant="fullscreen"
        duration={1100}
        onFinish={() => {
          setShowSuccess(false);
          router.back();
        }}
      />
    </SafeAreaView>
  );
}