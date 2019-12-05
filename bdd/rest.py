import psycopg2
from flask import Flask, jsonify, abort, make_response, request, url_for
app = Flask(__name__)

DBNAME = "gis"
USER = "docker"
PASSWORD = "docker"
HOST = "localhost"
PORT = "25434"

# request.execute("INSERT INTO signalements (id, type_signalement, type_object, id_object) VALUES (1, 1, 2, 2);")
# database.commit()

@app.errorhandler(404)
def not_found(error):
    return make_response(jsonify({'error': 'Not found'}), 404)

@app.route('/signalement', methods=['GET'])
def get_signalements():
    database = psycopg2.connect(dbname=DBNAME, user=USER, password=PASSWORD, host=HOST, port=PORT)
    cursor = database.cursor()

    cursor.execute("SELECT * FROM signalements;")
    reponse = jsonify({'signalement': cursor.fetchall()})

    cursor.close()
    database.close()
    return reponse

@app.route('/signalement/<int:signalement_id>', methods=['GET'])
def get_signalement(signalement_id):
    database = psycopg2.connect(dbname=DBNAME, user=USER, password=PASSWORD, host=HOST, port=PORT)
    cursor = database.cursor()

    cursor.execute("SELECT * FROM public.signalements WHERE id = %(id)s;", { "id" : signalement_id})
    reponse = jsonify({'signalement': cursor.fetchone()})

    cursor.close()
    database.close()
    return reponse

@app.route('/signalement', methods=['POST'])
def add_signalement():
    if not request.json :
        abort(400, "Require Content-Type: application/json.")

    if 'type_signalement' not in request.json:
        abort(400, "Require data 'type_signalement' not NULL.")
    # if request.json['type_signalement'] is not None:
    #     abort(400, "Require data 'type_signalement' not NULL.")

    if 'type_object' not in request.json:
        abort(400, "Require data 'type_object' not NULL.")
    # if request.json['type_object'] is not None:
    #     abort(400, "Require data 'type_object' not NULL.")

    if 'id_object' not in request.json:
        abort(400, "Require data 'id_object' not NULL.")
    # if request.json['id_object'] is not None:
    #     abort(400, "Require data 'id_object' not NULL.")

    database = psycopg2.connect(dbname=DBNAME, user=USER, password=PASSWORD, host=HOST, port=PORT)
    cursor = database.cursor()

    values = {
        "type_signalement" : request.json.get("type_signalement"),
        "retard" : request.json.get("retard", None),
        "commentaire" : request.json.get("commentaire", None),
        "type_object" : request.json.get("type_object"),
        "id_object" : request.json.get("id_object")
        }

    # cursor.execute("SELECT nextval('public.signalements_id_seq')")

    # cursor.execute("""
    #     SELECT
    #     sequence_name, DATA_TYPE
    #     FROM
    #     information_schema.SEQUENCES
    #     WHERE
    #     sequence_name = 'signalements_iq_seq';
    # """)

    cursor.execute("""
     INSERT INTO public.signalements (type_signalement, retard, commentaire, type_object, id_object)
     VALUES (%(type_signalement)s, %(retard)s, %(commentaire)s, %(type_object)s, %(id_object)s);
     """, values)

    database.commit()
    reponse = jsonify({'signalement': cursor.fetchall()})
#     return jsonify({'task': make_public_task(task)}), 201
    cursor.close()
    database.close()
    return reponse, 201

# id numeric NOT NULL,
# type_signalement character varying(64) NOT NULL,
# retard numeric,
# commentaire character varying(512),
# type_object character varying(64) NOT NULL,
# id_object numeric NOT NULL,














# @app.route('/tasks', methods=['POST'])
# def create_task():
#     if not request.json or not 'title' in request.json:
#         abort(400)
#     task = {
#         'id': tasks[-1]['id'] + 1,
#         'title': request.json['title'],
#         'description': request.json.get('description', ""),
#         'done': False
#     }
#     tasks.append(task)
#     return jsonify({'task': make_public_task(task)}), 201

# def make_public_task(task):
#     new_task = {}
#     for field in task:
#         if field == 'id':
#             new_task['uri'] = url_for('get_task', task_id=task['id'], _external=True)
#         else:
#             new_task[field] = task[field]
#     return new_task



# @app.route('/tasks', methods=['GET'])
# def get_tasks():
#     return jsonify({'tasks': [make_public_task(task) for task in tasks]})
#
# @app.route('/tasks/<int:task_id>', methods=['GET'])
# def get_task(task_id):
#     task = [task for task in tasks if task['id'] == task_id]
#     if len(task) == 0:
#         abort(404)
#     return jsonify({'task': make_public_task(task[0])})
#
# @app.route('/tasks', methods=['POST'])
# def create_task():
#     if not request.json or not 'title' in request.json:
#         abort(400)
#     task = {
#         'id': tasks[-1]['id'] + 1,
#         'title': request.json['title'],
#         'description': request.json.get('description', ""),
#         'done': False
#     }
#     tasks.append(task)
#     return jsonify({'task': make_public_task(task)}), 201
#
# # Peu utile dans notre cas
# @app.route('/tasks/<int:task_id>', methods=['PUT'])
# def update_task(task_id):
#     task = [task for task in tasks if task['id'] == task_id]
#     if len(task) == 0:
#         abort(404)
#     if not request.json:
#         abort(400)
#     if 'title' in request.json and type(request.json['title']) != unicode:
#         abort(400)
#     if 'description' in request.json and type(request.json['description']) is not unicode:
#         abort(400)
#     if 'done' in request.json and type(request.json['done']) is not bool:
#         abort(400)
#     task[0]['title'] = request.json.get('title', task[0]['title'])
#     task[0]['description'] = request.json.get('description', task[0]['description'])
#     task[0]['done'] = request.json.get('done', task[0]['done'])
#     return jsonify({'task': make_public_task([0])})
#
# @app.route('/tasks/<int:task_id>', methods=['DELETE'])
# def delete_task(task_id):
#     task = [task for task in tasks if task['id'] == task_id]
#     if len(task) == 0:
#         abort(404)
#     tasks.remove(task[0])
#     return jsonify({'result': True})

if __name__ == '__main__':
#     #Debug mode should never be used in a production environment!
    app.run(debug=True, host="localhost", port=9152)
