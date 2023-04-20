import {
  getContracts,
  getSingleInputs,
  getWalletAndProvider,
  multicall,
} from "./helpers.js";

const main = async () => {
  const { receiverL1Address } = getSingleInputs();
  const { ethTokenContract, bridgeContract } = getContracts();
  const { provider, account } = getWalletAndProvider();
  
  ethTokenContract.connect(account);
  bridgeContract.connect(account);

  for (let i = 0; i < 50; i++) {
    console.log(`Transaction ${i + 1} / ${50}`);
    await multicall(provider, account, receiverL1Address, i + 1);
  }
};

main()
  .then()
  .catch((e) => {
    console.log(e);
    process.exit(1);
  });
