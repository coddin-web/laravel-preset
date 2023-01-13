import {editFiles} from "@preset/core";

export default definePreset({
	name: 'laravel-preset',
	options: {
		// ...
	},
	handler: async() => {
		await extractTemplates({
			from: 'base-php-config',
		});

		await installPackages({
			for: 'php',
			dev: true,
			packages: [
				'coddin-web/laravel-stubs',
				'dg/bypass-finals',
				'ergebnis/phpstan-rules',
				'mockery/mockery',
				'nunomaduro/collision',
				'nunomaduro/larastan',
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
			for: 'php',
			dev: false,
			packages: [
				'spatie/laravel-data',
				'thecodingmachine/safe',
			],
		});

		await editFiles({
			files: 'composer.json',
			operations: [
				{
					type: 'edit-json',
					merge: {
						"require": {
							"php": "^8.1",
						},
						"scripts": {
							"phpcs": "phpcs --standard=./phpcs_codestyle.xml -n app config database nova-components routes",
							"phpcs-fix": "phpcbf --standard=./phpcs_codestyle.xml -n app config database nova-components routes",
							"phpstan": "phpstan analyse --memory-limit=2G",
							"phpunit": "vendor/bin/phpunit -c phpunit.xml.dist",
							"phpunitwcov": "XDEBUG_MODE=coverage vendor/bin/phpunit -c phpunit.xml.dist --coverage-html reports/ --coverage-clover coverage/clover.xml",
							"phpcoverage": "coverage-check coverage/clover.xml 0.1",
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
							],
						},
					}
				}
			],
		});

		await executeCommand({ command: 'composer', arguments: ['run', 'rector', '-n'] });

		await executeCommand({ command: 'composer', arguments: ['run', 'phpcs-fix', '-n'], ignoreExitCode: true });
	},
})
