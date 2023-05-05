import fetch from "node-fetch";

const RelayerMainnet = "https://starkgate.spaceshard.io/v1/gas-cost/";
const RelayerDevelop = "https://starkgate-testnet.spaceshard.io/v1/gas-cost/";

const main = async () => {
  const arg = process.argv[2].split("=");
  const key = arg[0];
  const value = arg[1];

  let network = "testnet";
  let url = RelayerDevelop;
  switch (value) {
    case "mainnet":
      network = value;
      url = RelayerMainnet;
      break;

    case "testnet":
      network = value;
      url = RelayerDevelop;
      break;
    default:
      throw new Error("Invalid network");
  }

  const timestamp = Math.floor(new Date().getTime() / 1000);
  console.log("Current timestamp:", timestamp);
  console.log("Network:", network);
  console.log("Url:", url + timestamp);

  const res = await fetch(url + timestamp);

  if (res.status == 200) {
    console.log("GasCost:", (await res.json()).result.gasCost);
  }
};

main()
  .then()
  .catch((e) => {
    console.log(e);
    process.exit(1);
  });
