"use client";

import HomeContent from "@/components/HomeContent";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";

// export default function Home() {
//   const { isConnected } = useAccount();
//   return (
//     <div>
//       {!isConnected ? (
//         <div>Please connect a wallet ...</div>
//       ) : (
//         <div>
//           <HomeContent />
//         </div>
//       )}
//     </div>
//   );
// }

export default function Home() {
  const { isConnected } = useAccount();
  return (
    <div className="min-h-screen flex flex-col">
      {!isConnected ? (
        <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
          <div className="max-w-md w-full bg-white/10 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mx-auto text-blue-500 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
              Wallet Not Connected
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Please connect your wallet to continue
            </p>
            {/* <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200">
              Connect Wallet
            </button> */}
            <button>
              <ConnectButton />
            </button>
          </div>
        </div>
      ) : (
        <div>
          <HomeContent />
        </div>
      )}
    </div>
  );
}
