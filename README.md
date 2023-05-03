# multicall-example
An example on how to create multicall transactions on Starknet

## Setup
Install npm packages
```sh
npm install
```

## Network
- Example works on [Starknet goerli-1](https://testnet.starkscan.co/)

## Get Gas Fee
1. To get the fees you have to pay to get your transaction processed on L1 run the command (IMPORTANT the timestamp should be in UTC time)
```sh
node src/getFees.js
```
2. output:
```
Current timestamp: 1683053450
GasCost: 3900000000000000
```

## Create Multicall transaction

1. Make sure to create a new `.env` file with your configuration:
    - your OpenZeppelin based account private key and address from Starknet Goerli
    - make sure your account has funds! :)
    - address on Ethereum Goerli you wish to send tokens
3. Run
```sh
node src/multicall.js receiver=0x00000000000000000000000000000000000000000001 amount=50 fees=3900000000000000
```
3. Copy the transaction hash and paste it on https://testnet.starkscan.co/
4. Wait for the transaction to be accepted on L1 (currently 4h).
5. The relayer will detect your transaction and call withdraw for you.
6. Done :) !
