FROM python:3.7

RUN pip install requests

WORKDIR /home/celc

COPY geo-init.py ./

CMD ["python3", "geo-init.py"]