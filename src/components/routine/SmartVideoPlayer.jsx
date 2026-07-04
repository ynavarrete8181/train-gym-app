import React, { useState, useCallback } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import YoutubePlayer from "react-native-youtube-iframe";

// Función para extraer el ID de YouTube de diferentes formatos de URL
const getYoutubeId = (url) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

export default function SmartVideoPlayer({ url }) {
  const [playing, setPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  
  const youtubeId = getYoutubeId(url);
  const isYoutube = !!youtubeId;

  // ==== NATIVE VIDEO PLAYER (EXPO-VIDEO) ====
  const player = useVideoPlayer(isYoutube ? null : url, (p) => {
    if (!isYoutube) {
      p.loop = true;
      p.play();
    }
  });

  if (!url) return null;

  if (isYoutube) {
    return (
      <View style={styles.container}>
        {!isReady && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF0000" />
          </View>
        )}
        <YoutubePlayer
          height={250}
          play={playing}
          videoId={youtubeId}
          onReady={() => setIsReady(true)}
          initialPlayerParams={{
            loop: 1,
            controls: 1,
          }}
        />
      </View>
    );
  }

  // ==== DEFAULT MP4 PLAYER ====
  return (
    <View style={styles.container}>
      <VideoView 
        style={styles.video} 
        player={player} 
        allowsFullscreen 
        allowsPictureInPicture 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 250,
    backgroundColor: "#000",
  },
  video: {
    width: "100%",
    height: 250,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
    zIndex: 1,
  }
});
