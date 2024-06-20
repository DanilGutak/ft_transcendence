FROM python:3.12.4-slim


ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        gcc \
        gettext \
        postgresql-client \
    && rm -rf /var/lib/apt/lists/*
COPY requirements.txt /requirements.txt
RUN pip install --upgrade pip \
    && pip install -r requirements.txt


EXPOSE 8001
CMD ["python" ,"manage.py" ,"runserver" ,"0.0.0.0:8001"]