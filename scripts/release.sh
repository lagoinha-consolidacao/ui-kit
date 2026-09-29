#!/usr/bin/env bash
# Publica uma versão nova do @lagoinha/ui-kit: sobe a versão, gera o dist
# (versionado neste repo), commita, cria a tag e envia ao GitHub. Não mexe
# nos apps — depois rode scripts/propagar.sh <tag> [--push].
#
#   scripts/release.sh minor "descrição curta"
#
# O working tree precisa estar limpo (as mudanças da versão já commitadas) e
# em dia com o remoto. Variável opcional: COMMIT_TRAILER (linha extra no commit).
set -euo pipefail

BUMP="${1:-}"
DESC="${2:-}"
if [[ ! "$BUMP" =~ ^(patch|minor|major)$ ]] || [ -z "$DESC" ]; then
  echo 'uso: scripts/release.sh <patch|minor|major> "descrição curta"' >&2
  exit 2
fi

cd "$(dirname "$0")/.."
branch="$(git branch --show-current)"
if [ -n "$(git status --porcelain)" ]; then echo "Há alterações não commitadas. Commite antes do release." >&2; exit 1; fi
git fetch -q origin "$branch"
if [ "$(git rev-list --count "HEAD..origin/$branch")" != "0" ]; then echo "O remoto tem commits novos; faça pull antes." >&2; exit 1; fi

npm version "$BUMP" --no-git-tag-version >/dev/null
VERSAO="$(node -p "require('./package.json').version")"
TAG="v$VERSAO"
if git rev-parse -q --verify "refs/tags/$TAG" >/dev/null; then echo "A tag $TAG já existe." >&2; git checkout -q -- package.json package-lock.json; exit 1; fi

npm run build
git add package.json package-lock.json dist
msg="Release $TAG — $DESC"
[ -n "${COMMIT_TRAILER:-}" ] && msg="$msg"$'\n\n'"$COMMIT_TRAILER"
git commit -q -m "$msg"
git tag "$TAG"
git push -q origin "$branch"
git push -q origin "$TAG"

echo "Publicado $TAG. Próximo passo: scripts/propagar.sh $TAG [--push]"
