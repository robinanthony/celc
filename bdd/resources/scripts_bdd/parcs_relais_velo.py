import json
import re

######################################################
######## TRAITEMENT DU FICHIER ??TODO?? VELOS ########
def traitement():
    with open('resources/velos/parcs_relais_velo.json') as json_data:
        raw_data = json.load(json_data)

    clean_data = []

    for rd in raw_data:
        new_data = {
            "parc_relais_id" : int(rd["fields"]["id_parcv"]),
            "parc_relais_name" : rd["fields"]["nomarrettao"],
            "geometry" : rd["geometry"]["coordinates"]
        }
        clean_data.append(new_data)

    with open('target/parcs_relais_velo.sql', 'w') as sql_data:
        sql_data.write(
        """-- Table: public.parcs_relais_velo
    -- DROP TABLE public.parcs_relais_velo;

    CREATE TABLE public.parcs_relais_velo
    (
        id numeric NOT NULL,
        name character varying(25),
        geom geometry(Point, 4326),
        CONSTRAINT parcs_relais_velo_pkey PRIMARY KEY (id)
    );

    """)

    with open('target/parcs_relais_velo.sql', "a") as sql_data:
        for elem in clean_data:
            sql_data.write("INSERT INTO public.parcs_relais_velo (id, name, geom) VALUES ({}, \'{}\',  ST_GeomFromText(\'POINT({} {})\', {}));\n"
                .format(elem["parc_relais_id"], elem["parc_relais_name"].replace("'", "''"), elem["geometry"][0], elem["geometry"][1], 4326))
