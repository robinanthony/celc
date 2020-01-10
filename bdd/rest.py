import psycopg2, os
from flask import Flask, jsonify, abort, make_response, request, url_for
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# DBNAME = "gis"
# USER = "docker"
# PASSWORD = "docker"
# HOST = "localhost"
# PORT = "25434"
DBNAME = "gis"
USER = "docker"
PASSWORD = "docker"
HOST = "postgresql"
PORT = "5432"

##############################################################################
############################# FONCTIONS SUPPORT ##############################
DEC2FLOAT = psycopg2.extensions.new_type(
    psycopg2.extensions.DECIMAL.values,
    'DEC2FLOAT',
    lambda value, curs: float(value) if value is not None else None)
psycopg2.extensions.register_type(DEC2FLOAT)


def getJSON(rows, curDesc):
    columns = [desc[0] for desc in curDesc]
    result = []
    for row in rows:
        row = dict(zip(columns, row))
        result.append(row)
    return result

##############################################################################
##############################################################################
########################### GESTIONS PAGES ERREURS ###########################
##############################################################################
@app.errorhandler(404)
def not_found(error):
    return make_response(jsonify({'error': 'Not found'}), 404)


@app.errorhandler(500)
def server_error(error):
    return make_response(jsonify({'error': 'Internal Server Error \n'+error.get_response()}), 500)


@app.errorhandler(Exception)
def server_exception(error):
    return make_response(jsonify({'error': 'Internal Server Error E \n'+str(error)}), 500)

##############################################################################
##############################################################################
############################ GESTION SIGNALEMENTS ############################
##############################################################################
@app.route('/signalement', methods=['GET'])
def get_signalements():
    database = psycopg2.connect(dbname=DBNAME, user=USER, password=PASSWORD, host=HOST, port=PORT)
    cursor = database.cursor()

    cursor.execute("""SELECT s.id as id, s.type_signalement as type_signalement, s.retard as retard, s.commentaire as commentaire, s.type_object as type_object, s.id_object as id_object, s.geom as geom, s.id_image || '_' || i.orig_filename as image_filename
                      FROM public.signalements as s LEFT JOIN public.images as i ON s.id_image = i.id;""")
    reponse = jsonify({'signalements': getJSON(cursor.fetchall(), cursor.description)})

    cursor.close()
    database.close()
    return reponse


@app.route('/signalement/<int:signalement_id>', methods=['GET'])
def get_signalement_byId(signalement_id):
    database = psycopg2.connect(dbname=DBNAME, user=USER, password=PASSWORD, host=HOST, port=PORT)
    cursor = database.cursor()

    cursor.execute("""SELECT s.id as id, s.type_signalement as type_signalement, s.retard as retard, s.commentaire as commentaire, s.type_object as type_object, s.id_object as id_object, s.geom as geom, s.id_image || '_' || i.orig_filename as image_filename
                      FROM public.signalements as s LEFT JOIN public.images as i ON s.id_image = i.id
                      WHERE id = %(id)s;""", { "id" : signalement_id})
    signal = cursor.fetchone()
    if signal is None:
        abort(404)
    reponse = jsonify({'signalement': getJSON([signal], cursor.description)[0]})

    cursor.close()
    database.close()
    return reponse


@app.route('/signalement/<int:signalement_id>/object', methods=['GET'])
def get_object_bySignalementId(signalement_id):
    database = psycopg2.connect(dbname=DBNAME, user=USER, password=PASSWORD, host=HOST, port=PORT)
    cursor = database.cursor()

    cursor.execute("SELECT * FROM public.signalements WHERE id = %(id)s;", { "id" : signalement_id})
    signal = cursor.fetchone()
    if signal is None:
        abort(404)

    signal = getJSON([signal], cursor.description)[0]

    cursor.execute("SELECT * FROM public.{} WHERE id = %(id)s;".format(signal['type_object']), { "id" : signal['id_object']})
    objet = cursor.fetchone()
    if objet is None:
        abort(404)

    reponse = jsonify({'objet': getJSON([objet], cursor.description)[0]})

    cursor.close()
    database.close()
    return reponse


@app.route('/signalement/type_object/<string:type_object>', methods=['GET'])
def get_signalements_byType_object(type_object):
    database = psycopg2.connect(dbname=DBNAME, user=USER, password=PASSWORD, host=HOST, port=PORT)
    cursor = database.cursor()

    cursor.execute("""SELECT s.id as id, s.type_signalement as type_signalement, s.retard as retard, s.commentaire as commentaire, s.type_object as type_object, s.id_object as id_object, s.geom as geom, s.id_image || '_' || i.orig_filename as image_filename
                      FROM public.signalements as s LEFT JOIN public.images as i ON s.id_image = i.id
                      WHERE type_object = %(type_object)s;""", { "type_object" : type_object})
    reponse = jsonify({'signalements': getJSON(cursor.fetchall(), cursor.description)})

    cursor.close()
    database.close()
    return reponse


@app.route('/signalement/type_object/<string:type_object>/id_object/<int:id_object>', methods=['GET'])
def get_signalements_byId_object(type_object, id_object):
    database = psycopg2.connect(dbname=DBNAME, user=USER, password=PASSWORD, host=HOST, port=PORT)
    cursor = database.cursor()

    cursor.execute("""SELECT s.id as id, s.type_signalement as type_signalement, s.retard as retard, s.commentaire as commentaire, s.type_object as type_object, s.id_object as id_object, s.geom as geom, s.id_image || '_' || i.orig_filename as image_filename
                      FROM public.signalements as s LEFT JOIN public.images as i ON s.id_image = i.id
                      WHERE id_object = %(id_object)s and type_object = %(type_object)s;""", {"id_object" : id_object, "type_object" : type_object})
    reponse = jsonify({'signalements': getJSON(cursor.fetchall(), cursor.description)})

    cursor.close()
    database.close()
    return reponse


# curl --header "Content-Type: application/json" --request POST --data '{"type_signalement":"abc","type_object":"xyz", "id_object":0}' http://localhost:9152/signalement
@app.route('/signalement', methods=['POST'])
def add_signalement():
    if not request.json :
        abort(400, "Require Content-Type: application/json.")

    if 'type_signalement' not in request.json:
        abort(400, "Require data 'type_signalement' not NULL.")

    if 'type_object' not in request.json:
        abort(400, "Require data 'type_object' not NULL.")

    if 'id_object' not in request.json:
        abort(400, "Require data 'id_object' not NULL.")

    print("connect bd")
    database = psycopg2.connect(dbname=DBNAME, user=USER, password=PASSWORD, host=HOST, port=PORT)
    cursor = database.cursor()

    print("start values")
    values = {
        "type_signalement" : request.json.get("type_signalement"),
        "retard" : request.json.get("retard", None),
        "commentaire" : request.json.get("commentaire", None),
        "geom_text" : request.json.get("geom_text", None),
        "type_object" : request.json.get("type_object"),
        "id_object" : request.json.get("id_object"),
        "id_image" : request.json.get("id_image", None)
        }

    # Si un id_image est donné mais qu'elle n'existe pas
    if values['id_image'] is not None:
        print("cursor si id_image not None :{}".format(values['id_image']))
        cursor.execute("SELECT * FROM public.images WHERE id=%(id_image)s;", {"id_image": values['id_image']})
        if cursor.rowcount != 1:
            print("404 spotted")
            abort(404, "Ask 'id_image' does not exist in the database.")

    print("cursor pour inserer signalements")
    cursor.execute("""
     INSERT INTO public.signalements (type_signalement, retard, commentaire, type_object, id_object, geom, id_image)
     VALUES (%(type_signalement)s, %(retard)s, %(commentaire)s, %(type_object)s, %(id_object)s, ST_GeomFromText(%(geom_text)s, 4326), %(id_image)s) RETURNING *;
     """, values)

    print("jsonifycation")
    reponse = jsonify({'signalement': cursor.fetchone()})
    database.commit()

    cursor.close()
    database.close()
    return reponse, 201


# curl -X DELETE http://localhost:9152/signalement/100
@app.route('/signalement/<int:signalement_id>', methods=['DELETE'])
def delete_signalement(signalement_id):
    database = psycopg2.connect(dbname=DBNAME, user=USER, password=PASSWORD, host=HOST, port=PORT)
    cursor = database.cursor()

    # TODO : SI UNE IMAGE EXISTE DANS LE SIGNALEMENT A SUPPRIMER, SUPPRIMER L'IMAGE LIéE SERAIT COOL ...
    cursor.execute("SELECT * FROM public.signalements WHERE id = %(id)s;", { "id" : signalement_id})
    id_image = cursor.fetchone()[7]

    cursor.execute("DELETE FROM public.signalements WHERE id = %(id)s;", { "id" : signalement_id})
    if cursor.rowcount != 1:
        abort(404)
    else:
        if id_image is not None :
            cursor.execute("DELETE FROM public.images WHERE id=%(id)s", {"id" : id_image})
        database.commit()

    cursor.close()
    database.close()
    return jsonify({'signalement': True})

##############################################################################
##############################################################################
############################# GESTIONS IMAGES ################################
##############################################################################
@app.route('/image/<int:image_id>', methods=['GET'])
def get_image_byId(image_id):
    database = psycopg2.connect(dbname=DBNAME, user=USER, password=PASSWORD, host=HOST, port=PORT)
    cursor = database.cursor()

    print("start execute")
    cursor.execute("SELECT * FROM public.images WHERE id = %(id)s;", { "id" : image_id})
    signal = cursor.fetchone()
    if signal is None:
        print("Oups, 404 sur id : {}".format(image_id))
        abort(404)

    signal = getJSON([signal], cursor.description)[0]

    reponse = jsonify({'image': {"id_image" : signal["id"], "orig_filename" : signal["orig_filename"], "filename" : "{}_{}".format(signal["id"], signal["orig_filename"])}})

    cursor.close()
    database.close()
    return reponse


# curl --header "Content-Type: application/json" --request POST --data '{"bytecode":"ICICESTMONBYTECODE"}' http://localhost:9152/image
@app.route('/image', methods=['POST'])
def add_image():
    print("Test json")
    if not request.json :
        abort(400, "Require Content-Type: application/json.")

    print("test value bytecode")
    if 'bytecode' not in request.json:
        abort(400, "Require data 'bytecode' not NULL.")

    print("test connection")
    database = psycopg2.connect(dbname=DBNAME, user=USER, password=PASSWORD, host=HOST, port=PORT)
    cursor = database.cursor()
    print("connection done")

    cursor.execute("""
        INSERT INTO public.images (orig_filename) VALUES (%(filename)s) RETURNING *;
        """, {"filename" : request.json.get("filename")})

    id_image = cursor.fetchone()[0]
    print("id image", id_image)
    with open("static/img/{}_{}".format(id_image, request.json.get("filename")), mode='w+b') as f:
        print("Lol !")
        f.write(bytearray.fromhex(request.json.get("bytecode")))

    with open("static/img/{}_{}".format(id_image, request.json.get("filename")), mode='r+b') as f:
        print(f.read().hex())

    reponse = jsonify({'image': id_image})
    database.commit()

    cursor.close()
    database.close()
    return reponse, 201


if __name__ == '__main__':
#     #Debug mode should never be used in a production environment!
    app.run(debug=True, host="0.0.0.0", port=9152)
