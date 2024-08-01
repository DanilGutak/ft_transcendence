# Create your views here.

from rest_framework.views import APIView, Response
from django.conf import settings
import requests
from django.http import JsonResponse
from .eth import w3, contract, account, private_key
import json
import os

class PostTournamentView(APIView):
    def post(self, request):
        try:
            auth_header = request.headers.get('Authorization')
            if not auth_header:
                return JsonResponse({'error': 'Authorization header is missing'}, status=401)
            token = auth_header.split(' ')[1]
            response = requests.post(
                f"{settings.LOGIN_BACKEND_URL}/api/token/verify/",
                headers={"Authorization": auth_header},
                json={'token': token }
            )
            if response.status_code != 200:
                return JsonResponse({'error': 'User not authenticated'}, status=401)
            data = json.loads(request.body)
            place1 = data.get('place1')
            place2 = data.get('place2')
            place3 = data.get('place3')
            place4 = data.get('place4')
            transaction = contract.functions.addTournament(
                place1, place2, place3, place4
            ).build_transaction({
                'from': account,
                'nonce': w3.eth.get_transaction_count(account),
                'gas': 2000000,
                'maxFeePerGas': w3.to_wei('2', 'gwei'),
                'maxPriorityFeePerGas': w3.to_wei('1', 'gwei')
            })
            signed_txn = w3.eth.account.sign_transaction(transaction, private_key)
            txn_hash = w3.eth.send_raw_transaction(signed_txn.rawTransaction)
            receipt = w3.eth.wait_for_transaction_receipt(txn_hash)
            return JsonResponse({'message': 'User created successfully'}, status=201)
        except Exception as e:
            return JsonResponse({'error': "Blockchain is not working"}, status=400)