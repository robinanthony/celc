print("----------- DEBUT DU PROGRAMME -----------")

import json
import re
import os

import resources.scripts_bdd.arrets_tao as arrets_tao
import resources.scripts_bdd.lignes_tao as lignes_tao
import resources.scripts_bdd.stations_velo as stations_velo
import resources.scripts_bdd.parcs_relais_velo as parcs_relais_velo

os.makedirs("target", exist_ok=True)

arrets_tao.traitement()
lignes_tao.traitement()
stations_velo.traitement()
parcs_relais_velo.traitement()

print("------------ FIN DU PROGRAMME ------------")
#
# CREATE TABLE public.signalements
# (
#     id numeric NOT NULL,
#     type_signalement character varying(64) NOT NULL,
#     type_object character varying(64) NOT NULL,
#     id_object numeric NOT NULL,
#     geom geometry(Point, 4326),
#     CONSTRAINT signalements_pkey PRIMARY KEY (id)
# );
