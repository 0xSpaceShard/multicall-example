import { Account, ec, Provider, Contract, json, stark } from "starknet";
import * as dotenv from "dotenv";
dotenv.config();
import fs from "fs";

const UserPrivateKey = process.env.OZ_NEW_ACCOUNT_PRIVKEY;
const UserAccountAddress = process.env.OZ_ACCOUNT_ADDRESS;
const RelayerAccount = process.env.RELAYER_ACCOUNT;
const EthTokenAddress = process.env.ETH_TOKEN_ADDRESS;
const BridgeAddress = process.env.BRIDGE_ADDRESS;

export const getContracts = (provider) => {
  const ethTokenCompiled = json.parse(
    fs.readFileSync("assets/eth_token_compiled.json").toString("ascii")
  );

  const bridgeCompiled = json.parse(
    fs.readFileSync("assets/sim_bridge_compiled.json").toString("ascii")
  );

  // Instantiate contracts
  const ethTokenContract = new Contract(
    ethTokenCompiled.abi,
    EthTokenAddress,
    provider
  );
  const bridgeContract = new Contract(
    bridgeCompiled.abi,
    BridgeAddress,
    provider
  );

  return { ethTokenContract, bridgeContract };
};

export const getSingleInputs = () => {
  let receiverL1Address;
  let amountToBridge;

  for (let i = 2; i < process.argv.length; i++) {
    const arg = process.argv[i].split("=");
    const key = arg[0];
    const value = arg[1];
    switch (key) {
      case "receiver":
        receiverL1Address = value;
        if (!receiverL1Address) {
          receiverL1Address = process.env.L1_RECIPIENT
        }
        break;
      case "amount":
        amountToBridge = String(Number(value));
        break;
      default:
        throw new Error(`${key} argument is not valid`);
    }
  }
  if (!receiverL1Address) {
    throw new Error(
      "L1 receiver address not set, example: receiver=0x5F906C3eaCC3317CC1e9a6516D6D274d30427558"
    );
  }

  if (!amountToBridge) {
    throw new Error(
      "Amount to bridge not set the amount should be in wei, example: amount=1"
    );
  }
  return { receiverL1Address, amountToBridge };
};

export const getWalletAndProvider = () => {
  const provider = new Provider({ sequencer: { network: "goerli-alpha" } });
  const starkKeyPair = ec.getKeyPair(UserPrivateKey);
  const account = new Account(provider, UserAccountAddress, starkKeyPair);
  return { provider, account };
};

export const multicall = async (
  provider,
  account,
  receiverL1Address,
  amountToBridge
) => {
  const multicall = await account.execute([
    {
      contractAddress: EthTokenAddress,
      entrypoint: "transfer",
      calldata: stark.compileCalldata({
        user: RelayerAccount,
        amount: { type: "struct", low: "1", high: "0" },
      }),
    },
    {
      contractAddress: BridgeAddress,
      entrypoint: "initiate_withdraw",
      calldata: stark.compileCalldata({
        l1_recipient: receiverL1Address,
        amount: { type: "struct", low: amountToBridge, high: "0" },
      }),
    },
  ]);

  console.log("Transaction hash:", multicall.transaction_hash);
  await provider.waitForTransaction(multicall.transaction_hash);
};
