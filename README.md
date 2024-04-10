# Whatsapp Bot

Whatsapp Bot is an innovative solution designed to provide AI-powered responses to users via WhatsApp. Users can text a specific WhatsApp number and receive automated, intelligent replies based on a predefined set of rules and data sources. This bot can serve a variety of purposes, from answering FAQs to providing guidance on specific topics.

## Features

- **AI Responses:** Utilizes AI to generate context-aware responses to user inquiries.
- **Integration with WhatsApp:** Directly interacts with users through WhatsApp, one of the most popular messaging platforms.
- **Firebase Database:** Leverages Firebase Firestore for storing and retrieving conversation histories and user data.
- **Custom Conversation Flows:** Supports custom conversation steps and logic to guide user interactions.
- **QR Code Login:** Easy WhatsApp client authentication using QR code scanning.

## Getting Started

### Prerequisites

- Node.js and npm installed on your system.
- A Firebase project for database interactions.
- WhatsApp account for setting up the bot.

### Setup

1. Clone the repository:
    ```bash
    git clone https://github.com/michael-sutu/Whatsapp-Bot.git
    ```
2. Navigate to the project directory and install dependencies:
    ```bash
    cd Whatsapp-Bot
    npm install
    ```
3. Configure your Firebase project settings in the `firebaseConfig` object within the code.
4. Start the application:
    ```bash
    npm start
    ```
5. Scan the QR code generated in the console with your WhatsApp mobile app to authenticate.

### Usage

- **Starting Conversations:** Users can start conversations by sending messages to the WhatsApp number associated with the bot.
- **Interactive Responses:** The bot provides responses based on the conversation context, stored user data, and predefined logic.
- **Customization:** Customize the bot's responses and logic by modifying the AI response generation and conversation flow in the code.

## Technology Stack

- **Node.js:** For running the server and bot logic.
- **whatsapp-web.js:** A high-level API to control a WhatsApp Web session.
- **Firebase Firestore:** For database operations (storing user data and conversation histories).
- **Express.js:** For handling HTTP requests.
- **qrcode-terminal:** For generating QR codes for WhatsApp client authentication.
