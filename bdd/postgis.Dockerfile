FROM kartoza/postgis:11.0-2.5

RUN apt-get -y update \
    && apt-get install -y \
    python3.7 \
    python3-pip 

RUN python3 -m pip install requests

COPY resources ./resources
COPY run.py ./run.py

RUN python3 run.py

RUN cp -r ./target/. /docker-entrypoint-initdb.d/