<p align="center">
  <a href="https://coddin.nl">
    <img width="400" src="https://coddin.nl/wp-content/uploads/2023/09/1664468549659.jpeg" alt="TMP Logo of Preset">
  </a>
</p>

## Coddin Laravel Preset

```
composer create-project laravel/laravel projectname
cd projectname
npx @preset/cli apply coddin-web/laravel-preset
```

## Contains

This preset contains an opinionated set of rules for PHPStan, PHPCS and PHPUnit.
It contains PHPStan's strict and deprecation rules and the very strict library "ergebnis".

Next to that a basic, but usable Bitbucket Pipelines file is included with a deployer file for CI and Deployment.

This repository is maintained by <a href="https://coddin.nl">Coddin</a>.
It is used for bootstrapping our internal projects. Bugs and feature requests can be filed as an issue on GitHub and we will try to resolve it as soon as possible.
