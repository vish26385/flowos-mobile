import React, { useEffect, useRef } from "react";
import { View, Pressable, Animated, StyleSheet } from "react-native";
import { Text, Checkbox, IconButton, Chip, useTheme } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import dayjs from "dayjs";

type Task = {
  id: number;
  title: string;
  description?: string;
  dueDate?: string;
  priority: number;
  completed: boolean;
};

interface Props {
  item: Task;
  index: number;
  onToggle: (id: number, updated: Partial<Task>) => void;
  onDelete: (id: number) => void;
}

function TaskItem({ item, index, onToggle, onDelete }: Props) {
  const theme = useTheme();

  // Priority color logic
  const bg = item.priority === 3 ? "#EF5350" : item.priority === 2 ? "#FFA726" : "#66BB6A";
  const fg = "#fff";
  const label = item.priority === 3 ? "High" : item.priority === 2 ? "Med" : "Low";

  // Smooth animation (run only once)
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 250,
      delay: index * 60,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={{
        opacity: anim,
        transform: [
          {
            translateY: anim.interpolate({
              inputRange: [0, 1],
              outputRange: [8, 0],
            }),
          },
        ],
      }}
    >
      <Pressable
        android_ripple={{ color: theme.colors.primary, borderless: false }}
        style={[
          styles.taskCard,
          {
            backgroundColor: theme.dark ? "#1E1E1E" : theme.colors.surface,
            shadowColor: theme.colors.primary,
          },
        ]}
      >
        {/* Row layout */}
        <View style={styles.taskRow}>
          {/* Checkbox */}
          <View style={{ marginTop: 6 }}>           
                <Checkbox
                  status={item.completed ? "checked" : "unchecked"}
                  onPress={() => onToggle(item.id, { ...item, completed: !item.completed })}
                  color={theme.colors.primary}
                />
          </View>

          {/* Middle content */}
          <View style={styles.taskContent}>
            <Text
              style={[
                styles.taskTitle,
                {
                  color: item.completed ? theme.colors.outline : theme.colors.onSurface,
                  textDecorationLine: item.completed ? "line-through" : "none",
                },
              ]}
              numberOfLines={2}
            >
              {item.title}
            </Text>

            {item.description ? (
              <Text
                style={[styles.taskDescription, { color: theme.colors.onSurfaceVariant }]}
                numberOfLines={2}
              >
                {item.description}
              </Text>
            ) : null}

            {item.dueDate ? (
              <View style={styles.dueRow}>
                <Ionicons
                  name="calendar-outline"
                  size={14}
                  color={theme.colors.primary}
                  style={{ marginRight: 4 }}
                />
                <Text style={[styles.dueText, { color: theme.colors.onSurfaceVariant }]}>
                  Due: {dayjs(item.dueDate).format("DD MMM")}
                </Text>
              </View>
            ) : null}
          </View>

          {/* Right actions */}
          <View style={styles.rightColumn}>
            <Chip
              compact
              style={[styles.priorityChip, { backgroundColor: bg }]}
              textStyle={[styles.priorityText, { color: fg }]}
            >
              {label}
            </Chip>

            <View style={styles.iconRow}>
              <Link href={`/tasks/${item.id}`} asChild>
                <IconButton icon="pencil" iconColor={theme.colors.primary} size={20} />
              </Link>
              <IconButton
                icon="delete"
                iconColor={theme.colors.error}
                size={20}
                onPress={() => onDelete(item.id)}
              />
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default React.memo(TaskItem);

const styles = StyleSheet.create({
  taskCard: {
    borderRadius: 18,
    padding: 12,
    marginVertical: 6,
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  taskRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  taskContent: {
    flex: 1,
    paddingRight: 6,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  taskDescription: {
    fontSize: 13,
    marginTop: 2,
  },
  dueRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  dueText: {
    fontSize: 12,
  },
  rightColumn: {
    alignItems: "center",
  },
  priorityChip: {
    marginTop: 4,
    minWidth: 52,
    paddingHorizontal: 8,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  priorityText: {
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
    letterSpacing: 0.3,
  },
  iconRow: {
    flexDirection: "row",
    justifyContent: "center",
  },
});

