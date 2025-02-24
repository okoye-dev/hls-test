import { useState } from "react";
import ReactPlayer from "react-player";

function App() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <section className="app">
      <h1>HLS Stream Test</h1>
      <ReactPlayer
        className="react-player"
        url="https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
        width="100%"
        height="100%"
        playing={isPlaying}
      />

      <button onClick={() => setIsPlaying(!isPlaying)}>Play/Pause</button>
    </section>
  );
}

export default App;
