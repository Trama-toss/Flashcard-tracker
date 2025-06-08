import {
  AppEvents,
  declareIndexPlugin,
  QueueInteractionScore,
  ReactRNPlugin,
  WidgetLocation
} from "@remnote/plugin-sdk";
import "../style.css";
import "../App.css";

async function onActivate(plugin: ReactRNPlugin) {
  await plugin.app.registerWidget("popup", WidgetLocation.FloatingWidget, {
    dimensions: {
      width: 1200,
      height: "auto",
    },
  });

  plugin.event.addListener(AppEvents.QueueEnter, undefined, () => {
    let startTime = Date.now();
    let lastCardTime = startTime;
    let totalCardsCompleted = 0;
    let totalTimeSpent = 0;

    plugin.storage.setSession("cardPerMinute", 0);
    plugin.storage.setSession("lastCardSpeed", 0);
    plugin.storage.setSession("totalCardsCompleted", 0);
    plugin.storage.setSession("remainingTime", "∞");
    plugin.storage.setSession("expectedCompletionTime", "");

    async function updateDisplay() {
      const now = Date.now();
      const elapsedSeconds = (now - startTime) / 1000;
      const cardPerMinute = parseFloat(((totalCardsCompleted / elapsedSeconds) * 60).toFixed(2));
      const lastCardSpeed = ((now - lastCardTime) / 1000).toFixed(2);
      lastCardTime = now;

      const remainingCards = await plugin.queue.getNumRemainingCards();
      let remainingTime = "∞";
      let expectedCompletionTime = "";

      if (remainingCards && cardPerMinute > 0) {
        const remainingMinutes = remainingCards / cardPerMinute;
        const nowDate = new Date();
        nowDate.setMinutes(nowDate.getMinutes() + remainingMinutes);

        const h = Math.floor(remainingMinutes / 60);
        const m = Math.floor(remainingMinutes % 60);
        const s = Math.floor((remainingMinutes * 60) % 60);
        remainingTime = `${h}h ${m}m ${s}s`;

        expectedCompletionTime = nowDate.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });
      }

      plugin.storage.setSession("cardPerMinute", cardPerMinute);
      plugin.storage.setSession("lastCardSpeed", lastCardSpeed);
      plugin.storage.setSession("totalCardsCompleted", totalCardsCompleted);
      plugin.storage.setSession("remainingTime", remainingTime);
      plugin.storage.setSession("expectedCompletionTime", expectedCompletionTime);

      setTimeout(async () => {
        await plugin.window.closeAllFloatingWidgets();
        await plugin.window.openFloatingWidget(
          "popup",
          { top: 55, left: 0 },
          "rn-queue__top-bar",
          false
        );
      }, 25);
    }

    plugin.event.addListener(AppEvents.QueueCompleteCard, undefined, async (data) => {
      const score = data.score as QueueInteractionScore;
      if (score !== QueueInteractionScore.AGAIN && score !== QueueInteractionScore.SKIP) {
        totalCardsCompleted++;
        totalTimeSpent = (Date.now() - startTime) / 1000;
        updateDisplay();
      }
    });

    plugin.event.addListener(AppEvents.QueueExit, undefined, async () => {
      plugin.window.closeAllFloatingWidgets();
    });
  });
}

async function onDeactivate(_: ReactRNPlugin) {}

declareIndexPlugin(onActivate, onDeactivate);
