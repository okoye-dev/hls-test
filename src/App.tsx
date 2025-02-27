import { useEffect, useRef } from "react";
import Plyr from "plyr";
import Hls from "hls.js";
import "plyr/dist/plyr.css";
import "./App.css";

function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<Plyr | undefined>(undefined);

  // const HLS_URL = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";
  const HLS_URL = "http://localhost:8080/api/v2/hls/hls/master.m3u8";

  useEffect(() => {
    if (!videoRef.current) return;

    let hls: Hls | null = null;

    // Initialize HLS if supported
    if (Hls.isSupported()) {
      hls = new Hls({
        debug: true, // Enable debug logs
      });

      hls.loadSource(HLS_URL);
      hls.attachMedia(videoRef.current);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log("HLS manifest parsed");
        if (videoRef.current) {
          playerRef.current = new Plyr(videoRef.current, {
            controls: [
              "play",
              "progress",
              "current-time",
              "volume",
              "fullscreen",
            ],
          });
        }
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          console.error("Fatal HLS error:", data);
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls?.startLoad(); // Try to recover on network errors
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls?.recoverMediaError(); // Try to recover on media errors
              break;
            default:
              // Cannot recover
              hls?.destroy();
              break;
          }
        }
      });
    } else if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
      // For Safari - it has built-in HLS support
      videoRef.current.src = HLS_URL;
      playerRef.current = new Plyr(videoRef.current, {
        controls: ["play", "progress", "current-time", "volume", "fullscreen"],
      });
    }

    return () => {
      playerRef.current?.destroy();
      if (hls) {
        hls.destroy();
      }
    };
  }, []);

  return (
    <div className="app">
      <h1>Video Player</h1>
      <div className="player-wrapper">
        <video
          ref={videoRef}
          playsInline
          controls
          crossOrigin="anonymous" // Add this if needed for CORS
        />
      </div>
    </div>
  );
}

export default App;
