print("----------- DEBUT DU PROGRAMME -----------")

import json
import re
import os

import resources.scripts_bdd.arrets_tao as arrets_tao
import resources.scripts_bdd.lignes_tao as lignes_tao
import resources.scripts_bdd.stations_velo as stations_velo
import resources.scripts_bdd.parcs_relais_velo as parcs_relais_velo
import resources.scripts_bdd.parkings_velo as parkings_velo
import resources.scripts_bdd.lignes_velo as lignes_velo

os.makedirs("target", exist_ok=True)

arrets_tao.traitement()
lignes_tao.traitement()
stations_velo.traitement()
parcs_relais_velo.traitement()
parkings_velo.traitement()
lignes_velo.traitement()

with open('target/signalements.sql', 'w') as sql_data:
    sql_data.write(
    """-- Table: public.signalements
-- DROP TABLE public.signalements;

CREATE TABLE public.signalements
(
    id SERIAL NOT NULL,
    type_signalement character varying(64) NOT NULL,
    retard integer,
    commentaire character varying(512),
    type_object character varying(64) NOT NULL,
    id_object integer NOT NULL,
    CONSTRAINT signalements_pkey PRIMARY KEY (id)
);

""")

print("------------ FIN DU PROGRAMME ------------")

# CREATE TABLE public.signalements
# (
#     id numeric NOT NULL,
#     type_signalement character varying(64) NOT NULL,
#     retard numeric,
#     commentaire character varying(512),
#     type_object character varying(64) NOT NULL,
#     id_object numeric NOT NULL,
#     CONSTRAINT signalements_pkey PRIMARY KEY (id)
# );
