# Actual container
FROM registry.digitalocean.com/coddin/laravel-fpm-base:1.0.0-php8.3-node18.19

COPY --chown=www-data:www-data ["./docker/project-preload-ignore.php", "./docker/project-preload-include.php", "/app/"]

COPY --chown=www-data:www-data ./composer.json /app/composer.json
COPY --chown=www-data:www-data ./app /app/app
COPY --chown=www-data:www-data ./artisan /app/artisan
COPY --chown=www-data:www-data ./bootstrap /app/bootstrap
COPY --chown=www-data:www-data ./config /app/config
COPY --chown=www-data:www-data ./database /app/database
COPY --chown=www-data:www-data ./lang /app/lang
COPY --chown=www-data:www-data ./public /app/public
COPY --chown=www-data:www-data ./resources /app/resources
COPY --chown=www-data:www-data ./routes /app/routes
COPY --chown=www-data:www-data ./vendor /app/vendor
