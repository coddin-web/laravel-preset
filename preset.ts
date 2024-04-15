import { editFiles, executeCommand } from "@preset/core";

export default definePreset({
    name: 'laravel-preset',
    handler: async () => {
        await extractTemplates({
            title: 'Add all default files such as phpstan.neon, rector and .editorconfig',
            from: 'base-php-config',
        });

        await editFiles({
            title: 'composer.json set to php ^8.3',
            files: 'composer.json',
            operations: [
                {
                    type: 'edit-json',
                    merge: {
                        "require": {
                            "php": "^8.3",
                        },
                    },
                },
            ],
        });

        await executeCommand({
            title: 'Allow codesniffer to be installed as a composer plugin',
            command: 'composer',
            arguments: ['config', '--no-plugins', 'allow-plugins.dealerdirect/phpcodesniffer-composer-installer', 'true']
        });

        await installPackages({
            title: 'Install dev packages',
            for: 'php',
            dev: true,
            additionalArgs: ['--no-interaction'],
            packages: [
                'coddin-web/laravel-stubs',
                'dg/bypass-finals',
                'ergebnis/phpstan-rules',
                'mockery/mockery',
                'larastan/larastan',
                'phpstan/phpstan-beberlei-assert',
                'phpstan/phpstan-deprecation-rules',
                'phpstan/phpstan-mockery',
                'phpstan/phpstan-phpunit',
                'phpstan/phpstan-strict-rules',
                'phpunit/phpunit',
                'rector/rector:dev-main',
                'rregeer/phpunit-coverage-check',
                'slevomat/coding-standard',
                'squizlabs/php_codesniffer',
                'thecodingmachine/phpstan-strict-rules',
            ],
        });

        await installPackages({
            title: 'Install Laravel Data and \\Safe',
            for: 'php',
            dev: false,
            packages: [
                'spatie/laravel-data',
                'thecodingmachine/safe',
            ],
        });

        await editFiles({
            title: 'composer.json scripts',
            files: 'composer.json',
            operations: [
                {
                    type: 'edit-json',
                    merge: {
                        "scripts": {
                            "phpcs": "phpcs --standard=./phpcs_codestyle.xml -n app config database routes tests",
                            "phpcs-fix": "phpcbf --standard=./phpcs_codestyle.xml -n app config database routes tests",
                            "phpstan": "phpstan analyse --memory-limit=6G",
                            "phpunit": "vendor/bin/phpunit -c phpunit.xml.dist",
                            "phpunitwcov": "XDEBUG_MODE=coverage vendor/bin/phpunit -c phpunit.xml.dist --coverage-html reports/ --coverage-clover coverage/clover.xml",
                            "phpcoverage": "coverage-check coverage/clover.xml 0",
                            "rector": " rector process database app",
                            "checkup": [
                                "@phpcs",
                                "@phpstan",
                                "@phpunitwcov",
                                "@phpcoverage"
                            ],
                            "coveragecheck": [
                                "@phpunitwcov",
                                "@phpcoverage"
                            ]
                        },
                    }
                }
            ],
        });

        await executeCommand({
            title: 'Run rector',
            command: 'composer',
            arguments: ['run', 'rector', '-n'],
        });

        await executeCommand({
            title: 'Run phpcs fix',
            command: 'composer',
            arguments: ['run', 'phpcs-fix', '-n'],
            ignoreExitCode: true,
        });

        await executeCommand({
            title: 'Install stubs',
            command: 'php',
            arguments: ['artisan', 'coddin-stubs:install'],
        });

        await editFiles({
            title: 'Newline in config/app.php',
            files: [
                'config/app.php',
            ],
            operations: [{
                type: 'add-line',
                lines: [
                    "\r\n //This will be removed by the next command. We only need the newline.",
                ],
                indent: 0,
                position: 158,
            }],
        });

        await executeCommand({
            title: 'Remove useless boilerplate test files',
            command: 'rm',
            arguments: ['-rf', 'tests/**/ExampleTest.php'],
        });

        await editFiles({
            title: 'Remove useless comments',
            files: [
                'app/Models/User.php',
                'config/app.php',
                'config/cache.php',
                'database/factories/UserFactory.php',
                'database/seeders/DatabaseSeeder.php',
            ],
            operations: [
                ...Array(20).fill({
                    type: 'remove-line',
                    match: new RegExp('^\\s*//.*$', 'gm'),
                }),
            ],
        });

        await executeCommand({
            title: 'Run phpcs fix',
            command: 'composer',
            arguments: ['run', 'phpcs-fix', '-n'],
            ignoreExitCode: true,
        });

        await executeCommand({
            title: 'Add strict type declarations and latest final class definitions',
            command: './final-strict-fix.sh',
        });

        await executeCommand({
            title: 'Replace bootstrap/app.php with a new one pt.1',
            command: 'rm',
            arguments: ['bootstrap/app.php'],
        });

        await executeCommand({
            title: 'Replace bootstrap/app.php with a new one pt.2',
            command: 'cp',
            arguments: ['overrides/bootstrap/app.php', 'bootstrap/app.php'],
        });

        await executeCommand({
            title: 'Cleanup',
            command: 'rm',
            arguments: ['-rf', 'overrides', 'tests/Feature/ExampleTest.php', 'tests/Unit/ExampleTest.php', 'database/database.sqlite', 'phpunit.xml'],
        });
    },
})
