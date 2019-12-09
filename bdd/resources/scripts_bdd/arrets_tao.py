import json
import re
import requests

######################################################
########## TRAITEMENT DU FICHIER ARRETS TAO ##########
def traitement():
    raw_data = []

    res = requests.get('https://data.orleans-metropole.fr/api/records/1.0/search/?dataset=arrets-tao-gtfs&rows=-1')
    if res:
        raw_data = res.json()['records']
    else:
        with open('resources/bus/arrets_tao.json', 'r') as json_data:
            raw_data = json.load(json_data)

    clean_data = []
    id_generator = 0

    for rd in raw_data:
        id_generator += 1
        if(int(rd["fields"]["location_type"])):
            new_data = {
                "id" : id_generator,
                "stop_id" : rd["fields"]["stop_id"],
                "stop_name" : rd["fields"]["stop_name"],
                "geometry" : rd["geometry"],
                "is_bus" : 0 if (re.match("StopArea:OLS[AB]", rd["fields"]["stop_id"])) else 1
            }
            clean_data.append(new_data)

    with open('target/arrets_bus_tram.sql', 'w') as sql_data:
        sql_data.write(
        """-- Table: public.arrets_tao_bus
    -- DROP TABLE public.arrets_tao_bus;

    CREATE TABLE public.arrets_tao_bus
    (
        id integer NOT NULL,
        old_id character varying(75) NOT NULL UNIQUE,
        geom geometry(Point, 4326),
        name character varying(75),
        CONSTRAINT arrets_tao_bus_pkey PRIMARY KEY (id)
    );

    -- Table: public.arrets_tao_tram
    -- DROP TABLE public.arrets_tao_tram;

    CREATE TABLE public.arrets_tao_tram
    (
        id integer NOT NULL,
        old_id character varying(75) NOT NULL UNIQUE,
        geom geometry(Point, 4326),
        name character varying(75),
        CONSTRAINT arrets_tao_tram_pkey PRIMARY KEY (id)
    );

    """)

    with open('target/arrets_bus_tram.sql', "a") as sql_data:
        for elem in clean_data:
            if (elem["is_bus"]):
                sql_data.write("INSERT INTO public.arrets_tao_bus (id, old_id, name, geom) VALUES ({}, \'{}\', \'{}\', ST_GeomFromText(\'POINT({} {})\', {}));\n"
                    .format(elem["id"], elem["stop_id"], elem["stop_name"].replace("'", "''"), elem["geometry"]["coordinates"][0], elem["geometry"]["coordinates"][1], 4326))
            else:
                sql_data.write("INSERT INTO public.arrets_tao_tram (id, old_id, name, geom) VALUES ({}, \'{}\', \'{}\', ST_GeomFromText(\'POINT({} {})\', {}));\n"
                    .format(elem["id"], elem["stop_id"], elem["stop_name"].replace("'", "''"), elem["geometry"]["coordinates"][0], elem["geometry"]["coordinates"][1], 4326))
