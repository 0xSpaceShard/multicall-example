import {
    Account,
    ec,
    Provider,
    Contract,
    json,
    stark
  } from "starknet";
  import * as dotenv from "dotenv"
  import fs from "fs"
  dotenv.config()
  
  const provider = new Provider({ sequencer: {network: "goerli-alpha" } } );
  
  // Tx Sender private key
  const privateKey = process.env.OZ_NEW_ACCOUNT_PRIVKEY;
  const starkKeyPair = ec.getKeyPair(privateKey);
  // Tx Sender address
  const accountAddress = process.env.OZ_ACCOUNT_ADDRESS
  // Relayer address
  const relayerAccount = process.env.RELAYER_ACCOUNT
  
  const account = new Account(provider, accountAddress, starkKeyPair);
  
  // ETH Token contract address
  const eth_token_address = process.env.ETH_TOKEN_ADDRESS
  // Bridge simulation contract address
  const bridge_address = process.env.BRIDGE_ADDRESS
  // ETH Token compiled contract
  const eth_token_compiled = json.parse(fs.readFileSync("../assets/eth_token_compiled.json").toString("ascii"));
  // Bridge simulation compiled contract
  const bridge_compiled = json.parse(fs.readFileSync("../assets/sim_bridge_compiled.json").toString("ascii"));
  
  // Instantiate contracts
  const eth_token_contract = new Contract(eth_token_compiled.abi, eth_token_address, provider);
  const bridge_contract = new Contract(bridge_compiled.abi, bridge_address, provider);
  
  eth_token_contract.connect(account);
  bridge_contract.connect(account);
  
  const multicall = await account.execute(
    [
      {
        contractAddress: eth_token_address,
        entrypoint: "transfer",
        calldata: stark.compileCalldata({
          user: relayerAccount, amount: {type: "struct", low: "5", high: "0"}
        })
      },
      {
        contractAddress: bridge_address,
        entrypoint: "initiate_withdraw",
        calldata: stark.compileCalldata({
          l1_recipient: process.env.L1_RECIPIENT, amount: {type: "struct", low: "1", high: "0"}
        })
      }
    ]
  )
  console.log(multicall.transaction_hash)
  await provider.waitForTransaction(multicall.transaction_hash);
  