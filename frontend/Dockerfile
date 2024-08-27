FROM python:3.12.4-slim


ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        gcc \
        gettext \
        postgresql-client \
		iputils-ping \
    && rm -rf /var/lib/apt/lists/*
COPY requirements.txt /requirements.txt
RUN pip install --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# wait for postgres

EXPOSE 8007

CMD ["bash", "entrypoint.sh"]