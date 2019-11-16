FROM kartoza/geoserver

COPY web.xml /usr/local/tomcat/conf/

CMD ["/scripts/entrypoint.sh"]

