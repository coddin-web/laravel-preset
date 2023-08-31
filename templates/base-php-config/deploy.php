<?php

namespace Deployer;

require 'recipe/laravel.php';
require 'contrib/rsync.php';

// This is a base file for our laravel projects.
// It should be edited to fit the project.

// Config
set('application', 'abro-work-order-portal');
set('repository', 'git@bitbucket.com:coddin-web/abro-work-order-portal-portal.git');

set('shared_files', []);
add('shared_dirs', []);
add('writable_dirs', []);

// Hosts

import('deploy/hosts.yml');

// Tasks
add('rsync', [
    ...\json_decode(\file_get_contents(__DIR__ . '/deploy/rsync-exclude.json'), true),
    'options' => ['delete', 'force', 'links'],
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
    'deploy:info',
    'deploy:setup',
    'deploy:lock',
    'deploy:release',
    'rsync',
    'deploy:shared',
    'deploy:writable',
    'artisan:storage:link',
    'artisan:optimize',
    'artisan:migrate',
    'deploy:publish',
    'opcache:clear',
    'artisan:queue:restart',
]);
