print("----------- DEBUT DU PROGRAMME -----------")

import json

######################################################
########## TRAITEMENT DU FICHIER ARRETS TAO ##########
with open('bus/arrets-tao-gtfs.json', 'r') as json_data:
    raw_data = json.load(json_data)

clean_data = []

for rd in raw_data:
    new_data = {
        "stop_id" : rd["fields"]["stop_id"],
        "stop_name" : rd["fields"]["stop_name"],
        "geometry" : rd["geometry"]
    }
    clean_data.append(new_data)

with open('target/arrets_tao.sql', 'w') as sql_data:
    sql_data.write(
    """-- Table: public.arrets_tao
-- DROP TABLE public.arrets_tao;

CREATE TABLE public.arrets_tao
(
    id character varying(75) NOT NULL,
    geom geometry(Point, 4326),
    name character varying(75),
    CONSTRAINT arrets_tao_pkey PRIMARY KEY (id)
);
""")

with open('target/arrets_tao.sql', "a") as sql_data:
    for elem in clean_data:
        sql_data.write("INSERT INTO public.arrets_tao (id, name, geom) VALUES (\'{}\', \'{}\', ST_GeomFromText(\'POINT({} {})\', {}));\n"
            .format(elem["stop_id"], elem["stop_name"].replace("'", "''"), elem["geometry"]["coordinates"][0], elem["geometry"]["coordinates"][1], 4326))

######################################################
########## TRAITEMENT DU FICHIER LIGNES TAO ##########
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

# Pre-traitement coordinates geometry
for data in clean_data:
    res = "("
    for coords in data["geometry"]["coordinates"]:
        for coord in coords:
            res += ""+str(coord[0])+" "+str(coord[1])+", "
    data["geometry"]["coordinates"] = res[:-2]+")"


with open('target/lignes_tao.sql', 'w') as sql_data:
    sql_data.write(
    """-- Table: public.lignes_tao
-- DROP TABLE public.lignes_tao;

CREATE TABLE public.lignes_tao
(
    id character varying(75) NOT NULL,
    geom geometry(MULTILINESTRING, 4326),
    short_name character varying(25),
    long_name character varying(100),
    route_type character varying(25),
    CONSTRAINT lignes_tao_pkey PRIMARY KEY (id)
);
""")

with open('target/lignes_tao.sql', "a") as sql_data:
    for elem in clean_data:
        sql_data.write("INSERT INTO public.lignes_tao (id, short_name, long_name, route_type, geom) VALUES (\'{}\', \'{}\', \'{}\', \'{}\', ST_GeomFromText(\'MULTILINESTRING({})\', {}));\n"
            .format(elem["route_id"], elem["route_short_name"].replace("'", "''"), elem["route_long_name"].replace("'", "''"), elem["route_type"].replace("'", "''"), elem["geometry"]["coordinates"], 4326))


print("------------ FIN DU PROGRAMME ------------")
