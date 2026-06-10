import { Platform, StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";

import { CHART_BASE } from "../config";

interface Props {
  code: string;
  feedKey: string;
  streamCode?: string;
  height?: number;
  /** Fill parent — chart panes scroll inside the WebView */
  fill?: boolean;
}

function buildChartUrl(code: string, feedKey: string, streamCode?: string): string {
  const params = new URLSearchParams({
    embed: "1",
    code: code.trim().toUpperCase(),
    feed: feedKey,
  });
  const stream = streamCode?.trim().toUpperCase();
  if (stream) params.set("source", stream);
  return `${CHART_BASE}/?${params.toString()}`;
}

export function ChartWebView({ code, feedKey, streamCode, height = 640, fill = false }: Props) {
  const uri = buildChartUrl(code, feedKey, streamCode);
  const wrapStyle = [styles.wrap, fill ? styles.wrapFill : { height }];

  if (Platform.OS === "web") {
    return (
      <View style={wrapStyle}>
        {/* eslint-disable-next-line react/no-unknown-property */}
        <iframe
          src={uri}
          title="Live chart"
          style={{
            border: "none",
            width: "100%",
            height: "100%",
            flex: 1,
            minHeight: fill ? "100%" : height,
            background: "#000",
          }}
        />
      </View>
    );
  }

  return (
    <View style={wrapStyle}>
      <WebView
        source={{ uri }}
        style={styles.webview}
        originWhitelist={["*"]}
        javaScriptEnabled
        domStorageEnabled
        scrollEnabled
        bounces
        overScrollMode="always"
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        setSupportMultipleWindows={false}
        androidLayerType="hardware"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
    overflow: "hidden",
    backgroundColor: "#000",
  },
  wrapFill: {
    flex: 1,
    minHeight: 0,
  },
  webview: {
    flex: 1,
    backgroundColor: "#000",
  },
});
