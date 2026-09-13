FROM postgres:16-alpine

RUN apk add --no-cache rclone

COPY deploy/backup/backup.sh /usr/local/bin/backup.sh
RUN chmod +x /usr/local/bin/backup.sh

ENTRYPOINT ["/bin/sh", "/usr/local/bin/backup.sh"]
