#!/bin/bash

while ! curl -kSsf -u "elastic:$ELASTIC_PASSWORD" "https://elasticsearch:9200/" >/dev/null; do
  sleep 3
done

curl -k -u "elastic:$ELASTIC_PASSWORD" -X  PUT "https://elasticsearch:9200/_ilm/policy/logstash-policy" -H 'Content-Type: application/json' -d'
{
  "policy": {
    "phases": {
      "hot": {
        "actions": {
          "rollover": {
            "max_age": "7d",
            "max_size": "50gb"
          }
        }
      },
      "delete": {
        "min_age": "90d",
        "actions": {
          "delete": {}
        }
      }
    }
  }
}
'