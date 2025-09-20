import { useState, useEffect, useCallback } from "react";
import {
  usePublicClient,
  useWatchContractEvent,
  useWriteContract,
} from "wagmi";
import priceAutomationABI from "../ABI/Price_Automation_ABI.json";

const PRICE_AUTOMATION_CONTRACT_ADDRESS = process.env
  .NEXT_PUBLIC_PRICE_AUTOMATION_CONTRACT_ADDRESS as `0x${string}`;
const CHAT_CONTRACT_ADDRESS = process.env
  .NEXT_PUBLIC_CHAT_CONTRACT_ADDRESS as `0x${string}`;

export type PriceFeedMessage = {
  groupId: bigint;
  message: string;
  timestamp: number;
};
export type AddGroupForFeeds = {
  groupId: bigint;
};

export type PriceData = {
  btcUsd: bigint;
  ethUsd: bigint;
  btcEth: bigint;
  bnbEth: bigint;
  timestamp: bigint;
};

export function usePriceAutomation() {
  const publicClient = usePublicClient();
  const [error, setError] = useState<Error | null>(null);

  const [enabledGroups, setEnabledGroups] = useState<bigint[]>([]);
  const [priceMessages, setPriceMessages] = useState<
    Record<string, PriceFeedMessage>
  >({});
  const [currentPrices, setCurrentPrices] = useState<PriceData | null>(null);
  const [timeUntilNextUpdate, setTimeUntilNextUpdate] = useState<bigint>(
    BigInt(0)
  );
  const [updateInterval, setUpdateIntervalState] = useState<bigint>(
    BigInt(300)
  );
  const [ownerAddress, setOwnerAddress] = useState<`0x${string}` | null>(null);

  const {
    writeContract: writeSendMessage,
    data: sendMessageHash,
    status: sendMessageStatus,
    error: sendMessageError,
  } = useWriteContract();

  // Fetch enabled groups for price feeds
  const fetchEnabledGroups = useCallback(async () => {
    if (!PRICE_AUTOMATION_CONTRACT_ADDRESS || !publicClient) return;
    try {
      const groups = (await publicClient.readContract({
        address: PRICE_AUTOMATION_CONTRACT_ADDRESS,
        abi: priceAutomationABI,
        functionName: "getEnabledGroups",
      })) as bigint[];
      setEnabledGroups(groups);
    } catch (error) {
      console.error("Failed to fetch enabled groups:", error);
    }
  }, [publicClient]);

  // Fetch latest price message for a group by calling getPriceMessage
  const fetchPriceMessageForGroup = useCallback(
    async (groupId: bigint) => {
      if (!PRICE_AUTOMATION_CONTRACT_ADDRESS || !publicClient) return;
      try {
        const message = (await publicClient.readContract({
          address: PRICE_AUTOMATION_CONTRACT_ADDRESS,
          abi: priceAutomationABI,
          functionName: "getPriceMessage",
        })) as string;
        const timestamp = Math.floor(Date.now() / 1000);
        setPriceMessages((prev) => ({
          ...prev,
          [groupId.toString()]: { groupId, message, timestamp },
        }));
      } catch (error) {
        console.error(
          `Failed to fetch price message for group ${groupId}:`,
          error
        );
      }
    },
    [publicClient]
  );

  // Fetch current prices
  const fetchCurrentPrices = useCallback(async () => {
    if (!PRICE_AUTOMATION_CONTRACT_ADDRESS || !publicClient) return;
    try {
      const prices = (await publicClient.readContract({
        address: PRICE_AUTOMATION_CONTRACT_ADDRESS,
        abi: priceAutomationABI,
        functionName: "getAllPrices",
      })) as [bigint, bigint, bigint, bigint, bigint];
      setCurrentPrices({
        btcUsd: prices[0],
        ethUsd: prices[1],
        btcEth: prices[2],
        bnbEth: prices[3],
        timestamp: prices[4],
      });
    } catch (error) {
      console.error("Failed to fetch current prices:", error);
    }
  }, [publicClient]);

  // Fetch time until next update
  const fetchTimeUntilNextUpdate = useCallback(async () => {
    if (!PRICE_AUTOMATION_CONTRACT_ADDRESS || !publicClient) return;
    try {
      const time = (await publicClient.readContract({
        address: PRICE_AUTOMATION_CONTRACT_ADDRESS,
        abi: priceAutomationABI,
        functionName: "getTimeUntilNextUpdate",
      })) as bigint;
      setTimeUntilNextUpdate(time);
    } catch (error) {
      console.error("Failed to fetch time until next update:", error);
    }
  }, [publicClient]);

  // Fetch update interval
  const fetchUpdateInterval = useCallback(async () => {
    if (!PRICE_AUTOMATION_CONTRACT_ADDRESS || !publicClient) return;
    try {
      const interval = (await publicClient.readContract({
        address: PRICE_AUTOMATION_CONTRACT_ADDRESS,
        abi: priceAutomationABI,
        functionName: "updateInterval",
      })) as bigint;
      setUpdateIntervalState(interval);
    } catch (error) {
      console.error("Failed to fetch update interval:", error);
    }
  }, [publicClient]);

  // Fetch owner address
  const fetchOwnerAddress = useCallback(async () => {
    if (!PRICE_AUTOMATION_CONTRACT_ADDRESS || !publicClient) return;
    try {
      const owner = (await publicClient.readContract({
        address: PRICE_AUTOMATION_CONTRACT_ADDRESS,
        abi: priceAutomationABI,
        functionName: "owner",
      })) as `0x${string}`;
      setOwnerAddress(owner);
    } catch (error) {
      console.error("Failed to fetch owner address:", error);
    }
  }, [publicClient]);

  const addGroupForFeeds = useCallback(
    (groupChatId: bigint) => {
      if (!PRICE_AUTOMATION_CONTRACT_ADDRESS) {
        setError(new Error("Chat contract address not configured"));
        return;
      }
      const groupChatNumber = writeSendMessage({
        address: PRICE_AUTOMATION_CONTRACT_ADDRESS,
        abi: priceAutomationABI,
        functionName: "addGroupForFeeds",
        args: [groupChatId],
      });
      return groupChatNumber;
    },
    [writeSendMessage]
  );

  const removeGroupForFeeds = useCallback(
    (groupChatId: bigint) => {
      if (!PRICE_AUTOMATION_CONTRACT_ADDRESS) {
        setError(new Error("Chat contract address not configured"));
        return;
      }
      const groupChatNumber = writeSendMessage({
        address: PRICE_AUTOMATION_CONTRACT_ADDRESS,
        abi: priceAutomationABI,
        functionName: "removeGroupForFeeds",
        args: [groupChatId],
      });
      return groupChatNumber;
    },
    [writeSendMessage]
  );

  const manualUpdate = useCallback(() => {
    if (!PRICE_AUTOMATION_CONTRACT_ADDRESS) {
      setError(new Error("Chat contract address not configured"));
      return;
    }
    const updateNumber = writeSendMessage({
      address: PRICE_AUTOMATION_CONTRACT_ADDRESS,
      abi: priceAutomationABI,
      functionName: "manualUpdate",
      args: [],
    });
    return updateNumber;
  }, [writeSendMessage]);

  const setUpdateInterval = useCallback(
    (interval: bigint) => {
      if (!PRICE_AUTOMATION_CONTRACT_ADDRESS) {
        setError(new Error("Chat contract address not configured"));
        return;
      }
      const intervalNumber = writeSendMessage({
        address: PRICE_AUTOMATION_CONTRACT_ADDRESS,
        abi: priceAutomationABI,
        functionName: "setUpdateInterval",
        args: [interval],
      });
      return intervalNumber;
    },
    [writeSendMessage]
  );

  // Listen for PricesUpdated event to refresh data
  useWatchContractEvent({
    address: PRICE_AUTOMATION_CONTRACT_ADDRESS,
    abi: priceAutomationABI,
    eventName: "PricesUpdated",
    onLogs() {
      fetchEnabledGroups();
      fetchCurrentPrices();
      fetchTimeUntilNextUpdate();
    },
  });

  // Initial fetch of all data
  useEffect(() => {
    fetchEnabledGroups();
    fetchCurrentPrices();
    fetchTimeUntilNextUpdate();
    fetchUpdateInterval();
    fetchOwnerAddress();
  }, [
    fetchEnabledGroups,
    fetchCurrentPrices,
    fetchTimeUntilNextUpdate,
    fetchUpdateInterval,
    fetchOwnerAddress,
  ]);

  // When enabledGroups change, fetch price messages for each
  useEffect(() => {
    enabledGroups.forEach((groupId) => {
      fetchPriceMessageForGroup(groupId);
    });
  }, [enabledGroups, fetchPriceMessageForGroup]);

  return {
    enabledGroups,
    priceMessages,
    currentPrices,
    timeUntilNextUpdate,
    updateInterval,
    ownerAddress,
    fetchPriceMessageForGroup,
    addGroupForFeeds,
    removeGroupForFeeds,
    manualUpdate,
    setUpdateInterval,
    error,
    isSendingMessage: sendMessageStatus === "pending",
  };
}
