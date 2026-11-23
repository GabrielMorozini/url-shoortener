FROM php:8.3-cli-alpine

RUN apk add --no-cache git unzip postgresql-dev libpq $PHPIZE_DEPS \
    && docker-php-ext-install pdo pdo_mysql pdo_pgsql \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && apk del $PHPIZE_DEPS postgresql-dev

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

EXPOSE 8000

CMD ["sh", "-c", "composer install && php artisan serve --host=0.0.0.0 --port=8000"]

