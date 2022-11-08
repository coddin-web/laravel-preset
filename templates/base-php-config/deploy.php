<?php
namespace Deployer;

require 'recipe/laravel.php';
require 'contrib/rsync.php';
require 'contrib/php-fpm.php';

// This is a base file for our laravel projects.
// It should be edited to fit the project.

// Config
set('application', 'APPLICATION_NAME_HERE');
set('php_fpm_version', '8.1');
set('repository', 'git@github.com:coddin-web/REPOSITORY_NAME_HERE.git');

add('shared_files', []);
add('shared_dirs', []);
add('writable_dirs', []);

// Hosts

host('HOST_NAME_HERE')
    ->setHostname('0.0.0.0')
    ->set('remote_user', 'REMOTE_USER_HERE')
    ->set('rsync_src', '/home/runner/work/REMOTE_USER_HERE/REMOTE_USER_HERE')
    ->set('deploy_path', '/var/www/REMOTE_USER_HERE');

// Tasks
add('rsync', [
    'exclude' => [
        '.git*',
        '.env*',
        '_ide_*',
        'storage/',
        'vendor/',
        'tests/',
        'node_modules/',
        '.github',
        '.php*',
        'phpcs*',
        'phpstan.neon',
        'phpunit.xml.dist',
        'README.md',
        'deploy.php',
        'server.php',
    ],
    'options' => ['delete', 'force'],
]);
after('deploy:prepare', 'rsync');

after('deploy:failed', 'deploy:unlock');

task('opcache:clear', function () {
    // Cachetool should be installed and executable (globally) by the deployer user
    // @see https://github.com/gordalina/cachetool
    run('{{bin/php}} $(which cachetool) opcache:status --fcgi');
    run('{{bin/php}} $(which cachetool) opcache:reset');
    run('{{bin/php}} $(which cachetool) opcache:status --fcgi');
});

desc('Deploys your project');
task('deploy', [
    'deploy:prepare',
    'deploy:shared',
    'deploy:vendors',
    'artisan:storage:link',
    'artisan:optimize',
    'artisan:migrate',
    'deploy:publish',
    'opcache:clear',
    'php-fpm:reload',
    'artisan:queue:restart',
]);
