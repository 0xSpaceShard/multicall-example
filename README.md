# multicall-example
An example on how to create multicall transactions on Starknet

## Setup
Install npm packages
```sh
npm install
```

## Create Multicall transaction

1. Make sure to create a new `.env` file with your configuration.
2. Run
```sh
node src/multicall.js receiver=0x00000000000000000000000000000000000000000001 amount=50
```
3. Copy the transaction hash and paste it on https://testnet.starkscan.co/
4. Wait for the transaction to be accepted on L1 (currently 4h).
5. The relayer will detect your transaction and call withdraw for you.
6. Done :) !
