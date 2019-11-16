import json
import re
import requests

######################################################
########## TRAITEMENT DU FICHIER LIGNES TAO ##########
def traitement():
    raw_data = []

    res = requests.get('https://data.orleans-metropole.fr/api/records/1.0/search/?dataset=referentielbdauao_dep_iti_cyclables&facet=commune&facet=quartier&facet=type_iti&rows=-1')
    if res:
        raw_data = res.json()['records']
    else:
        with open('resources/velos/lignes_velo.json') as json_data:
            raw_data = json.load(json_data)

    clean_data = []
    id_generator = 0

    for rd in raw_data:
        id_generator += 1
        new_data = {
            "ligne_id" : id_generator,
            "ligne_name" : "Piste cyclable {}".format(id_generator),
            "geometry" : rd["fields"]["geo_shape"]
        }
        clean_data.append(new_data)


    # Pre-traitement coordinates geometry
    for data in clean_data:
        if(data["geometry"]["type"] == "MultiLineString"):
            res = "("
            for coord in data["geometry"]["coordinates"][0]:
                res += ""+str(coord[0])+" "+str(coord[1])+", "

            data["geometry"]["coordinates"] = res[:-2]+")"
        elif(data["geometry"]["type"] == "LineString"):
            res = "("
            for coord in data["geometry"]["coordinates"]:
                res += ""+str(coord[0])+" "+str(coord[1])+", "

            data["geometry"]["coordinates"] = res[:-2]+")"

    with open('target/lignes_velo.sql', 'w') as sql_data:
        sql_data.write(
        """-- Table: public.lignes_velo
    -- DROP TABLE public.lignes_velo;

    CREATE TABLE public.lignes_velo
    (
        id numeric NOT NULL,
        geom geometry(MULTILINESTRING, 4326),
        name character varying(25),
        CONSTRAINT lignes_velo_pkey PRIMARY KEY (id)
    );

    """)

    with open('target/lignes_velo.sql', "a") as sql_data:
        for elem in clean_data:
                sql_data.write("INSERT INTO public.lignes_velo (id, name, geom) VALUES (\'{}\', \'{}\', ST_GeomFromText(\'MULTILINESTRING({})\', {}));\n"
                    .format(elem["ligne_id"], elem["ligne_name"].replace("'", "''"), elem["geometry"]["coordinates"], 4326))
