FROM php:8.1-apache

RUN apt-get update && apt-get install -y \
    unzip \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

RUN docker-php-ext-install mysqli pdo pdo_mysql

RUN a2enmod rewrite

WORKDIR /var/www/html

COPY composer.json composer.lock* ./

RUN composer install --no-interaction --optimize-autoloader

COPY . .

RUN chown -R www-data:www-data /var/www/html

RUN echo "display_errors=On\nerror_reporting=E_ALL" > /usr/local/etc/php/conf.d/dev.ini

RUN sed -i 's|DocumentRoot /var/www/html/public|DocumentRoot /var/www/html|' /etc/apache2/sites-available/000-default.conf || true

CMD ["apache2ctl", "-D", "FOREGROUND"]
