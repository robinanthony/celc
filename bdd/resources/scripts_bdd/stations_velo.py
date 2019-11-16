import json
import re
import requests

######################################################
######## TRAITEMENT DU FICHIER STATIONS VELOS ########
def traitement():
    raw_data = []

    res = requests.get('https://data.orleans-metropole.fr/api/records/1.0/search/?dataset=liste-des-stations-velo-2018-orleans-metropole&rows=-1')
    if res:
        raw_data = res.json()['records']
    else:
        with open('resources/velos/stations_velo.json') as json_data:
            raw_data = json.load(json_data)

    clean_data = []

    for rd in raw_data:
        new_data = {
            # "route_id" : rd["fields"]["route_id"],
            # "route_long_name" : rd["fields"]["route_long_name"],
            # "route_short_name" : rd["fields"]["route_short_name"],
            # "route_type" : rd["fields"]["route_type"],
            # "geometry" : rd["fields"]["shape"]
            "stations_id" : int(rd["fields"]["id"]),
            "station_name": rd["fields"]["nomstation"],
            "geometry" : rd["geometry"]["coordinates"]
        }
        clean_data.append(new_data)

    with open('target/stations_velo.sql', 'w') as sql_data:
        sql_data.write(
        """-- Table: public.stations_velo
    -- DROP TABLE public.stations_velo;

    CREATE TABLE public.stations_velo
    (
        id numeric NOT NULL,
        name character varying(25),
        geom geometry(Point, 4326),
        CONSTRAINT stations_velo_pkey PRIMARY KEY (id)
    );

    """)

    with open('target/stations_velo.sql', "a") as sql_data:
        for elem in clean_data:
            sql_data.write("INSERT INTO public.stations_velo (id, name, geom) VALUES ({}, \'{}\',  ST_GeomFromText(\'POINT({} {})\', {}));\n"
                .format(elem["stations_id"], elem["station_name"].replace("'", "''"), elem["geometry"][0], elem["geometry"][1], 4326))
