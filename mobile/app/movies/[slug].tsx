import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { movieService } from "@/services/movie.service";
import { Movie } from "@/types/movie.types";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";

export default function MovieDetailScreen() {
  const { slug } = useLocalSearchParams();
  const router = useRouter();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);

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
      <View style={styles.container}>
        <Text style={styles.errorText}>Movie not found</Text>
        <Text style={styles.backButton} onPress={() => router.back()}>
          Go Back
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons
          name="arrow-back"
          size={24}
          color="white"
          style={styles.backIcon}
          onPress={() => router.back()}
        />
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
        <Text style={styles.description}>{movie.description}</Text>
      </View>
    </ScrollView>
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
    top: 40,
    left: 20,
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    padding: 8,
  },
  backIcon: {},
  backdrop: {
    width: "100%",
    height: 300,
  },
  content: {
    padding: 20,
  },
  title: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  meta: {
    color: "#9ca3af",
    fontSize: 14,
    marginBottom: 16,
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
