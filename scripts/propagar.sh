#!/usr/bin/env bash
# Atualiza a dependência @lagoinha/ui-kit nos 5 apps do ecossistema para uma
# tag (ex.: v0.8.0), valida com o build de cada um e commita. Só envia ao
# GitHub com --push. champions-web fica de fora (fora do ecossistema de marca).
#
#   scripts/propagar.sh v0.8.0            # atualiza + builda + commita (local)
#   scripts/propagar.sh v0.8.0 --push     # idem, e dá push (dispara o deploy)
#
# Variáveis opcionais:
#   LAGOINHA_PROJETOS   pasta onde ficam os repos dos apps (padrão /root/projects)
#   COMMIT_TRAILER      linha extra no fim da mensagem de commit (ex.: Co-Authored-By: ...)
set -uo pipefail

TAG="${1:-}"
PUSH=0
[ "${2:-}" = "--push" ] && PUSH=1
if [ -z "$TAG" ] || [[ ! "$TAG" =~ ^v[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "uso: scripts/propagar.sh vX.Y.Z [--push]" >&2
  exit 2
fi

BASE="${LAGOINHA_PROJETOS:-/root/projects}"
APPS=(certifica-web portal-web iam-web lakespace-web pastoral-web)
DEP="github:lagoinha-consolidacao/ui-kit"

if ! git ls-remote --tags "$(git -C "$(dirname "$0")/.." remote get-url origin)" "refs/tags/$TAG" | grep -q "$TAG"; then
  echo "A tag $TAG não existe no GitHub do ui-kit. Rode scripts/release.sh primeiro." >&2
  exit 2
fi

declare -A RESULTADO

for app in "${APPS[@]}"; do
  dir="$BASE/$app"
  echo
  echo "=== $app ==="
  if [ ! -d "$dir/.git" ]; then RESULTADO[$app]="PULOU (repo não encontrado em $dir)"; echo "${RESULTADO[$app]}"; continue; fi
  cd "$dir" || continue

  if [ -n "$(git status --porcelain)" ]; then
    RESULTADO[$app]="PULOU (há alterações não commitadas)"; echo "${RESULTADO[$app]}"; continue
  fi
  branch="$(git branch --show-current)"
  git fetch -q origin "$branch"
  if [ "$(git rev-list --count "HEAD..origin/$branch")" != "0" ]; then
    RESULTADO[$app]="PULOU (o remoto tem commits novos; faça pull antes)"; echo "${RESULTADO[$app]}"; continue
  fi

  atual="$(node -p "require('./package.json').dependencies['@lagoinha/ui-kit'] || ''")"
  if [ "$atual" = "$DEP#$TAG" ]; then
    RESULTADO[$app]="JÁ ESTAVA em $TAG"; echo "${RESULTADO[$app]}"; continue
  fi

  echo "atual: ${atual:-<ausente>}  ->  $DEP#$TAG"
  if ! npm install "$DEP#$TAG" --no-audit --no-fund >/tmp/propagar-npm.log 2>&1; then
    tail -5 /tmp/propagar-npm.log
    git checkout -q -- package.json package-lock.json 2>/dev/null
    RESULTADO[$app]="FALHOU (npm install)"; echo "${RESULTADO[$app]}"; continue
  fi
  if ! npm run build >/tmp/propagar-build.log 2>&1; then
    tail -15 /tmp/propagar-build.log
    git checkout -q -- package.json package-lock.json 2>/dev/null
    RESULTADO[$app]="FALHOU (build) — nada foi commitado"; echo "${RESULTADO[$app]}"; continue
  fi

  git add package.json package-lock.json
  msg="Atualiza @lagoinha/ui-kit para $TAG"
  [ -n "${COMMIT_TRAILER:-}" ] && msg="$msg"$'\n\n'"$COMMIT_TRAILER"
  git commit -q -m "$msg"

  if [ "$PUSH" = "1" ]; then
    if git push -q origin "$branch"; then RESULTADO[$app]="ATUALIZADO e ENVIADO ($(git rev-parse --short HEAD))"
    else RESULTADO[$app]="COMMITADO, mas o push FALHOU"; fi
  else
    RESULTADO[$app]="ATUALIZADO e commitado localmente ($(git rev-parse --short HEAD)); falta o push"
  fi
  echo "${RESULTADO[$app]}"
done

echo
echo "================ RESUMO ($TAG) ================"
falhas=0
for app in "${APPS[@]}"; do
  printf "%-14s %s\n" "$app" "${RESULTADO[$app]:-?}"
  case "${RESULTADO[$app]:-?}" in FALHOU*|*"push FALHOU"*) falhas=1 ;; esac
done
exit $falhas
