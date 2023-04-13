# multicall-example
An example on how to create multicall transactions on Starknet


## Run JS example

Make sure to create a new `.env` file with your configuration for the `RELAYER_ADDRESS` and `L1_RECIPIENT`.

```
cd js/

npm i

node src/multicall.js
```

## Run PY example

Make sure to modify all constants according to your needs.

```
cd py 

virtualenv --pytrhon python3.9

pip install -r requirements.txt

python src/multicall.py
```