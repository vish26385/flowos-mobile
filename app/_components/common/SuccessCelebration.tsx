import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, ViewStyle } from "react-native";
import { Text, useTheme } from "react-native-paper";

interface Props {
  message?: string;
  visible: boolean;
  duration?: number; // ms
  variant?: "fullscreen" | "inline";
  onFinish?: () => void;
}

export default function SuccessCelebration({
  message = "Success!",
  visible,
  duration = 1500,
  variant = "fullscreen",
  onFinish,
}: Props) {
  const theme = useTheme();

  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
      opacity.stopAnimation();
      scale.stopAnimation();
    };
  }, []);

  useEffect(() => {
    if (!visible) return;

    // Animate In
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 260,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 5,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();

    const timeout = setTimeout(() => {
      // Animate Out
      Animated.timing(opacity, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }).start(() => {
        if (isMounted.current) {
          onFinish?.();
        }
      });
    }, duration);

    return () => clearTimeout(timeout);
  }, [visible]);

  if (!visible) return null;

  // const containerStyle =
  //   variant === "fullscreen" ? styles.fullscreenOverlay : styles.inlineOverlay;

  const isFullscreen = variant === "fullscreen";
  const containerStyle: ViewStyle = isFullscreen
    ? {
        ...styles.fullscreenOverlay,
      }
    : {
        ...styles.inlineOverlay,
        top: variant === "inline" ? -120 : undefined,
      };

  const circleSize = variant === "inline" ? 75 : 100;

  return (
    <Animated.View
      style={[
        containerStyle,
        {
          backgroundColor:
            variant === "fullscreen"
              ? theme.colors.backdrop + "AA"
              : "transparent",
          opacity,
        },
      ]}
    >
      <Animated.View
        style={[
          styles.circle,
          {
            width: circleSize,
            height: circleSize,
            borderRadius: circleSize / 2,
            backgroundColor: theme.colors.primary,
            transform: [{ scale }],
            shadowColor: theme.colors.primary,
          },
        ]}
      >
        <Text
          style={{
            color: theme.colors.onPrimary,
            fontSize: 42,
            fontWeight: "800",
          }}
        >
          ✓
        </Text>
      </Animated.View>

      <Text
        style={{
          marginTop: 18,
          color: theme.colors.onBackground,
          fontSize: 18,
          fontWeight: "700",
        }}
      >
        {message}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fullscreenOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  inlineOverlay: {
    position: "absolute",
    alignSelf: "center",
    //bottom: 90, // float above modal or screen bottom
    zIndex: 999,
  },
  circle: {
    // width: 100,
    // height: 100,
    // borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
});