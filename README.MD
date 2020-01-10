# Configurador de Conexão Oracle - UNIVEM

Gerador de conexão .ini

## Compatibilidade

Win x64
Win x86

## Variáveis

-   Database
-   User_Name=
-   Password

## Build

```sh
yarn build
```

## Corrigir erro de versão do NodeJS

excluir o arquivo **yarn.lock** e a pasta **node_modules**

executar:

```sh
yarn
```

depois das dependências instaladas executar o rebuild:

```sh
yarn rebuild
```

e então gere o build:

```sh
yarn build
```

Copyright ® 2020 Victor Gianvechio
