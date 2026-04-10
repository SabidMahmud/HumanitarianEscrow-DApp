"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { BrowserProvider, Contract } from "ethers";
import { CONTRACT_ADDRESS, HUMANITARIAN_ESCROW_ABI } from "@/config/contract";

export type Role = "UN_ARBITER" | "DONOR" | "RELIEF_AGENCY" | "UNREGISTERED" | null;

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

  const refetchUserData = async (provider: BrowserProvider, userAddress: string) => {
    setIsLoading(true);
    try {
      const contract = new Contract(CONTRACT_ADDRESS, HUMANITARIAN_ESCROW_ABI, provider);
      
      const unArbiterAddress: string = await contract.unArbiter();
      
      if (unArbiterAddress.toLowerCase() === userAddress.toLowerCase()) {
        setRole("UN_ARBITER");
      } else {
        const userData = await contract.users(userAddress);
        if (!userData.isRegistered) {
          setRole("UNREGISTERED");
        } else {
          if (Number(userData.role) === 1) { // 1 means Donor
            setRole("DONOR");
          } else if (Number(userData.role) === 2) { // 2 means Relief_Agency
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
        (window as any).ethereum.removeListener("accountsChanged", handleAccountsChanged);
        (window as any).ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, []);

  return (
    <Web3Context.Provider
      value={{ address, role, reputation, isLoading, connectWallet, disconnectWallet }}
    >
      {children}
    </Web3Context.Provider>
  );
}
