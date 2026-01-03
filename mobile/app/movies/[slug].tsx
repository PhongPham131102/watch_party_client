import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Pressable,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { movieService } from "@/services/movie.service";
import { Movie } from "@/types/movie.types";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

export default function MovieDetailScreen() {
  const { slug } = useLocalSearchParams();
  const router = useRouter();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        if (typeof slug === "string") {
          const data = await movieService.getMovieBySlug(slug);
          setMovie(data);
        }
      } catch (error) {
        console.error("Failed to fetch movie details", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [slug]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ef4444" />
      </View>
    );
  }

  if (!movie) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <Text style={styles.errorText}>Movie not found</Text>
        <Text style={styles.backButton} onPress={() => router.back()}>
          Go Back
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView>
        <View style={[styles.header, { top: insets.top + 10 }]}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.backButtonWrapper,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </Pressable>
        </View>
        <Image
          source={{ uri: movie.backdropUrl || movie.posterUrl || "" }}
          style={styles.backdrop}
          contentFit="cover"
        />
        <View style={styles.content}>
          <Text style={styles.title}>{movie.title}</Text>
          <Text style={styles.meta}>
            {movie.releaseYear} • {movie.durationMinutes} min
          </Text>

          <View style={styles.buttonContainer}>
            <Pressable
              style={({ pressed }) => [
                styles.playButton,
                pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
              ]}
              onPress={() => console.log("Play movie")}
            >
              <Ionicons name="play" size={22} color="black" />
              <Text style={styles.playButtonText}>Chiếu phát</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.myListButton,
                pressed && { opacity: 0.8 },
              ]}
              onPress={() => console.log("Add to list")}
            >
              <Ionicons name="add" size={22} color="white" />
              <Text style={styles.myListButtonText}>Danh sách</Text>
            </Pressable>
          </View>

          <Text style={styles.description}>{movie.description}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0e0f14",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#0e0f14",
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    position: "absolute",
    left: 20,
    zIndex: 10,
  },
  backButtonWrapper: {
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    padding: 8,
  },
  backdrop: {
    width: "100%",
    height: 400,
  },
  content: {
    padding: 20,
  },
  title: {
    color: "white",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  meta: {
    color: "#9ca3af",
    fontSize: 14,
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  playButton: {
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 6,
    gap: 8,
    flex: 1,
    justifyContent: "center",
  },
  playButtonText: {
    color: "black",
    fontWeight: "bold",
    fontSize: 16,
  },
  myListButton: {
    backgroundColor: "rgba(109, 109, 110, 0.7)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 6,
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.4)",
    flex: 1,
    justifyContent: "center",
  },
  myListButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  description: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 16,
    lineHeight: 24,
  },
  errorText: {
    color: "white",
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
  },
  backButton: {
    color: "#ef4444",
    fontSize: 16,
    textAlign: "center",
  },
});
