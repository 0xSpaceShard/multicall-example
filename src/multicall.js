import {
  getContracts,
  getSingleInputs,
  getWalletAndProvider,
  multicall,
} from "./helpers.js";

const main = async () => {
  const { receiverL1Address, amountToBridge, fees } = getSingleInputs();
  const { ethTokenContract, bridgeContract } = getContracts();
  const { provider, account } = getWalletAndProvider();

  ethTokenContract.connect(account);
  bridgeContract.connect(account);

  await multicall(provider, account, receiverL1Address, amountToBridge, fees);
};

main()
  .then()
  .catch((e) => {
    console.log(e);
    process.exit(1);
  });
