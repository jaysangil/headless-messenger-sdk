(function () {
  const chatMessages = document.getElementById("chat-messages");
  const typingIndicator = document.getElementById("typing-indicator");
  const messageInput = document.getElementById("message-input");
  const chatStatus = document.getElementById("chat-status");

  let typingTimer;
  let agentTypingTimer;

  function formatTimestamp(date) {
    const d = new Date(date);
    const hours = d.getHours().toString().padStart(2, "0");
    const minutes = d.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  }

  function addMessageToChat(message, type = "received", timestamp = new Date(), messageId = null) {
    if (!message) return;

    const messageElem = document.createElement("div");
    messageElem.classList.add("message", type);

    if (messageId) {
      messageElem.id = messageId;
    }

    const messageText = document.createElement("p");
    messageText.textContent = message;
    messageElem.appendChild(messageText);

    if (type === "sent") {
      const statusIcon = document.createElement("span");
      statusIcon.classList.add("status-icon");
      statusIcon.textContent = "";
      messageText.appendChild(statusIcon);
    }

    const timeElem = document.createElement("div");
    timeElem.classList.add("timestamp");
    timeElem.textContent = formatTimestamp(timestamp);
    messageElem.appendChild(timeElem);

    chatMessages.appendChild(messageElem);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function addSystemMessage(message) {
    const messageElem = document.createElement("div");
    messageElem.classList.add("message", "system");

    const messageText = document.createElement("p");
    messageText.textContent = message;
    messageElem.appendChild(messageText);

    chatMessages.appendChild(messageElem);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function updateStatus(status) {
    chatStatus.textContent = status;
    chatStatus.classList.remove(
      "status-online",
      "status-disconnected",
      "status-restored",
      "status-reconnecting"
    );

    const normalized = status.toLowerCase();

    if (normalized.includes("online") || normalized.includes("connected")) {
      chatStatus.classList.add("status-online");
    } else if (
      normalized.includes("disconnected") ||
      normalized.includes("offline") ||
      normalized.includes("error")
    ) {
      chatStatus.classList.add("status-disconnected");
    } else if (normalized.includes("restored")) {
      chatStatus.classList.add("status-restored");
    } else if (normalized.includes("reconnecting")) {
      chatStatus.classList.add("status-reconnecting");
    }
  }

  function showTypingIndicator() {
    typingIndicator.style.display = "block";
  }

  function hideTypingIndicator() {
    typingIndicator.style.display = "none";
  }

  function startChat() {
    Genesys("command", "MessagingService.startConversation", {},
      function () {
        console.log("Conversation started.");
        updateStatus("Connected");
        addSystemMessage("Conversation started.");
      },
      function (error) {
        console.error("Error starting conversation:", error);
        updateStatus("Error");
      }
    );
  }

  function sendMessage() {
    const messageText = messageInput.value.trim();
    if (!messageText) return;

    const uniqueId = "msg-" + Date.now();
    addMessageToChat(messageText, "sent", new Date(), uniqueId);

    Genesys("command", "MessagingService.sendMessage", { message: messageText },
      function () {
        console.log("Message sent.");
        const bubble = document.getElementById(uniqueId);
        if (bubble) {
          const icon = bubble.querySelector(".status-icon");
          if (icon) {
            icon.textContent = "✔️";
          }
        }
      },
      function (error) {
        console.error("Unable to send message:", error);
      }
    );

    messageInput.value = "";
    clearTimeout(typingTimer);

    Genesys("command", "MessagingService.sendTyping", { typing: false },
      function () {},
      function (error) {
        console.warn("Unable to send typing=false:", error);
      }
    );
  }

  function sendCard() {
    Genesys("command", "MessagingService.sendMessage", {
      type: "card",
      postback: {
        text: "Click Me!",
        payload: "Click Me!"
      }
    },
      function () {
        console.log("Card sent successfully.");
        addMessageToChat("📇 Card sent: 'Click Me!'", "sent", new Date());
      },
      function (error) {
        console.error("Unable to send card:", error);
      }
    );
  }

  function userIsTyping() {
    Genesys("command", "MessagingService.sendTyping", { typing: true },
      function () {},
      function (error) {
        console.warn("Unable to send typing=true:", error);
      }
    );

    clearTimeout(typingTimer);

    typingTimer = setTimeout(() => {
      Genesys("command", "MessagingService.sendTyping", { typing: false },
        function () {},
        function (error) {
          console.warn("Unable to send typing=false:", error);
        }
      );
    }, 2000);
  }

  function clearSession() {
    Genesys("command", "MessagingService.clearSession", {},
      function () {
        console.log("Session cleared.");
        updateStatus("Disconnected");
        hideTypingIndicator();
        addSystemMessage("Session cleared.");
      },
      function (error) {
        console.error("Error clearing session:", error);
      }
    );
  }

  function clearConversation() {
    // If this command does not work in your SDK version,
    // try "MessagingService.clearConversation" instead.
    Genesys("command", "MessagingService.ClearConversation", {},
      function () {
        console.log("Conversation cleared.");
        chatMessages.innerHTML = "";
        hideTypingIndicator();
      },
      function (error) {
        console.error("Error clearing conversation:", error);
      }
    );
  }

  function fetchHistory() {
    Genesys("command", "MessagingService.fetchHistory", {},
      function (data) {
        console.log("Conversation history fetched:", data);

        if (!data || !Array.isArray(data.messages)) return;

        data.messages.forEach((msg) => {
          if (msg.direction === "Outbound" && msg.text) {
            addMessageToChat(msg.text, "received", msg.timestamp || new Date());
          } else if (msg.direction === "Inbound" && msg.text) {
            addMessageToChat(msg.text, "sent", msg.timestamp || new Date());
          }
        });
      },
      function (error) {
        console.error("Unable to fetch history:", error);
      }
    );
  }

  function removeLocalValues() {
    localStorage.removeItem("_actmu");
    localStorage.removeItem("_actms");
    localStorage.removeItem("_actts");
    localStorage.removeItem("_actvc");
    console.log("Local storage cleared.");
    addSystemMessage("Local storage cleared.");
  }

  Genesys("registerPlugin", "Plugin", function (Plugin) {
    Plugin.command("GenesysJS.configuration").then((data) => {
      console.log("Deployment configuration:", data);
    });
  });

  Genesys("subscribe", "MessagingService.ready", () => {
    console.log("MessagingService is ready.");
    updateStatus("Online");
  });

  Genesys("subscribe", "MessagingService.started", ({ data }) => {
    console.log("MessagingService.started:", data);
    updateStatus("Connected");
  });

  Genesys("subscribe", "MessagingService.reconnecting", () => {
    console.log("Session reconnecting.");
    updateStatus("Reconnecting...");
  });

  Genesys("subscribe", "MessagingService.restored", ({ data }) => {
    console.log("MessagingService restored:", data);
    updateStatus("Restored");

    if (data && Array.isArray(data.messages)) {
      data.messages.forEach((msg) => {
        if (msg.direction === "Outbound" && msg.text) {
          addMessageToChat(msg.text, "received", msg.timestamp || new Date());
        } else if (msg.direction === "Inbound" && msg.text) {
          addMessageToChat(msg.text, "sent", msg.timestamp || new Date());
        }
      });
    }
  });

  Genesys("subscribe", "MessagingService.reconnected", () => {
    console.log("Session reconnected.");
    updateStatus("Connected");
  });

  Genesys("subscribe", "MessagingService.conversationDisconnected", () => {
    console.log("Conversation disconnected.");
    updateStatus("Disconnected");
    hideTypingIndicator();
    addSystemMessage("Conversation disconnected.");
  });

  // Optional debug only: confirms customer typing started
  Genesys("subscribe", "MessagingService.clientTypingStarted", () => {
    console.log("End user typing started.");
  });

  // Main text messages
  Genesys("subscribe", "MessagingService.messagesReceived", ({ data }) => {
    console.log("messagesReceived raw:", JSON.stringify(data, null, 2));

    if (!data || !Array.isArray(data.messages)) return;

    data.messages.forEach((msg) => {
      console.log("single received message:", msg);

      if (msg.direction === "Outbound" && msg.text) {
        hideTypingIndicator();
        addMessageToChat(msg.text, "received", msg.timestamp || new Date());
      }
    });
  });

  // Agent typing event received by customer UI
  Genesys("subscribe", "MessagingService.typingReceived", ({ data }) => {
    console.log("typingReceived raw:", JSON.stringify(data, null, 2));

    if (!data || !data.typing) return;

    const typingType = String(data.typing.type || "").toLowerCase();
    const durationMs = Number(data.typing.durationMs || 5000);

    if (typingType === "on") {
      showTypingIndicator();

      clearTimeout(agentTypingTimer);
      agentTypingTimer = setTimeout(() => {
        hideTypingIndicator();
      }, durationMs);
    } else if (typingType === "off") {
      clearTimeout(agentTypingTimer);
      hideTypingIndicator();
    }
  });

  document.getElementById("send-btn").addEventListener("click", sendMessage);
  document.getElementById("disc-btn").addEventListener("click", clearSession);
  document.getElementById("clear-convo-btn").addEventListener("click", clearConversation);
  document.getElementById("start-btn").addEventListener("click", startChat);
  document.getElementById("fetch-btn").addEventListener("click", fetchHistory);
  document.getElementById("del-btn").addEventListener("click", removeLocalValues);
  document.getElementById("send-card-btn").addEventListener("click", sendCard);

  messageInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      sendMessage();
    }
  });

  messageInput.addEventListener("input", userIsTyping);
})();