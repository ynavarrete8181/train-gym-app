import { ImageBackground, Linking, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { VideoView, useVideoPlayer } from "expo-video";
import { WebView } from "react-native-webview";
import { useMemo, useState } from "react";
import { colors } from "../../theme/colors";

const PLAYER_ORIGIN = "https://revivesport.app";

const getYoutubeId = (url) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|shorts\/|&v=)([^#&?]*).*/;
  const match = String(url || "").match(regExp);
  return match?.[2]?.length === 11 ? match[2] : null;
};

export default function SmartVideoPlayer({ url }) {
  const youtubeId = typeof url === "string" ? getYoutubeId(url) : null;

  if (!url) return null;

  if (youtubeId) {
    return <YoutubeInlinePlayer videoId={youtubeId} />;
  }

  return <NativeVideoPlayer source={url} />;
}

function YoutubeInlinePlayer({ videoId }) {
  const [hasError, setHasError] = useState(false);
  const html = useMemo(() => buildYoutubeHtml(videoId), [videoId]);

  if (hasError) {
    return <YoutubeFallback videoId={videoId} />;
  }

  return (
    <View style={styles.container}>
      <WebView
        source={{ html, baseUrl: PLAYER_ORIGIN }}
        style={styles.webview}
        allowsFullscreenVideo
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction
        javaScriptEnabled
        domStorageEnabled
        originWhitelist={["*"]}
        scrollEnabled={false}
        bounces={false}
        mixedContentMode="always"
        thirdPartyCookiesEnabled
        setSupportMultipleWindows={false}
        androidLayerType="hardware"
        userAgent="Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
        onError={() => setHasError(true)}
      />
    </View>
  );
}

function YoutubeFallback({ videoId }) {
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const thumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

  return (
    <View style={styles.container}>
      <ImageBackground source={{ uri: thumbnail }} resizeMode="cover" style={styles.preview}>
        <View style={styles.scrim} />
        <Text style={styles.fallbackTitle}>No se pudo cargar el reproductor aquí.</Text>
        <TouchableOpacity activeOpacity={0.9} style={styles.fallbackButton} onPress={() => Linking.openURL(watchUrl)}>
          <MaterialCommunityIcons name="youtube" size={18} color="#FF0000" />
          <Text style={styles.fallbackButtonText}>Abrir video</Text>
        </TouchableOpacity>
      </ImageBackground>
    </View>
  );
}

function NativeVideoPlayer({ source }) {
  const player = useVideoPlayer(source, (instance) => {
    instance.loop = false;
  });

  return (
    <View style={styles.container}>
      <VideoView
        player={player}
        style={styles.video}
        allowsFullscreen
        allowsPictureInPicture
        nativeControls
      />
    </View>
  );
}

function buildYoutubeHtml(videoId) {
  const src = [
    `https://www.youtube.com/embed/${videoId}`,
    "?playsinline=1",
    "&controls=1",
    "&rel=0",
    "&modestbranding=1",
    `&origin=${encodeURIComponent(PLAYER_ORIGIN)}`,
    "&enablejsapi=1",
  ].join("");

  return `
    <!doctype html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="referrer" content="strict-origin-when-cross-origin" />
        <style>
          html, body {
            margin: 0;
            width: 100%;
            height: 100%;
            background: #000;
            overflow: hidden;
          }
          iframe {
            width: 100%;
            height: 100%;
            border: 0;
            background: #000;
          }
        </style>
      </head>
      <body>
        <iframe
          src="${src}"
          title="Revive exercise video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen>
        </iframe>
      </body>
    </html>
  `;
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 250,
    overflow: "hidden",
    borderRadius: 8,
    backgroundColor: "#000",
  },
  webview: {
    width: "100%",
    height: "100%",
    backgroundColor: "#000",
  },
  preview: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 18,
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  fallbackTitle: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "900",
    textAlign: "center",
  },
  fallbackButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 6,
    backgroundColor: "rgba(255,255,255,0.94)",
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  fallbackButtonText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "900",
  },
  video: {
    width: "100%",
    height: "100%",
    backgroundColor: "#000",
  },
});
