# root.json

Este repositório existe para hospedar o arquivo `root.json`, que funciona como ponto central de descoberta de metadados distribuídos em outros repositórios.

## Estrutura do arquivo

```json
{
  "repos": [],
  "version": "0.0.1"
}
```

### `repos`
- Tipo: array de strings.
- Cada entrada aponta para um arquivo `metadados.json` mantido em outro repositório.
- Use URLs completas (por exemplo, links raw do GitHub) para permitir que consumidores baixem os metadados sem ambiguidade.

### `version`
- Tipo: string seguindo convenção SemVer (`MAJOR.MINOR.PATCH`).
- Indica a versão atual do arquivo `root.json` para que consumidores possam verificar compatibilidade ou detectar atualizações.
- Atualize este valor sempre que o conteúdo do arquivo mudar, seguindo as regras:
  - **MAJOR**: alterações incompatíveis (ex.: mudança de formato).
  - **MINOR**: adição retrocompatível (ex.: novo repositório listado).
  - **PATCH**: correções ou ajustes pequenos (ex.: correção de URL existente).

## Fluxo recomendado de atualização
1. Edite `root.json`, inserindo ou atualizando entradas em `repos`.
2. Ajuste o campo `version` conforme a natureza da alteração.
3. Faça commit e publique para disponibilizar a nova versão aos consumidores.

> 💡 Há um gatilho de pré-commit configurado com [Husky](https://typicode.github.io/husky/) que garante que, sempre que `root.repos` for alterado, o campo `version` receba automaticamente um incremento de minor caso você não tenha ajustado manualmente.

Manter esse processo garante previsibilidade para os clientes que dependem do arquivo central.
