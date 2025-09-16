import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { useState } from "react";

// Chat contract ABI
const chatABI = [
  {
    inputs: [
      {
        internalType: "string",
        name: "_name",
        type: "string",
      },
    ],
    name: "createGroupChat",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_groupChatId",
        type: "uint256",
      },
    ],
    name: "joinGroupChat",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_groupChatId",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "_contentCid",
        type: "string",
      },
    ],
    name: "sendMessage",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_otherUser",
        type: "address",
      },
    ],
    name: "privateGroupChat",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_groupChatId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_start",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_count",
        type: "uint256",
      },
    ],
    name: "getMessages",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "sender",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "timestamp",
            type: "uint256",
          },
          {
            internalType: "string",
            name: "contentCid",
            type: "string",
          },
        ],
        internalType: "struct WinsomeChat.Message[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_user",
        type: "address",
      },
    ],
    name: "getTotalGroupChats",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "groupChatId",
            type: "uint256",
          },
          {
            internalType: "string",
            name: "name",
            type: "string",
          },
        ],
        internalType: "struct WinsomeChat.GroupChatInfo[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_groupChatId",
        type: "uint256",
      },
    ],
    name: "getGroupChatUserCount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

// Contract address - should be set via environment variable
const CHAT_CONTRACT_ADDRESS = process.env
  .NEXT_PUBLIC_CHAT_CONTRACT_ADDRESS as `0x${string}`;

export interface Message {
  sender: `0x${string}`;
  timestamp: bigint;
  contentCid: string;
}

export interface GroupChatInfo {
  groupChatId: bigint;
  name: string;
}

export const useChat = () => {
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [isJoiningGroup, setIsJoiningGroup] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isCreatingPrivateChat, setIsCreatingPrivateChat] = useState(false);

  // Write contract hooks
  const { writeContract: writeCreateGroup, data: createGroupHash } =
    useWriteContract();
  const { writeContract: writeJoinGroup, data: joinGroupHash } =
    useWriteContract();
  const { writeContract: writeSendMessage, data: sendMessageHash } =
    useWriteContract();
  const { writeContract: writeCreatePrivate, data: createPrivateHash } =
    useWriteContract();

  // Transaction receipt hooks
  const {
    isLoading: isCreateGroupConfirming,
    isSuccess: isCreateGroupSuccess,
  } = useWaitForTransactionReceipt({
    hash: createGroupHash,
  });

  const { isLoading: isJoinGroupConfirming, isSuccess: isJoinGroupSuccess } =
    useWaitForTransactionReceipt({
      hash: joinGroupHash,
    });

  const {
    isLoading: isSendMessageConfirming,
    isSuccess: isSendMessageSuccess,
  } = useWaitForTransactionReceipt({
    hash: sendMessageHash,
  });

  const {
    isLoading: isCreatePrivateConfirming,
    isSuccess: isCreatePrivateSuccess,
  } = useWaitForTransactionReceipt({
    hash: createPrivateHash,
  });

  const createGroupChat = async (name: string) => {
    if (!CHAT_CONTRACT_ADDRESS) {
      throw new Error("Chat contract address not configured");
    }

    setIsCreatingGroup(true);
    try {
      writeCreateGroup({
        address: CHAT_CONTRACT_ADDRESS,
        abi: chatABI,
        functionName: "createGroupChat",
        args: [name],
      });
    } catch (error) {
      setIsCreatingGroup(false);
      throw error;
    }
  };

  const joinGroupChat = async (groupChatId: bigint) => {
    if (!CHAT_CONTRACT_ADDRESS) {
      throw new Error("Chat contract address not configured");
    }

    setIsJoiningGroup(true);
    try {
      writeJoinGroup({
        address: CHAT_CONTRACT_ADDRESS,
        abi: chatABI,
        functionName: "joinGroupChat",
        args: [groupChatId],
      });
    } catch (error) {
      setIsJoiningGroup(false);
      throw error;
    }
  };

  const sendMessage = async (groupChatId: bigint, contentCid: string) => {
    if (!CHAT_CONTRACT_ADDRESS) {
      throw new Error("Chat contract address not configured");
    }

    setIsSendingMessage(true);
    try {
      writeSendMessage({
        address: CHAT_CONTRACT_ADDRESS,
        abi: chatABI,
        functionName: "sendMessage",
        args: [groupChatId, contentCid],
      });
    } catch (error) {
      setIsSendingMessage(false);
      throw error;
    }
  };

  const createPrivateChat = async (otherUser: `0x${string}`) => {
    if (!CHAT_CONTRACT_ADDRESS) {
      throw new Error("Chat contract address not configured");
    }

    setIsCreatingPrivateChat(true);
    try {
      writeCreatePrivate({
        address: CHAT_CONTRACT_ADDRESS,
        abi: chatABI,
        functionName: "privateGroupChat",
        args: [otherUser],
      });
    } catch (error) {
      setIsCreatingPrivateChat(false);
      throw error;
    }
  };

  const getMessages = async (
    groupChatId: bigint,
    start: bigint = BigInt(0),
    count: bigint = BigInt(10)
  ) => {
    if (!CHAT_CONTRACT_ADDRESS) {
      throw new Error("Chat contract address not configured");
    }

    const { data } = await useReadContract({
      address: CHAT_CONTRACT_ADDRESS,
      abi: chatABI,
      functionName: "getMessages",
      args: [groupChatId, start, count],
    });

    return data as Message[];
  };

  const getUserGroupChats = async (userAddress: `0x${string}`) => {
    if (!CHAT_CONTRACT_ADDRESS) {
      throw new Error("Chat contract address not configured");
    }

    const { data } = await useReadContract({
      address: CHAT_CONTRACT_ADDRESS,
      abi: chatABI,
      functionName: "getTotalGroupChats",
      args: [userAddress],
    });

    return data as GroupChatInfo[];
  };

  const getGroupChatUserCount = async (groupChatId: bigint) => {
    if (!CHAT_CONTRACT_ADDRESS) {
      throw new Error("Chat contract address not configured");
    }

    const { data } = await useReadContract({
      address: CHAT_CONTRACT_ADDRESS,
      abi: chatABI,
      functionName: "getGroupChatUserCount",
      args: [groupChatId],
    });

    return data as bigint;
  };

  return {
    // Group creation
    createGroupChat,
    isCreatingGroup,
    isCreateGroupConfirming,
    isCreateGroupSuccess,

    // Group joining
    joinGroupChat,
    isJoiningGroup,
    isJoinGroupConfirming,
    isJoinGroupSuccess,

    // Messaging
    sendMessage,
    isSendingMessage,
    isSendMessageConfirming,
    isSendMessageSuccess,

    // Private chat
    createPrivateChat,
    isCreatingPrivateChat,
    isCreatePrivateConfirming,
    isCreatePrivateSuccess,

    // Read functions
    getMessages,
    getUserGroupChats,
    getGroupChatUserCount,
  };
};
