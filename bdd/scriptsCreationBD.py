print("----------- DEBUT DU PROGRAMME -----------")

import json

# TRAITEMENT DU FICHIER ARRETS TAO
with open('bus/arrets-tao-gtfs.json') as json_data:
    raw_data = json.load(json_data)

clean_data = []

for rd in raw_data:
    new_data = {
        "stop_id" : rd["fields"]["stop_id"],
        "stop_coordinates" : rd["fields"]["stop_coordinates"],
        "stop_name" : rd["fields"]["stop_name"],
        "geometry" : rd["geometry"]
    }
    clean_data.append(new_data)

# TODO print dans un new fichier

# TRAITEMENT DU FICHIER LIGNES TAO
with open('bus/lignes-tao-gtfs.json') as json_data:
    raw_data = json.load(json_data)

clean_data = []

for rd in raw_data:
    new_data = {
        "route_id" : rd["fields"]["route_id"],
        "route_long_name" : rd["fields"]["route_long_name"],
        "route_short_name" : rd["fields"]["route_short_name"],
        "route_type" : rd["fields"]["route_type"],
        "geometry" : rd["fields"]["shape"]
    }
    clean_data.append(new_data)

print(raw_data[0])
print(clean_data[0])

# TODO print dans un new fichier

print("------------ FIN DU PROGRAMME ------------")
