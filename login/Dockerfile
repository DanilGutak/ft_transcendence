FROM python:3.12.4-slim


ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        gcc \
        gettext \
        postgresql-client \
		netcat-openbsd \
    && rm -rf /var/lib/apt/lists/*
COPY requirements.txt /requirements.txt
COPY entrypoint.sh /entrypoint.sh
RUN chmod 777 entrypoint.sh
RUN pip install --upgrade pip \
    && pip install -r requirements.txt


CMD ["bash", "entrypoint.sh"]