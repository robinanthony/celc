print("----------- DEBUT DU PROGRAMME -----------")

import json
import re
import os

import resources.scripts_bdd.arrets_tao as arrets_tao
import resources.scripts_bdd.lignes_tao as lignes_tao
import resources.scripts_bdd.stations_velo as stations_velo

os.makedirs("target", exist_ok=True)

arrets_tao.traitement()
lignes_tao.traitement()
stations_velo.traitement()

print("------------ FIN DU PROGRAMME ------------")
