import React from "react";
import { View, Text, StyleSheet, Dimensions, Pressable } from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { HeroSection as HeroSectionType } from "../types/hero-section.types";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

interface HeroSectionProps {
  heroSections: HeroSectionType[];
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function HeroSection({ heroSections }: HeroSectionProps) {
  const router = useRouter();

  if (!heroSections || heroSections.length === 0) return null;

  return (
    <View style={styles.container}>
      <Carousel
        loop
        width={SCREEN_WIDTH}
        height={SCREEN_HEIGHT * 0.6}
        autoPlay={true}
        data={heroSections}
        scrollAnimationDuration={1000}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(`/movies/${item.movie.slug}`)}
            style={styles.itemContainer}
          >
            <Image
              source={{
                uri: item.movie.posterUrl || item.movie.backdropUrl || "",
              }}
              style={styles.backgroundImage}
              contentFit="cover"
            />
            <LinearGradient
              colors={[
                "transparent",
                "rgba(14, 15, 20, 0.2)",
                "rgba(14, 15, 20, 0.9)",
                "#0e0f14",
              ]}
              style={styles.gradient}
            />

            <View style={styles.contentContainer}>
              {item.movie.titleImageUrl ? (
                <Image
                  source={{ uri: item.movie.titleImageUrl }}
                  style={styles.titleImage}
                  contentFit="contain"
                />
              ) : (
                <Text style={styles.title}>
                  {item.title || item.movie.title}
                </Text>
              )}

              <Text style={styles.description} numberOfLines={3}>
                {item.description || item.movie.description}
              </Text>

              <View style={styles.buttonContainer}>
                <Pressable
                  style={({ pressed }) => [
                    styles.playButton,
                    pressed && { opacity: 0.9 },
                  ]}
                  onPress={() => router.push(`/movies/${item.movie.slug}`)}
                >
                  <Ionicons name="play" size={20} color="black" />
                  <Text style={styles.playButtonText}>Play</Text>
                </Pressable>
              </View>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: SCREEN_HEIGHT * 0.6,
  },
  itemContainer: {
    flex: 1,
    position: "relative",
  },
  backgroundImage: {
    width: "100%",
    height: "100%",
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "100%",
  },
  contentContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    zIndex: 10,
  },
  title: {
    color: "white",
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  titleImage: {
    width: 250,
    height: 80,
    marginBottom: 12,
  },
  description: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 4,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
  },
  playButton: {
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
    gap: 6,
  },
  playButtonText: {
    color: "black",
    fontWeight: "bold",
    fontSize: 16,
  },
});
