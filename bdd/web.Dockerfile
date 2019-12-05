FROM python:3.7

RUN sudo apt install libpq-dev
RUN pip install flask
RUN pip install psycopg2

WORKDIR /home/celc

COPY rest.py ./

CMD ["python3", "rest.py"]