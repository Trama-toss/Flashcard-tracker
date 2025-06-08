import { renderWidget, useSessionStorageState } from "@remnote/plugin-sdk";
import React, { useEffect, useState } from "react";

function Popup() {
  const [cardPerMinute] = useSessionStorageState("cardPerMinute", 0);
  const [lastCardSpeed] = useSessionStorageState("lastCardSpeed", 0);
  const [totalCardsCompleted] = useSessionStorageState("totalCardsCompleted", 0);
  const [remainingTime] = useSessionStorageState("remainingTime", "∞");
  const [expectedCompletionTime] = useSessionStorageState("expectedCompletionTime", "");

  const [currentTime, setCurrentTime] = useState(new Date());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const cardPerMinuteColor = cardPerMinute < 5 ? "red" : "lightgreen";

  return (
    <div
      id="card-stats"
      style={{
        display: "flex",
        justifyContent: "space-between",
        whiteSpace: "nowrap",
        overflowX: "auto",
        fontFamily: 'Bookerly, "Segoe UI", sans-serif',
        opacity: loaded ? 1 : 0,
        transition: "opacity 2s",
        borderRadius: "10px",
        border: "0.2px solid gray",
        position: "relative",
        paddingLeft: "10px",
      }}
    >
      <div style={{ margin: "0 5px", color: "rgb(29, 155, 222)" }}>
        🕒 Clock: <b style={{ color: "lightgreen" }}>{currentTime.toLocaleTimeString()}</b>
      </div>
      <div style={{ margin: "0 5px", color: "rgb(29, 155, 222)" }}>
        ✅ Completed: <b style={{ color: "lightgreen" }}>{totalCardsCompleted}</b>
      </div>
      <div style={{ margin: "0 5px", color: "rgb(29, 155, 222)" }}>
        ⚡ Speed: <b style={{ color: cardPerMinuteColor }}>{cardPerMinute} cards/min</b>
      </div>
      <div style={{ margin: "0 5px", color: "rgb(29, 155, 222)" }}>
        ⏱️ Last: <b style={{ color: "orange" }}>{lastCardSpeed}s</b>
      </div>
      <div style={{ margin: "0 5px", color: "rgb(29, 155, 222)" }}>
        ⏳ ETA: <b style={{ color: "lightgreen" }}>{remainingTime}</b> |{" "}
        <b style={{ color: "lightgreen" }}>{expectedCompletionTime}</b>
      </div>
    </div>
  );
}

renderWidget(Popup);