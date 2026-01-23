"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  StellarWalletsKit,
  WalletNetwork,
  allowAllModules,
} from "@creit.tech/stellar-wallets-kit";

export type WalletId = string;

interface WalletContextType {
  connect: (walletId: WalletId) => Promise<void>;
  disconnect: () => Promise<void>;
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  selectedWalletId: string | null;
  network: WalletNetwork;
  setNetwork: (network: WalletNetwork) => void;
  signTransaction: (xdr: string) => Promise<string>;
  openModal: () => void;
  closeModal: () => void;
  isModalOpen: boolean;
  supportedWallets: { id: WalletId; name: string; icon: string }[];
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a StellarWalletProvider");
  }
  return context;
};

export const StellarWalletProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedWalletId, setSelectedWalletId] = useState<WalletId | null>(
    null,
  );
  const [network, setNetworkState] = useState<WalletNetwork>(
    WalletNetwork.TESTNET,
  );
  const [kit, setKit] = useState<StellarWalletsKit | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Initialize kit and handle persistence
  useEffect(() => {
    const walletKit = new StellarWalletsKit({
      network: network,
      selectedWalletId: "freighter",
      modules: allowAllModules(),
    });
    setKit(walletKit);

    // Only restore on initial load if network hasn't changed from saved state
    // (Assuming we might want to save network in future, for now we just clear on switch)
    const savedAddress = localStorage.getItem("stellar_wallet_address");
    const savedWalletId = localStorage.getItem("stellar_wallet_id");
    const savedNetwork = localStorage.getItem("stellar_wallet_network");

    if (savedAddress && savedWalletId && savedNetwork === network) {
      setAddress(savedAddress);
      setSelectedWalletId(savedWalletId);
      walletKit.setWallet(savedWalletId);
    }
  }, [network]);

  const disconnect = useCallback(async () => {
    setAddress(null);
    setSelectedWalletId(null);
    localStorage.removeItem("stellar_wallet_address");
    localStorage.removeItem("stellar_wallet_id");
    localStorage.removeItem("stellar_wallet_network");
  }, []);

  const setNetwork = (newNetwork: WalletNetwork) => {
    if (newNetwork !== network) {
      disconnect();
      setNetworkState(newNetwork);
    }
  };

  const supportedWallets: { id: WalletId; name: string; icon: string }[] = [
    { id: "freighter", name: "Freighter", icon: "/icons/freighter.png" },
    { id: "albedo", name: "Albedo", icon: "/icons/albedo.png" },
    { id: "xbull", name: "xBull", icon: "/icons/xbull.png" },
    { id: "rabet", name: "Rabet", icon: "/icons/rabet.png" },
    { id: "lobstr", name: "Lobstr", icon: "/icons/lobstr.png" },
  ];

  const connect = async (walletId: WalletId) => {
    if (!kit) return;
    setIsConnecting(true);
    try {
      kit.setWallet(walletId);
      const { address } = await kit.getAddress();

      setAddress(address);
      setSelectedWalletId(walletId);
      localStorage.setItem("stellar_wallet_address", address);
      localStorage.setItem("stellar_wallet_id", walletId);
      localStorage.setItem("stellar_wallet_network", network);
      setIsModalOpen(false);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error("Connection failed:", error);
      // Handle "Wallet not installed" or user rejection
      if (errorMessage.includes("not installed")) {
        alert(
          `${walletId} wallet is not installed. Please install it to continue.`,
        );
      }
      throw error;
    } finally {
      setIsConnecting(false);
    }
  };

  const signTransaction = useCallback(
    async (xdr: string) => {
      if (!kit || !address) throw new Error("Wallet not connected");
      try {
        const { signedTxXdr } = await kit.signTransaction(xdr);
        return signedTxXdr;
      } catch (error) {
        console.error("Signing failed:", error);
        throw error;
      }
    },
    [kit, address],
  );

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <WalletContext.Provider
      value={{
        connect,
        disconnect,
        address,
        isConnected: !!address,
        isConnecting,
        selectedWalletId,
        network,
        setNetwork,
        signTransaction,
        openModal,
        closeModal,
        isModalOpen,
        supportedWallets,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
