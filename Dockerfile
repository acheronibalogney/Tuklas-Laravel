FROM node:22-alpine AS frontend

WORKDIR /app
ARG VITE_GOOGLE_CLIENT_ID
ARG VITE_FACEBOOK_APP_ID
ARG VITE_AUTH_REDIRECT_URI
ARG VITE_FACEBOOK_GRAPH_API_VERSION=v26.0
ENV VITE_GOOGLE_CLIENT_ID=${VITE_GOOGLE_CLIENT_ID} \
    VITE_FACEBOOK_APP_ID=${VITE_FACEBOOK_APP_ID} \
    VITE_AUTH_REDIRECT_URI=${VITE_AUTH_REDIRECT_URI} \
    VITE_FACEBOOK_GRAPH_API_VERSION=${VITE_FACEBOOK_GRAPH_API_VERSION}
COPY package.json package-lock.json ./
RUN npm ci
COPY vite.config.ts tsconfig.json tsconfig.app.json tsconfig.node.json ./
COPY resources ./resources
COPY src ./src
RUN npm run build

FROM composer:2 AS composer-bin

FROM php:8.5-apache

ENV APACHE_DOCUMENT_ROOT=/var/www/html/public
WORKDIR /var/www/html

RUN apt-get update \
    && apt-get install -y --no-install-recommends libpq-dev libzip-dev unzip \
    && docker-php-ext-install intl pdo_pgsql mbstring zip \
    && a2enmod rewrite \
    && sed -ri -e 's!/var/www/html!/var/www/html/public!g' /etc/apache2/sites-available/000-default.conf \
    && sed -ri -e 's!<Directory /var/www/>!<Directory /var/www/html/public>!' /etc/apache2/apache2.conf \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer-bin /usr/bin/composer /usr/bin/composer
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader

COPY . .
COPY --from=frontend /app/public/build ./public/build
COPY docker/entrypoint.sh /usr/local/bin/tuklas-entrypoint

RUN mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views storage/logs bootstrap/cache \
    && chmod +x /usr/local/bin/tuklas-entrypoint \
    && chown -R www-data:www-data storage bootstrap/cache

EXPOSE 80
ENTRYPOINT ["tuklas-entrypoint"]
CMD ["apache2-foreground"]
