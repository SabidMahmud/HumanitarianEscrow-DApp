"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { BrowserProvider, Contract } from "ethers";
import { CONTRACT_ADDRESS, HUMANITARIAN_ESCROW_ABI } from "@/config/contract";
import { GANACHE_CHAIN_ID } from "@/lib/constants";

export type Role =
  | "UN_ARBITER"
  | "DONOR"
  | "RELIEF_AGENCY"
  | "UNREGISTERED"
  | null;

interface Web3State {
  address: string | null;
  role: Role;
  reputation: number;
  isLoading: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

const Web3Context = createContext<Web3State>({
  address: null,
  role: null,
  reputation: 0,
  isLoading: true,
  connectWallet: async () => {},
  disconnectWallet: () => {},
});

export const useWeb3 = () => useContext(Web3Context);

export function Web3Provider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [role, setRole] = useState<Role>(null);
  const [reputation, setReputation] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const switchToGanacheNetwork = async (
    provider: BrowserProvider,
  ): Promise<boolean> => {
    const ganacheHexChainId = `0x${GANACHE_CHAIN_ID.toString(16)}`;

    try {
      await provider.send("wallet_switchEthereumChain", [
        { chainId: ganacheHexChainId },
      ]);
      return true;
    } catch (error: any) {
      if (error?.code !== 4902) return false;

      try {
        await provider.send("wallet_addEthereumChain", [
          {
            chainId: ganacheHexChainId,
            chainName: "Ganache Local",
            rpcUrls: ["http://127.0.0.1:8545"],
            nativeCurrency: {
              name: "Ether",
              symbol: "ETH",
              decimals: 18,
            },
          },
        ]);
        return true;
      } catch {
        return false;
      }
    }
  };

  const ensureSupportedNetwork = async (
    provider: BrowserProvider,
  ): Promise<boolean> => {
    const network = await provider.getNetwork();
    if (Number(network.chainId) === GANACHE_CHAIN_ID) return true;

    const switched = await switchToGanacheNetwork(provider);
    if (!switched) return false;

    const updatedNetwork = await provider.getNetwork();
    return Number(updatedNetwork.chainId) === GANACHE_CHAIN_ID;
  };

  const ensureContractDeployment = async (
    provider: BrowserProvider,
  ): Promise<boolean> => {
    if (!CONTRACT_ADDRESS) {
      console.error("NEXT_PUBLIC_CONTRACT_ADDRESS is not set.");
      return false;
    }

    const code = await provider.getCode(CONTRACT_ADDRESS);
    return code !== "0x";
  };

  const refetchUserData = async (
    provider: BrowserProvider,
    userAddress: string,
  ) => {
    setIsLoading(true);
    try {
      const onExpectedNetwork = await ensureSupportedNetwork(provider);
      if (!onExpectedNetwork) {
        setRole(null);
        setReputation(0);
        alert("Please switch MetaMask to Ganache Local (Chain ID 1337).");
        return;
      }

      const contractExists = await ensureContractDeployment(provider);
      if (!contractExists) {
        setRole(null);
        setReputation(0);
        alert(
          "Contract not found on this network. Redeploy or update NEXT_PUBLIC_CONTRACT_ADDRESS.",
        );
        return;
      }

      const contract = new Contract(
        CONTRACT_ADDRESS,
        HUMANITARIAN_ESCROW_ABI,
        provider,
      );

      const unArbiterAddress: string = await contract.unArbiter();

      if (unArbiterAddress.toLowerCase() === userAddress.toLowerCase()) {
        setRole("UN_ARBITER");
      } else {
        const userData = await contract.users(userAddress);
        if (!userData.isRegistered) {
          setRole("UNREGISTERED");
        } else {
          if (Number(userData.role) === 1) {
            // 1 means Donor
            setRole("DONOR");
          } else if (Number(userData.role) === 2) {
            // 2 means Relief_Agency
            setRole("RELIEF_AGENCY");
          } else {
            console.error("Unknown role registered.");
            setRole("UNREGISTERED");
          }
          setReputation(Number(userData.reputationScore));
        }
      }
    } catch (error) {
      console.error("Failed to read from contract:", error);
      // Contract might not be deployed locally
    } finally {
      setIsLoading(false);
    }
  };

  const connectWallet = async () => {
    if (typeof window === "undefined" || !(window as any).ethereum) {
      alert("Please install MetaMask!");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const provider = new BrowserProvider((window as any).ethereum);

      const onExpectedNetwork = await ensureSupportedNetwork(provider);
      if (!onExpectedNetwork) {
        alert("Please switch MetaMask to Ganache Local (Chain ID 1337).");
        setIsLoading(false);
        return;
      }

      const accounts = await provider.send("eth_requestAccounts", []);
      if (accounts.length > 0) {
        setAddress(accounts[0]);
        await refetchUserData(provider, accounts[0]);
      }
    } catch (error) {
      console.error("Connection error:", error);
      setIsLoading(false);
    }
  };

  const disconnectWallet = () => {
    setAddress(null);
    setRole(null);
    setReputation(0);
  };

  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window !== "undefined" && (window as any).ethereum) {
        try {
          const provider = new BrowserProvider((window as any).ethereum);
          const accounts = await provider.listAccounts();
          if (accounts.length > 0) {
            setAddress(accounts[0].address);
            await refetchUserData(provider, accounts[0].address);
          } else {
            setIsLoading(false);
          }
        } catch (error) {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    checkConnection();

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
        setAddress(accounts[0]);
        if ((window as any).ethereum) {
          const provider = new BrowserProvider((window as any).ethereum);
          refetchUserData(provider, accounts[0]);
        }
      }
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    if ((window as any).ethereum) {
      (window as any).ethereum.on("accountsChanged", handleAccountsChanged);
      (window as any).ethereum.on("chainChanged", handleChainChanged);
    }

    return () => {
      if ((window as any).ethereum && (window as any).ethereum.removeListener) {
        (window as any).ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged,
        );
        (window as any).ethereum.removeListener(
          "chainChanged",
          handleChainChanged,
        );
      }
    };
  }, []);

  return (
    <Web3Context.Provider
      value={{
        address,
        role,
        reputation,
        isLoading,
        connectWallet,
        disconnectWallet,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
}
