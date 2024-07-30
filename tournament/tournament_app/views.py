# Create your views here.



from rest_framework.views import APIView, Response
from django.http import JsonResponse
from .eth import w3, contract, account, private_key
import json
import os

class PostTournamentView(APIView):
    def post(self, request):
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
           
class GetTournamentView(APIView):
    def get(self, request):
        try:
            data = json.loads(request.body)
            tournament_id = data.get('id')  # Adjust the tournament ID as needed
            # Call the contract function to get tournament details
            result = contract.functions.getTournament(tournament_id).call()

            # Convert result tuple into a dictionary for JSON response
            tournament_details = {
                'id': result[0],
                'place1': result[1],
                'place2': result[2],
                'place3': result[3],
                'place4': result[4]
            }
            return JsonResponse(tournament_details, status=200)
        
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
        