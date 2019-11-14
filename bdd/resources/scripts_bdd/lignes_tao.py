import json
import re

######################################################
########## TRAITEMENT DU FICHIER LIGNES TAO ##########
def traitement():
    with open('resources/bus/lignes_tao.json') as json_data:
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

    # Pre-traitement coordinates geometry
    for data in clean_data:
        res = "("
        for coord in data["geometry"]["coordinates"][0]:
            res += ""+str(coord[0])+" "+str(coord[1])+", "

        data["geometry"]["coordinates"] = res[:-2]+")"

    with open('target/lignes_bus_tram.sql', 'w') as sql_data:
        sql_data.write(
        """-- Table: public.lignes_tao_tram
    -- DROP TABLE public.lignes_tao_tram;

    CREATE TABLE public.lignes_tao_tram
    (
        id character varying(75) NOT NULL,
        geom geometry(MULTILINESTRING, 4326),
        short_name character varying(25),
        long_name character varying(100),
        route_type character varying(25),
        CONSTRAINT lignes_tao_tram_pkey PRIMARY KEY (id)
    );

    -- Table: public.lignes_tao_bus
    -- DROP TABLE public.lignes_tao_bus;

    CREATE TABLE public.lignes_tao_bus
    (
        id character varying(75) NOT NULL,
        geom geometry(MULTILINESTRING, 4326),
        short_name character varying(25),
        long_name character varying(100),
        route_type character varying(25),
        CONSTRAINT lignes_tao_bus_pkey PRIMARY KEY (id)
    );

    """)

    with open('target/lignes_bus_tram.sql', "a") as sql_data:
        for elem in clean_data:
            if(elem["route_type"] == "Bus"):
                sql_data.write("INSERT INTO public.lignes_tao_bus (id, short_name, long_name, geom) VALUES (\'{}\', \'{}\', \'{}\', ST_GeomFromText(\'MULTILINESTRING({})\', {}));\n"
                    .format(elem["route_id"], elem["route_short_name"].replace("'", "''"), elem["route_long_name"].replace("'", "''"), elem["geometry"]["coordinates"], 4326))
            else:
                sql_data.write("INSERT INTO public.lignes_tao_tram (id, short_name, long_name, geom) VALUES (\'{}\', \'{}\', \'{}\', ST_GeomFromText(\'MULTILINESTRING({})\', {}));\n"
                    .format(elem["route_id"], elem["route_short_name"].replace("'", "''"), elem["route_long_name"].replace("'", "''"), elem["geometry"]["coordinates"], 4326))