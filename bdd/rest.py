import psycopg2
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

@app.errorhandler(404)
def not_found(error):
    return make_response(jsonify({'error': 'Not found'}), 404)

@app.errorhandler(500)
def server_error(error):
    return make_response(jsonify({'error': 'Internal Server Error\n'+error.get_response()}), 500)

@app.errorhandler(Exception)
def server_exception(error):
    return make_response(jsonify({'error': 'Internal Server Error\n'+str(error)}), 500)

@app.route('/signalement', methods=['GET'])
def get_signalements():
    database = psycopg2.connect(dbname=DBNAME, user=USER, password=PASSWORD, host=HOST, port=PORT)
    cursor = database.cursor()

    cursor.execute("SELECT * FROM signalements;")
    reponse = jsonify({'signalements': getJSON(cursor.fetchall(), cursor.description)})

    cursor.close()
    database.close()
    return reponse

@app.route('/signalement/<int:signalement_id>', methods=['GET'])
def get_signalement_byId(signalement_id):
    database = psycopg2.connect(dbname=DBNAME, user=USER, password=PASSWORD, host=HOST, port=PORT)
    cursor = database.cursor()

    cursor.execute("SELECT * FROM public.signalements WHERE id = %(id)s;", { "id" : signalement_id})
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

    cursor.execute("SELECT * FROM public.signalements WHERE type_object = %(type_object)s;", { "type_object" : type_object})
    reponse = jsonify({'signalements': getJSON(cursor.fetchall(), cursor.description)})

    cursor.close()
    database.close()
    return reponse

@app.route('/signalement/type_object/<string:type_object>/id_object/<int:id_object>', methods=['GET'])
def get_signalements_byId_object(type_object, id_object):
    database = psycopg2.connect(dbname=DBNAME, user=USER, password=PASSWORD, host=HOST, port=PORT)
    cursor = database.cursor()

    cursor.execute("SELECT * FROM public.signalements WHERE id_object = %(id_object)s and type_object = %(type_object)s;", {"id_object" : id_object, "type_object" : type_object})
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

    database = psycopg2.connect(dbname=DBNAME, user=USER, password=PASSWORD, host=HOST, port=PORT)
    cursor = database.cursor()

    values = {
        "type_signalement" : request.json.get("type_signalement"),
        "retard" : request.json.get("retard", None),
        "commentaire" : request.json.get("commentaire", None),
        "geom_text" : request.json.get("geom_text", None),
        "type_object" : request.json.get("type_object"),
        "id_object" : request.json.get("id_object")
        }

    cursor.execute("""
     INSERT INTO public.signalements (type_signalement, retard, commentaire, type_object, id_object, geom)
     VALUES (%(type_signalement)s, %(retard)s, %(commentaire)s, %(type_object)s, %(id_object)s, ST_GeomFromText(%(geom_text)s, 4326)) RETURNING *;
     """, values)

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

    cursor.execute("DELETE FROM public.signalements WHERE id = %(id)s;", { "id" : signalement_id})
    if cursor.rowcount != 1:
        abort(404)
    else:
        database.commit()

    cursor.close()
    database.close()
    return jsonify({'signalement': True})

if __name__ == '__main__':
#     #Debug mode should never be used in a production environment!
    app.run(debug=True, host="0.0.0.0", port=9152)
