# Project Architecture

[User Browser / Frontend (React/Next.js + ethers.js)]
|
├── Wallet Connection (MetaMask/WalletConnect)
| └── ENS Login/Resolution (via ENS.js or ethers provider)
|
├── Profile Upload & Retrieval
| └── IPFS Gateway (Pinata/Infura IPFS API)
| ├── Upload: Name + Photo → JSON Metadata → CID (Content ID)
| └── Retrieve: Fetch CID from Smart Contract → Display in Dashboard
|
├── Chat Interface (Private/Group)
| ├── Real-time Updates: WebSockets (e.g., Socket.io off-chain) or Polling Events
| └── Message Handling
| ├── Send: Encrypt Message → Upload to IPFS → Store Hash/Metadata in Smart Contract
| └── Receive: Query Smart Contract Events/Subgraph → Fetch from IPFS
|
└── Indexing/Querying (Optional: The Graph Subgraph for efficient off-chain queries)

[Smart Contracts on Ethereum (Solidity)]
├── ProfileContract (ENS-Linked Profiles)
| └── Stores IPFS CIDs for user profiles (linked to wallet address or ENS name)
|
└── ChatContract (Messaging & Groups)
├── Private Chats: 1:1 rooms (mapping address pairs to messages)
├── Group Chats: Room creation, join/leave, message broadcasts
└── Events: Emitted for new messages (indexed for querying)

[Off-Chain Components]
├── IPFS Network (Decentralized Storage)
| └── Pinning Service (e.g., Pinata) for persistence
|
├── ENS Registry (Ethereum Mainnet/Testnet)
| └── For human-readable names (.eth domains)
|
├── Event Listener: Watch Smart Contract events for new messages
└── Database: IPFS CIDs or OrbitDB for P2P storage (if fully decentralized)

[Data Flow]

1. User connects wallet → App resolves ENS name (if owned) or prompts to claim/register.
2. Login: Upload profile (name/photo as JSON) to IPFS → Get CID → Call ProfileContract.setProfile(CID).
3. Dashboard: Query ProfileContract.getProfile(address) → Fetch from IPFS → Display.
4. Chat: User selects peer/group → Compose message → Encrypt (optional, e.g., via libsodium) → Upload to IPFS → Call ChatContract.sendMessage(roomId, CID, timestamp).
5. All users query ChatContract or events → Fetch messages from IPFS → Decrypt if needed.

_Assignment_
Fetch data price using chainlink
Send it as a message to the group chat after a time frame and let it display the following

1. BTC/USD
2. ETH/USD
3. BTC/ETH
4. BNB/ETH
