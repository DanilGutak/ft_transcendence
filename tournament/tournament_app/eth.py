from web3 import Web3
from django.conf import settings
import json
import os

# Load your contract's ABI
with open(os.path.join(os.path.dirname(__file__), 'contract.json')) as f:
    contract_abi = json.load(f)

# Web3 connection
web3_provider = os.environ.get('WEB3_PROVIDER')
w3 = Web3(Web3.HTTPProvider(web3_provider))

if not w3.is_connected():
    print("Web3 is NOT connected!!!")

contract_address = os.environ.get('CONTRACT_ADDRESS')
account = os.environ.get('CONTRACT_ACCOUNT')
private_key = os.environ.get('CONTRACT_PRIVATE_KEY')
contract = w3.eth.contract(address=contract_address, abi=contract_abi)
