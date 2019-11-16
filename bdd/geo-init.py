import requests
from time import sleep
from warnings import warn

rest_url = "http://geoserver:8080/geoserver/rest/"
headers = {'Content-Type': 'application/json', 'Accept': 'application/json'}
workspaceName = "CELC"
dataStoreName = "CELC"
bb = {
    "minx": 1.7,
    "maxx": 2.1,
    "miny": 47.7,
    "maxy": 48.1,
    "crs": "EPSG:4326"
}
layers_names = [
    "arrets_tao_bus",
    "arrets_tao_tram",
    "lignes_tao_bus",
    "lignes_tao_tram",
    "lignes_velo",
    "stations_velo",
    "parcs_relais_velo",
    "parkings_velo"
]

def createWorkspace(workspace_name):
    workspace_json = {
        "workspace" : {
            "name": workspace_name
        }
    }
    workspaces_url = "{base}workspaces/".format(base = rest_url)

    response = requests.post(workspaces_url, auth=('admin', 'geoserver'), json = workspace_json, headers=headers)
    if response.status_code == 201:
        print("Workspace {} created".format(workspace_name)) 
    elif response.status_code == 401:
        print("Workspace {} already existed".format(workspace_name))
    else:
        print(response.status_code)
        print(response.text)

def createDatastore(workspace_name, datastore_name):
    datastore_json = {
        "dataStore": {
            "name": datastore_name,
            "connectionParameters": {
                "entry": [
                    {"@key":"host","$":"db"},
                    {"@key":"port","$":"5432"},
                    {"@key":"database","$":"gis"},
                    {"@key":"user","$":"docker"},
                    {"@key":"passwd","$":"docker"},
                    {"@key":"dbtype","$":"postgis"}
                ]
            }
        }
    }
    datastores_url = "{base}workspaces/{wname}/datastores/".format(base = rest_url, wname = workspace_name)

    response = requests.post(datastores_url, auth=('admin', 'geoserver'), json = datastore_json, headers=headers)
    if response.status_code == 201:
        print("Datastore {} created".format(datastore_name)) 
    elif response.status_code == 401:
        print("Datastore {} already existed".format(datastore_name))
    else:
        print(response.status_code)
        print(response.text)

def createFeatureType(workspace_name, datastore_name, layer_name):
    featureType_json = {
        "featureType": {
            "name": layer_name,
		    "nativeName": layer_name,
		    "title": layer_name,
            "srs": "EPSG:4326",
            "enabled": True,
            "nativeBoundingBox": bb,
            "latLonBoundingBox": bb
        }
    }
    featureTypes_url = "{base}workspaces/{wname}/datastores/{dname}/featuretypes/".format(base = rest_url, wname = workspace_name, dname = datastore_name)

    response = requests.post(featureTypes_url, auth=('admin', 'geoserver'), json = featureType_json, headers=headers)
    if response.status_code == 201:
        print("Feature Type {} created".format(layer_name)) 
    elif response.status_code == 401:
        print("Feature Type {} already existed".format(layer_name))
    else:
        print(response.status_code)
        print(response.text)


timeout = 24
while timeout > 0:
    try:
        workspaces_url = "{base}workspaces/".format(base = rest_url)
        if not any(x['name'] == workspaceName for x in requests.get(workspaces_url, auth=('admin', 'geoserver'), headers=headers).json()['workspaces']['workspace']):
            createWorkspace(workspaceName)
        
        datastores_url = "{base}workspaces/{wname}/datastores/".format(base = rest_url, wname = workspaceName)
        if not any(x['name'] == dataStoreName for x in requests.get(datastores_url, auth=('admin', 'geoserver'), headers=headers).json()['dataStores']['dataStore']):
            createDatastore(workspaceName, dataStoreName)

        for ft_name in layers_names:
            featureTypes_url = "{base}workspaces/{wname}/datastores/{dname}/featuretypes/".format(base = rest_url, wname = workspaceName, dname = dataStoreName)
            if not any(x['name'] == ft_name for x in requests.get(featureTypes_url, auth=('admin', 'geoserver'), headers=headers).json()['featureTypes']['featureType']):
                createFeatureType(workspaceName, dataStoreName, ft_name)

        timeout = -1
    except requests.ConnectionError:
        sleep(5)
    timeout -= 1

if timeout == 0:
    warn("Coudn't connect to {}".format(rest_url))
