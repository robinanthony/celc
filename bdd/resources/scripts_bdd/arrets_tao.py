import json
import re

######################################################
########## TRAITEMENT DU FICHIER ARRETS TAO ##########
def traitement():
    with open('resources/bus/arrets_tao.json', 'r') as json_data:
        raw_data = json.load(json_data)

    clean_data = []

    for rd in raw_data:
        if(int(rd["fields"]["location_type"])):
            new_data = {
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
        id character varying(75) NOT NULL,
        geom geometry(Point, 4326),
        name character varying(75),
        CONSTRAINT arrets_tao_bus_pkey PRIMARY KEY (id)
    );

    -- Table: public.arrets_tao_tram
    -- DROP TABLE public.arrets_tao_tram;

    CREATE TABLE public.arrets_tao_tram
    (
        id character varying(75) NOT NULL,
        geom geometry(Point, 4326),
        name character varying(75),
        CONSTRAINT arrets_tao_tram_pkey PRIMARY KEY (id)
    );

    """)

    with open('target/arrets_bus_tram.sql', "a") as sql_data:
        for elem in clean_data:
            if (elem["is_bus"]):
                sql_data.write("INSERT INTO public.arrets_tao_bus (id, name, geom) VALUES (\'{}\', \'{}\', ST_GeomFromText(\'POINT({} {})\', {}));\n"
                    .format(elem["stop_id"], elem["stop_name"].replace("'", "''"), elem["geometry"]["coordinates"][0], elem["geometry"]["coordinates"][1], 4326))
            else:
                sql_data.write("INSERT INTO public.arrets_tao_tram (id, name, geom) VALUES (\'{}\', \'{}\', ST_GeomFromText(\'POINT({} {})\', {}));\n"
                    .format(elem["stop_id"], elem["stop_name"].replace("'", "''"), elem["geometry"]["coordinates"][0], elem["geometry"]["coordinates"][1], 4326))
