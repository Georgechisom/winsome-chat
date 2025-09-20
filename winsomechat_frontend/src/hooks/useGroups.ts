import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { useState, useCallback, useEffect } from "react";
import chatABI from "../ABI/Chat_Abi.json";
import {
  getMessages,
  getGroupChats,
  getGroupChatUserCount,
  Message,
  GroupChatInfo,
  getTotalGroupChatsPerUser,
  getAllGroupChats,
  leaveGroupChat as leaveGroupChatUtil,
} from "../lib/chatMessaging";
import { usePriceAutomation, PriceFeedMessage } from "./usePriceAutomation";

// Contract address - should be set via environment variable
const CHAT_CONTRACT_ADDRESS = process.env
  .NEXT_PUBLIC_CHAT_CONTRACT_ADDRESS as `0x${string}`;

export type { Message, GroupChatInfo };

export const useGroups = () => {
  const { address } = useAccount();
  const [chats, setChats] = useState<GroupChatInfo[]>([]);
  const [allGroups, setAllGroups] = useState<GroupChatInfo[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<GroupChatInfo | null>(
    null
  );
  const [selectedGroupMemberCount, setSelectedGroupMemberCount] =
    useState<bigint>(BigInt(0));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Price automation hook
  const { priceMessages } = usePriceAutomation();

  // Write contract hooks
  const {
    writeContract: writeCreateGroup,
    data: createGroupHash,
    status: createGroupStatus,
    error: createGroupError,
  } = useWriteContract();
  const {
    writeContract: writeJoinGroup,
    data: joinGroupHash,
    status: joinGroupStatus,
    error: joinGroupError,
  } = useWriteContract();
  const {
    writeContract: writeSendMessage,
    data: sendMessageHash,
    status: sendMessageStatus,
    error: sendMessageError,
  } = useWriteContract();
  const {
    writeContract: writeLeaveGroup,
    data: leaveGroupHash,
    status: leaveGroupStatus,
    error: leaveGroupError,
  } = useWriteContract();

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

  const { isLoading: isLeaveGroupConfirming, isSuccess: isLeaveGroupSuccess } =
    useWaitForTransactionReceipt({
      hash: leaveGroupHash,
    });

  const createGroupChat = useCallback(
    (name: string) => {
      if (!CHAT_CONTRACT_ADDRESS) {
        throw new Error("Chat contract address not configured");
      }
      writeCreateGroup({
        address: CHAT_CONTRACT_ADDRESS,
        abi: chatABI,
        functionName: "createGroupChat",
        args: [name],
      });
    },
    [writeCreateGroup]
  );

  const joinGroupChat = useCallback(
    (groupChatId: bigint) => {
      if (!CHAT_CONTRACT_ADDRESS) {
        throw new Error("Chat contract address not configured");
      }
      writeJoinGroup({
        address: CHAT_CONTRACT_ADDRESS,
        abi: chatABI,
        functionName: "joinGroupChat",
        args: [groupChatId],
      });
    },
    [writeJoinGroup]
  );

  const sendMessage = useCallback(
    (groupChatId: bigint, contentCid: string) => {
      if (!CHAT_CONTRACT_ADDRESS) {
        setError(new Error("Chat contract address not configured"));
        return;
      }
      writeSendMessage({
        address: CHAT_CONTRACT_ADDRESS,
        abi: chatABI,
        functionName: "sendGroupMessage",
        args: [groupChatId, contentCid],
      });
    },
    [writeSendMessage]
  );

  const leaveGroupChat = useCallback(
    (groupChatId: bigint) => {
      if (!CHAT_CONTRACT_ADDRESS) {
        setError(new Error("Chat contract address not configured"));
        return;
      }
      writeLeaveGroup({
        address: CHAT_CONTRACT_ADDRESS,
        abi: chatABI,
        functionName: "leaveGroupChat",
        args: [groupChatId],
      });
    },
    [writeLeaveGroup]
  );

  const fetchMessages = useCallback(
    async (groupChatId: bigint) => {
      setLoading(true);
      setError(null);
      try {
        const data = await getMessages(groupChatId);
        // Merge price feed messages for this group if any
        const priceFeedMsgs: Message[] = [];
        if (priceMessages) {
          Object.values(priceMessages).forEach((pfm: PriceFeedMessage) => {
            if (pfm.groupId.toString() === groupChatId.toString()) {
              priceFeedMsgs.push({
                sender: "0x0000000000000000000000000000000000000000",
                timestamp: BigInt(pfm.timestamp),
                content: pfm.message,
              });
            }
          });
          console.log("feeds", priceFeedMsgs);
        }
        // Combine and sort by timestamp ascending
        const combinedMessages = [...data, ...priceFeedMsgs].sort(
          (a, b) => Number(a.timestamp) - Number(b.timestamp)
        );
        setMessages(combinedMessages);
      } catch (e) {
        setError(e as Error);
      } finally {
        setLoading(false);
      }
    },
    [priceMessages]
  );

  const fetchGroupMemberCount = useCallback(async (groupChatId: bigint) => {
    try {
      const count = await getGroupChatUserCount(groupChatId);
      setSelectedGroupMemberCount(count);
    } catch (e) {
      setError(e as Error);
    }
  }, []);

  const fetchGroupChats = useCallback(async () => {
    if (!address) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const userGroups = await getGroupChats(address);
      setChats(userGroups);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, [address]);

  const fetchAllGroups = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const allGroupsData = await getAllGroupChats();
      setAllGroups(allGroupsData);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    // Group creation
    createGroupChat,
    isCreatingGroup: createGroupStatus === "pending" || isCreateGroupConfirming,
    isCreateGroupSuccess,
    createGroupError,

    // Group joining
    joinGroupChat,
    isJoiningGroup: joinGroupStatus === "pending" || isJoinGroupConfirming,
    isJoinGroupSuccess,
    joinGroupError,

    // Group leaving
    leaveGroupChat,
    isLeavingGroup: leaveGroupStatus === "pending" || isLeaveGroupConfirming,
    isLeaveGroupSuccess,
    leaveGroupError,

    // Messaging
    sendMessage,
    isSendingMessage:
      sendMessageStatus === "pending" || isSendMessageConfirming,
    isSendMessageSuccess,
    sendMessageError,

    // Read functions
    fetchMessages,
    fetchGroupChats,
    fetchAllGroups,
    fetchGroupMemberCount,

    // State
    chats,
    allGroups,
    messages,
    selectedGroup,
    setSelectedGroup,
    selectedGroupMemberCount,
    loading,
    error,
  };
};
