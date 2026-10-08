FROM registry.gitlab.com/simon-kucher-engine/platform/platform-docker-images/alpine:3.21.3

RUN apk add --no-cache nginx \
  && mkdir -p /srv/www /run/nginx /tmp/nginx/client_temp /tmp/nginx/proxy_temp /tmp/nginx/fastcgi_temp /tmp/nginx/uwsgi_temp /tmp/nginx/scgi_temp \
  && chown -R nginx:nginx /srv/www /run/nginx /tmp/nginx /var/lib/nginx /var/log/nginx \
  && rm -f /etc/nginx/http.d/default.conf

# CSV-only static demo image: the Sunwing files and committed CSV exports are
# baked directly into the container and served by nginx.
COPY nginx.conf /etc/nginx/nginx.conf
COPY --chown=nginx:nginx data/ /srv/www/

USER nginx

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:8080/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
