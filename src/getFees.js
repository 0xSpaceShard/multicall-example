import fetch from "node-fetch";

const main = async () => {
  const timestamp = Math.floor(new Date().getTime() / 1000);
  console.log("Current timestamp:", timestamp);

  const res = await fetch(
    "https://starkgate-testnet.spaceshard.io/v1/gas-cost/" + timestamp
  );

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
