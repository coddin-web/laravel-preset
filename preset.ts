import {editFiles, executeCommand} from "@preset/core";

export default definePreset({
    name: 'laravel-preset',
    options: {
        // ...
    },
    handler: async () => {
        await extractTemplates({
            title: 'Add all default files such as phpstan.neon, rector and .editorconfig',
            from: 'base-php-config',
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
                'nunomaduro/larastan',
                'phpcompatibility/php-compatibility',
                'phpstan/phpstan-beberlei-assert',
                'phpstan/phpstan-deprecation-rules',
                'phpstan/phpstan-mockery',
                'phpstan/phpstan-phpunit',
                'phpstan/phpstan-strict-rules',
                'phpunit/phpunit',
                'rector/rector',
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
            title: 'composer.json scripts and set to php ^8.2',
            files: 'composer.json',
            operations: [
                {
                    type: 'edit-json',
                    merge: {
                        "require": {
                            "php": "^8.2",
                        },
                        "scripts": {
                            "phpcs": "phpcs --standard=./phpcs_codestyle.xml -n app config database routes tests",
                            "phpcs-fix": "phpcbf --standard=./phpcs_codestyle.xml -n app config database routes tests",
                            "phpstan": "phpstan analyse --memory-limit=6G",
                            "phpunit": "vendor/bin/phpunit -c phpunit.xml.dist",
                            "phpunitwcov": "XDEBUG_MODE=coverage vendor/bin/phpunit -c phpunit.xml.dist --coverage-html reports/ --coverage-clover coverage/clover.xml",
                            "paratestwcov": "XDEBUG_MODE=coverage vendor/bin/paratest -c phpunit.xml.dist --coverage-html reports/ --coverage-clover coverage/clover.xml",
                            "phpcoverage": "coverage-check coverage/clover.xml 0",
                            "rector": " rector process database app",
                            "checkup": [
                                "@phpcs",
                                "@phpstan",
                                "@phpunitwcov"
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

        await editFiles({
            title: 'Remove useless comments',
            files: [
                'app/Models/User.php',
                'app/Providers/AuthServiceProvider.php',
                'config/app.php',
                'config/broadcasting.php',
                'config/cache.php',
                'database/factories/UserFactory.php',
                'database/seeders/DatabaseSeeder.php',
                'tests/Feature/ExampleTest.php',
            ],
            operations: [
                ...Array(20).fill({
                    type: 'remove-line',
                    match: new RegExp('^\\s*//.*$', 'gm'),
                }),
            ],
        });

        await editFiles({
            title: 'Disable phpcs and phpstan for empty() check in RedirectIfAuthenticated.php',
            files: [
                'app/Http/Middleware/RedirectIfAuthenticated.php',
            ],
            operations: [{
                type: 'add-line',
                lines: '// @phpcs:disable',
                indent: 8,
                position: 19,
            }, {
                type: 'add-line',
                lines: '// @phpstan-ignore-next-line',
                indent: 8,
                position: 20,
            }, {
                type: 'add-line',
                lines: '// @phpcs:enable',
                indent: 8,
                position: 22,
            }],
        });

        await editFiles({
            title: 'Replace shorthand ternary operator with null coalesce operator in RouteServiceProvider.php',
            files: [
                'app/Providers/RouteServiceProvider.php',
            ],
            operations: [{
                type: 'update-content',
                update: (content: string): string => {
                    return content.replace('id ?: $request', 'id ?? $request');
                },
            }],
        });

        await editFiles({
            title: 'Fix long line in TrustProxies.php',
            files: [
                'app/Http/Middleware/TrustProxies.php',
            ],
            operations: [{
                type: 'update-content',
                update: (content: string): string => {
                    return content.replaceAll(' | ', '\n        | ');
                },
            }],
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
    },
})
