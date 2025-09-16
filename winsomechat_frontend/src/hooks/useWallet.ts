import { useAccount, useConnect, useDisconnect } from "wagmi";
import { useState, useEffect } from "react";

export const useWallet = () => {
  const { address, isConnected, isConnecting } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  const connectWallet = () => {
    if (connectors.length > 0) {
      connect({ connector: connectors[0] });
    }
  };

  const disconnectWallet = () => {
    disconnect();
  };

  const openWalletModal = () => {
    setIsWalletModalOpen(true);
  };

  const closeWalletModal = () => {
    setIsWalletModalOpen(false);
  };

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
