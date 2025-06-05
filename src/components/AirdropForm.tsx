// "use client";

// import { InputForm } from "@/components/ui/InputField";
// import { useState, useMemo } from "react";
// import { chainsToTSender, erc20Abi, tsenderAbi } from "@/constants";
// import { useChainId, useConfig, useAccount, useWriteContract } from "wagmi";
// import { readContract, waitForTransactionReceipt } from "@wagmi/core";
// import { calculateTotal } from "@/utils";

// export default function AirdropForm() {
//   const [tokenAddress, setTokenAddress] = useState("");
//   const [recipients, setRecipients] = useState("");
//   const [amount, setAmount] = useState("");
//   const chainId = useChainId();
//   const config = useConfig();
//   const account = useAccount();
//   const total: number = useMemo(() => calculateTotal(amount), [amount]);
//   const { data: hash, isPending, writeContractAsync } = useWriteContract();

//   async function getApprovedAmount(
//     tSenderAddress: string | null
//   ): Promise<number> {
//     if (!tSenderAddress) {
//       alert("No address found, Please use a supported chain");
//       return 0;
//     }
//     const response = await readContract(config, {
//       abi: erc20Abi,
//       address: tokenAddress as `0x${string}`,
//       functionName: "allowance",
//       args: [account.address, tSenderAddress as `0x${string}`],
//     });
//     console.log(response);
//     return response as number;
//   }

//   async function handleSubmit() {
//     const tSenderAddress = chainsToTSender[chainId]["tsender"];
//     console.log(tSenderAddress);
//     const approvedAmount = await getApprovedAmount(tSenderAddress);
//     console.log(approvedAmount);

//     if (approvedAmount < total) {
//       const approvalHash = await writeContractAsync({
//         abi: erc20Abi,
//         address: tokenAddress as `0x${string}`,
//         functionName: "approve",
//         args: [tSenderAddress as `0x${string}`, BigInt(total)],
//       });
//       const approvalReceipt = await waitForTransactionReceipt(config, {
//         hash: approvalHash,
//       });
//       console.log("Approval confirmed", approvalReceipt);

//       await writeContractAsync({
//         abi: tsenderAbi,
//         address: tSenderAddress as `0x${string}`,
//         functionName: "airdropERC20",
//         args: [
//           tokenAddress,
//           // Comma or new line separated
//           recipients
//             .split(/[,\n]+/)
//             .map((addr) => addr.trim())
//             .filter((addr) => addr !== ""),
//           amount
//             .split(/[,\n]+/)
//             .map((amt) => amt.trim())
//             .filter((amt) => amt !== ""),
//           BigInt(total),
//         ],
//       });
//     } else {
//       await writeContractAsync({
//         abi: tsenderAbi,
//         address: tSenderAddress as `0x${string}`,
//         functionName: "airdropERC20",
//         args: [
//           tokenAddress,
//           // Comma or new line separated
//           recipients
//             .split(/[,\n]+/)
//             .map((addr) => addr.trim())
//             .filter((addr) => addr !== ""),
//           amount
//             .split(/[,\n]+/)
//             .map((amt) => amt.trim())
//             .filter((amt) => amt !== ""),
//           BigInt(total),
//         ],
//       });
//     }
//   }

//   return (
//     <div>
//       <InputForm
//         label="Token Address"
//         placeholder="0x"
//         value={tokenAddress}
//         onChange={(e) => setTokenAddress(e.target.value)}
//       />
//       <InputForm
//         label="Recipients (comma or new line separated)"
//         placeholder="0x123..., 0x456..."
//         value={recipients}
//         onChange={(e) => setRecipients(e.target.value)}
//         large={true}
//       />
//       <InputForm
//         label="Amount"
//         placeholder="100,200,300,..."
//         value={amount}
//         onChange={(e) => setAmount(e.target.value)}
//         large={true}
//       />
//       <button
//         onClick={handleSubmit}
//         className="
//             mt-4 md:mt-6 lg:mt-8
//             px-6 py-3
//            bg-blue-600 hover:bg-blue-700
//            text-white font-medium rounded-lg
//            transition-all duration-200
//            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
//             active:bg-blue-800
//             shadow-md hover:shadow-lg
//            disabled:opacity-50 disabled:cursor-not-allowed
//            "
//       >
//         Send Tokens
//       </button>
//     </div>
//   );
// }

// ----------------------------------------------------------

"use client";

import { InputForm } from "@/components/ui/InputField";
import { useState, useMemo, useEffect } from "react";
import { chainsToTSender, erc20Abi, tsenderAbi } from "@/constants";
import { useChainId, useConfig, useAccount, useWriteContract } from "wagmi";
import { readContract, waitForTransactionReceipt } from "@wagmi/core";
import { calculateTotal } from "@/utils";
import { isAddress } from "viem";

export default function AirdropForm() {
  // State with localStorage persistence
  const [tokenAddress, setTokenAddress] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("airdropTokenAddress") || "";
    }
    return "";
  });
  const [recipients, setRecipients] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("airdropRecipients") || "";
    }
    return "";
  });
  const [amount, setAmount] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("airdropAmounts") || "";
    }
    return "";
  });
  const [tokenInfo, setTokenInfo] = useState<{
    symbol?: string;
    decimals?: number;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [txStatus, setTxStatus] = useState("");

  const chainId = useChainId();
  const config = useConfig();
  const account = useAccount();
  const total: number = useMemo(() => calculateTotal(amount), [amount]);
  const { data: hash, isPending, writeContractAsync } = useWriteContract();

  // Save inputs to localStorage
  useEffect(() => {
    localStorage.setItem("airdropTokenAddress", tokenAddress);
    localStorage.setItem("airdropRecipients", recipients);
    localStorage.setItem("airdropAmounts", amount);
  }, [tokenAddress, recipients, amount]);

  // Fetch token info when address changes
  useEffect(() => {
    const fetchTokenInfo = async () => {
      if (!isAddress(tokenAddress)) return;

      try {
        const [symbol, decimals] = await Promise.all([
          readContract(config, {
            abi: erc20Abi,
            address: tokenAddress as `0x${string}`,
            functionName: "symbol",
          }),
          readContract(config, {
            abi: erc20Abi,
            address: tokenAddress as `0x${string}`,
            functionName: "decimals",
          }),
        ]);

        setTokenInfo({
          symbol: symbol as string,
          decimals: decimals as number,
        });
      } catch (error) {
        setTokenInfo({});
        console.error("Failed to fetch token info:", error);
      }
    };

    fetchTokenInfo();
  }, [tokenAddress, config]);

  async function getApprovedAmount(
    tSenderAddress: string | null
  ): Promise<bigint> {
    if (!tSenderAddress || !account.address) return BigInt(0);

    const response = await readContract(config, {
      abi: erc20Abi,
      address: tokenAddress as `0x${string}`,
      functionName: "allowance",
      args: [account.address, tSenderAddress as `0x${string}`],
    });

    return response as bigint;
  }

  async function handleSubmit() {
    if (!account.address) {
      alert("Please connect your wallet");
      return;
    }

    if (!isAddress(tokenAddress)) {
      alert("Please enter a valid token address");
      return;
    }

    setIsLoading(true);
    setTxStatus("Checking approval...");

    try {
      const tSenderAddress = chainsToTSender[chainId]?.tsender;
      if (!tSenderAddress) {
        throw new Error("Unsupported chain");
      }

      const approvedAmount = await getApprovedAmount(tSenderAddress);
      setTxStatus(`Current approval: ${approvedAmount.toString()}`);

      if (approvedAmount < BigInt(total)) {
        setTxStatus("Approving tokens...");
        const approvalHash = await writeContractAsync({
          abi: erc20Abi,
          address: tokenAddress as `0x${string}`,
          functionName: "approve",
          args: [tSenderAddress as `0x${string}`, BigInt(total)],
        });

        setTxStatus("Waiting for approval confirmation...");
        await waitForTransactionReceipt(config, { hash: approvalHash });
      }

      setTxStatus("Sending airdrop...");
      const airdropHash = await writeContractAsync({
        abi: tsenderAbi,
        address: tSenderAddress as `0x${string}`,
        functionName: "airdropERC20",
        args: [
          tokenAddress as `0x${string}`,
          recipients
            .split(/[,\n]+/)
            .map((addr) => addr.trim())
            .filter((addr) => addr !== ""),
          amount
            .split(/[,\n]+/)
            .map((amt) => amt.trim())
            .filter((amt) => amt !== "")
            .map((amt) => {
              // Adjust for token decimals if needed
              const decimals = tokenInfo.decimals || 18;
              return BigInt(Math.floor(parseFloat(amt) * 10 ** decimals));
            }),
          BigInt(total),
        ],
      });

      setTxStatus("Waiting for airdrop confirmation...");
      await waitForTransactionReceipt(config, { hash: airdropHash });
      setTxStatus("Airdrop successful!");
    } catch (error) {
      console.error(error);
      setTxStatus(
        `Error: ${
          error instanceof Error ? error.message : "Transaction failed"
        }`
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto mt-6 p-[2px] px-4 py-4 rounded-lg bg-gradient-to-r from-purple-500 via-pink-500 to-red-500">
      <div className="space-y-6  bg-black rounded-lg mt-6 max-w-2xl mx-auto px-2 py-2">
        <div className="space-y-4 mt-2 [&_.text-zinc-600]:text-white">
          <InputForm
            label="Token Address"
            placeholder="0x..."
            value={tokenAddress}
            onChange={(e) => setTokenAddress(e.target.value)}
          />

          <InputForm
            label="Recipients (comma or new line separated)"
            placeholder="0x123..., 0x456..."
            value={recipients}
            onChange={(e) => setRecipients(e.target.value)}
            large={true}
          />

          <InputForm
            label={`Amounts (wei; comma or new line separated)${
              tokenInfo.symbol ? ` in ${tokenInfo.symbol}` : ""
            }`}
            placeholder="100,200,300,..."
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            large={true}
          />
        </div>

        {/* Token Info Box */}
        {tokenAddress && (
          <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
            <h3 className="font-medium mb-2 text-gray-900">Token Info</h3>
            {tokenInfo.symbol ? (
              <div className="space-y-1 text-gray-800">
                <div className="flex justify-between items-center">
                  <span>Symbol: </span>
                  <span className="font-semibold">{tokenInfo.symbol}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Decimals: </span>
                  <span className="font-semibold">{tokenInfo.decimals}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Amount(wei) </span>
                  <span className="font-semibold">
                    {total} {tokenInfo.symbol}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Tokens</span>
                  <span className="font-semibold">
                    {(total / 1e18).toLocaleString(undefined, {
                      minimumFractionDigits: 4,
                      maximumFractionDigits: 18,
                    })}{" "}
                    {tokenInfo.symbol}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Recipients: </span>
                  <span className="font-semibold">
                    {recipients.split(/[,\n]+/).filter((a) => a.trim()).length}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-gray-800">
                {isAddress(tokenAddress)
                  ? "Loading token info..."
                  : "Invalid token address"}
              </p>
            )}
          </div>
        )}

        {/* Transaction Status */}
        {(isLoading || txStatus) && (
          //p-4 bg-blue-50 rounded-lg flex items-center space-x-3
          <div className="w-full max-w-3xl p-4 bg-blue-50 rounded-lg flex flex-wrap items-center gap-3 overflow-auto">
            {isLoading && (
              <svg
                className="animate-spin h-5 w-5 text-blue-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            )}
            <span className="text-gray-900">{txStatus}</span>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={isLoading || isPending}
          className={`
          w-full py-3 px-6
          bg-blue-600 hover:bg-blue-700 
          text-white font-medium rounded-lg
          transition-all duration-200 
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
          ${isLoading ? "opacity-70 cursor-not-allowed" : ""}
          flex items-center justify-center
        `}
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Processing...
            </>
          ) : (
            "Send Tokens"
          )}
        </button>
      </div>
    </div>
  );
}
