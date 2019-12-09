import json
import re
import requests

######################################################
######## TRAITEMENT DU FICHIER STATIONS VELOS ########
def traitement():
    raw_data = []

    res = requests.get('https://data.orleans-metropole.fr/api/records/1.0/search/?dataset=referentielbdauao_dep_station_velos&rows=-1&facet=commune&facet=quartier&facet=lieu&facet=type&facet=couverture&facet=gardiennag&facet=signalisat')
    if res:
        raw_data = res.json()['records']
    else:
        with open('resources/velos/parkings_velo.json') as json_data:
            raw_data = json.load(json_data)

    clean_data = []
    id_generator = 0

    for rd in raw_data:
        id_generator += 1
        new_data = {
            # "route_id" : rd["fields"]["route_id"],
            # "route_long_name" : rd["fields"]["route_long_name"],
            # "route_short_name" : rd["fields"]["route_short_name"],
            # "route_type" : rd["fields"]["route_type"],
            # "geometry" : rd["fields"]["shape"]
            "parking_id" : id_generator,
            "parking_name": "Parking vélo n° {}".format(id_generator),
            "geometry" : rd["geometry"]["coordinates"],

            "commune" : rd["fields"]["commune"],
            "nb_places" : int(rd["fields"]["nb_places"]),
            "observation" : rd["fields"].get("observatio", ""),
            "numero" : int(rd["fields"]["numero"]),
            "rue" : rd["fields"].get("rue", ""),
            "typeElement" : rd["fields"]["type"]
        }
        clean_data.append(new_data)

    with open('target/parkings_velo.sql', 'w') as sql_data:
        sql_data.write(
        """-- Table: public.parkings_velo
    -- DROP TABLE public.parkings_velo;

    CREATE TABLE public.parkings_velo
    (
        id integer NOT NULL,
        name character varying(50),
        geom geometry(Point, 4326),

        commune character varying(50),
        nb_places numeric,
        observation character varying(75),
        numero numeric,
        rue character varying(50),
        typeElement character varying(25),

        CONSTRAINT parkings_velo_pkey PRIMARY KEY (id)
    );

    """)

    with open('target/parkings_velo.sql', "a") as sql_data:
        for elem in clean_data:
            sql_data.write("INSERT INTO public.parkings_velo (id, name, geom, commune, nb_places, observation, numero, rue, typeElement) VALUES ({}, \'{}\',  ST_GeomFromText(\'POINT({} {})\', {}), \'{}\', {}, \'{}\', {}, \'{}\', \'{}\');\n"
                .format(elem["parking_id"], elem["parking_name"].replace("'", "''"), elem["geometry"][0], elem["geometry"][1], 4326, elem["commune"].replace("'", "''"), elem["nb_places"], elem["observation"].replace("'", "''"), elem["numero"], elem["rue"].replace("'", "''"), elem["typeElement"].replace("'", "''")))
