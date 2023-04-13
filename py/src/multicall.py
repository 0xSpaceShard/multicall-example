from starknet_py.net.client_models import Call
import asyncio
import os
from pathlib import Path
from starknet_py.net.models.chains import StarknetChainId
from starknet_py.net.account.account import Account
from starknet_py.net.signer.stark_curve_signer import KeyPair
from starknet_py.hash.selector import get_selector_from_name
from starknet_py.net.gateway_client import GatewayClient
from starknet_py.serialization import serializer_for_function
from starknet_py.abi import AbiParser
import json
from starknet_py.contract import Contract


OZ_NEW_ACCOUNT_PRIVKEY=0x7598808e20d41b11d95de74932d96ca14a04cf9746326e51fbe3b0c3dd44e1a
OZ_ACCOUNT_ADDRESS="0x0006161a530f712eefef972ad3a6e5df9ea902084970191c01f9d33bd84eaf04"
RELAYER_ACCOUNT=648934072273575765739002862786482515423656265287780591945261606659910017325
ETH_TOKEN_ADDRESS="0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7"
BRIDGE_ADDRESS="0x016f489e85ce36d4b22481d4a4118d028e1c60bf5b0a5f10f2e51b33c254212d"
L1_RECIPIENT="0x343A39F6C3736A91feDA55726a975"
                

def get_serializer(abi_path, method_name, account=None):
    with open(abi_path) as f:
        if not account:
            abi = json.load(f)
            return serializer_for_function(
                AbiParser(abi).parse().functions[method_name]
            )

        else:
            abi = json.load(f)
            contract = Contract(
                address=ETH_TOKEN_ADDRESS, abi=abi, provider=account
            )
            return (
                serializer_for_function(AbiParser(abi).parse().functions[method_name]),
                contract,
            )
        

def read_contract(
    file_name: str, *, directory: Path = Path(os.path.dirname(__file__)) / "../../assets"
) -> str:
    return (directory / file_name).read_text("utf-8")


def get_account(client, address, private_key):
    return Account(
        client=client,
        address=address,
        key_pair=KeyPair.from_private_key(key=private_key),
        chain=StarknetChainId.TESTNET,
    )


async def multicall_transaction(account, calls=[]):
    resp = await account.execute(calls=calls, max_fee=int(1e16))
    print(f"Tx: hash: {resp.transaction_hash}")
    await account.client.wait_for_tx(resp.transaction_hash)


def new_call(contract_address: int, selector: str, calldata: list):
    return Call(
        to_addr=contract_address,
        selector=get_selector_from_name(selector),
        calldata=calldata,
    )


async def main():
    connection = GatewayClient("testnet")

    account = get_account(connection, OZ_ACCOUNT_ADDRESS, OZ_NEW_ACCOUNT_PRIVKEY)

    initiate_withdrwaw_serializer, bridge_contract = get_serializer(
        "../assets/sim_bridge_abi.json", "initiate_withdraw", account
    )
    transfer_erc20_serializer, ether_contract = get_serializer(
        "../assets/eth_token_abi.json", "transfer", account
    )

    multicall_happy_path = [
        new_call(
            contract_address=bridge_contract.address,
            selector="initiate_withdraw",
            calldata=initiate_withdrwaw_serializer.serialize(
                l1_recipient=L1_RECIPIENT, amount={"low": 1, "high": 10}
            ),
        ),
        new_call(
            contract_address=ether_contract.address,
            selector="transfer",
            calldata=transfer_erc20_serializer.serialize(
                recipient=RELAYER_ACCOUNT, amount={"low": 1, "high": 0}
            ),
        ),
    ]

    await multicall_transaction(account=account, calls=multicall_happy_path)


if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    loop.run_until_complete(main())