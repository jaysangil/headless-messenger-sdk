# Genesys Messenger Headless Mode - Custom UI

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Guide](#guide)
- [Reference](#reference)
- [License](#license)

## Features

- **Headless Messenger Integration:**  
  Implements Genesys Messenger in headless mode for complete UI customization.

- **Status Glow Effects:**  
  Dynamic status indicators showing:
  - **Online/Connected:** Bright green glow.
  - **Restored:** Darker green glow.
  - **Disconnected/Offline:** Red (or yellow) glow. (This is not currently implemented)

- **Custom Message Layout:**  

- **Conversation Management:**  
  - Clear conversation.
  - Fetch conversation history.
  - Clear local storage.
  - Disconnect from the session.


## Installation

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/jaysangil/headless-messenger-sdk.git
   cd headless-messenger-sdk/

2. **Open the Project:**

    - Open the HTML file in your favorite web browser, you can also use LiveServer via VS code to check
    the changes real-time.

3. **Updated Genesys Config:**

    - Use the correct deployment ID and the region for deploymentId and region variables.

## Guide

Start Chat: Send a message
Disconnect: Ends the session and updates the status.
Clear Convo: Clears the current conversation from the UI.
Clear Storage: Removes Genesys-related data from local storage.
Fetch History: Retrieves the conversation history from Genesys.

## Reference

For detailed documentation on the Genesys Messenger Headless Mode and SDK commands/events, please refer to the official Genesys documentation: [Messenger Headless Mode SDK Documentation](https://developer.genesys.cloud/commdigital/digital/webmessaging/messengersdk/messengerHeadlessmodeSDK)

You can also review the SDK commands and events for further customization:

- [MessagingService Plugin](https://developer.genesys.cloud/commdigital/digital/webmessaging/messengersdk/SDKCommandsEvents/messagingServicePlugin)

- [Messenger Plugin](https://developer.genesys.cloud/commdigital/digital/webmessaging/messengersdk/SDKCommandsEvents/messengerPlugin)

## License

---

Feel free to modify this **README.md** file to best fit your project’s specifics and your branding needs.

---
Author: jaysangil
