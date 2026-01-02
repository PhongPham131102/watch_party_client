import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Image } from "expo-image";
import { Movie } from "../types/movie.types";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

interface MovieCardProps {
  movie: Movie;
  quality?: "HD" | "CAM";
  width?: number;
  height?: number;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function MovieCard({ movie, width, height }: MovieCardProps) {
  const router = useRouter();
  const cardWidth = width || SCREEN_WIDTH * 0.4;
  const cardHeight = height || cardWidth * 1.5;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => router.push(`/movies/${movie.slug}`)}
      style={[styles.container, { width: cardWidth }]}
    >
      <View style={[styles.imageContainer, { height: cardHeight }]}>
        <Image
          source={{ uri: movie.posterUrl || movie.backdropUrl || "" }}
          style={styles.image}
          contentFit="cover"
          transition={500}
        />
        <View style={styles.badge}>
          <Text style={styles.badgeText}>HD</Text>
        </View>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {movie.title}
        </Text>
        <View style={styles.metaContainer}>
          <Text style={styles.metaText}>
            {movie.releaseYear}
            {movie.durationMinutes
              ? ` • ${Math.floor(movie.durationMinutes / 60)}h ${
                  movie.durationMinutes % 60
                }m`
              : ""}
          </Text>
          <View style={styles.typeBadge}>
            <Text style={styles.typeText}>
              {movie.contentType === "series" ? "Series" : "Movie"}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginRight: 12,
  },
  imageContainer: {
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#1f2937",
    marginBottom: 8,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  badge: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  infoContainer: {
    gap: 4,
  },
  title: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  metaContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  metaText: {
    color: "#9ca3af",
    fontSize: 12,
  },
  typeBadge: {
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 10,
  },
});
