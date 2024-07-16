from web3 import Web3
import os

w3 = Web3(Web3.HTTPProvider('HTTP://0.0.0.0:7545')) 

# Check connection
if w3.is_connected():
    print("Connected to Ethereum node")
else:
    print("Failed to connect to Ethereum node")
