const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const originalSendText = sendBtn.textContent;
const chatBox = document.getElementById("chat-box");

const typingIndicator = document.getElementById("typing-indicator");
const clearBtn = document.getElementById("clear-btn");

const webhookUrl = "YOUR_N8N_WEBHOOK_URL";

function addMessage(message, sender) {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message");

    if (sender === "user") {
        messageDiv.classList.add("user-message");
    } else {
        messageDiv.classList.add("bot-message");
    }

    const textDiv = document.createElement("div");
    textDiv.textContent = message;

    const timeDiv = document.createElement("div");
    timeDiv.classList.add("message-time");
    timeDiv.textContent = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });

    messageDiv.appendChild(textDiv);
    messageDiv.appendChild(timeDiv);
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

async function sendToN8n(message) {
    typingIndicator.style.display = "flex";
    sendBtn.disabled = true;
    sendBtn.textContent = "Sending...";
    try {
        const response = await fetch(webhookUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ message: message })
        });

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        const data = await response.json();
        console.log("n8n response:", data);

        addMessage(data.reply || "I received your message!", "bot");

    } catch (error) {
        console.error("Error:", error);
        addMessage(
            "Sorry, I couldn't connect to the chatbot. Please try again.",
            "bot"
        );

    } finally {
        typingIndicator.style.display = "none";
        sendBtn.disabled = false;
        sendBtn.textContent = originalSendText;
    }
}

function sendMessage() {
    if (sendBtn.disabled) return;

    const message = userInput.value.trim();
    if (message === "") return;

    addMessage(message, "user");
    document.getElementById("suggested-prompts").style.display = "none";

    userInput.value = "";

    sendToN8n(message);
}

sendBtn.addEventListener("click", sendMessage);

userInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        sendMessage();
    }
});
clearBtn.addEventListener("click", function () {
    if (sendBtn.disabled) {
        return;
    }

    chatBox.innerHTML = "";
    userInput.value = "";
    userInput.focus();
});
const suggestionButtons = document.querySelectorAll(".suggestion-btn");

suggestionButtons.forEach(function (button) {
    button.addEventListener("click", function () {
        if (sendBtn.disabled) return;

        userInput.value = button.textContent.trim();
        sendMessage();
    });
});
