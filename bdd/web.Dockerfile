FROM python:3.7

RUN apt-get install -y libpq-dev
RUN pip3 install flask
RUN pip3 install flask_cors
RUN pip3 install psycopg2

WORKDIR /home/celc

COPY rest.py ./

RUN ["mkdir", "static"]
RUN ["mkdir", "static/img"]
CMD ["python3", "rest.py"]
