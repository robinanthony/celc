import json
import re

######################################################
######## TRAITEMENT DU FICHIER STATIONS VELOS ########
def traitement():
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
            "geometry" : rd["geometry"]["coordinates"]
        }
        clean_data.append(new_data)

    with open('target/parkings_velo.sql', 'w') as sql_data:
        sql_data.write(
        """-- Table: public.parkings_velo
    -- DROP TABLE public.parkings_velo;

    CREATE TABLE public.parkings_velo
    (
        id numeric NOT NULL,
        name character varying(25),
        geom geometry(Point, 4326),
        CONSTRAINT parkings_velo_pkey PRIMARY KEY (id)
    );

    """)

    with open('target/parkings_velo.sql', "a") as sql_data:
        for elem in clean_data:
            sql_data.write("INSERT INTO public.parkings_velo (id, name, geom) VALUES ({}, \'{}\',  ST_GeomFromText(\'POINT({} {})\', {}));\n"
                .format(elem["parking_id"], elem["parking_name"].replace("'", "''"), elem["geometry"][0], elem["geometry"][1], 4326))
