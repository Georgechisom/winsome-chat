import { useAccount, useConnect, useDisconnect } from "wagmi";
import { useState, useEffect, useCallback } from "react";

export const useWallet = () => {
  const { address, isConnected, isConnecting } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  const connectWallet = useCallback(() => {
    if (connectors.length > 0) {
      connect({ connector: connectors[0] });
    }
  }, [connect, connectors]);

  const disconnectWallet = useCallback(() => {
    disconnect();
  }, [disconnect]);

  const openWalletModal = useCallback(() => {
    setIsWalletModalOpen(true);
  }, []);

  const closeWalletModal = useCallback(() => {
    setIsWalletModalOpen(false);
  }, []);

  return {
    address,
    isConnected,
    isConnecting,
    connectWallet,
    disconnectWallet,
    isWalletModalOpen,
    openWalletModal,
    closeWalletModal,
  };
};
