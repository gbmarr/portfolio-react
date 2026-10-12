#!/usr/bin/env bash
# quick-scan.sh - Primera pasada heurística (grep) de patrones inseguros.
# NO reemplaza SAST/DAST/SCA reales (semgrep, codeql, trivy, gitleaks...). Genera señales a verificar manualmente.
# Uso: ./quick-scan.sh [ruta]   (por defecto: .)
set -u
TARGET="${1:-.}"
EXCL=(--exclude-dir=node_modules --exclude-dir=.git --exclude-dir=vendor --exclude-dir=dist --exclude-dir=build --exclude-dir=.venv --exclude-dir=__pycache__ --exclude=*.min.js --exclude=*.lock --exclude=package-lock.json)
FOUND=0

scan() { # titulo, regex
  local title="$1" regex="$2"
  local out
  out=$(grep -RInE "${EXCL[@]}" -e "$regex" "$TARGET" 2>/dev/null | head -n 25)
  if [ -n "$out" ]; then
    FOUND=$((FOUND+1))
    echo ""; echo "### $title"; echo "$out"
  fi
}

echo "== quick-scan en: $TARGET =="

echo ""; echo "######## SECRETOS ########"
scan "Claves privadas" '-----BEGIN (RSA |EC |OPENSSH |DSA |PGP )?PRIVATE KEY-----'
scan "AWS Access Key" 'AKIA[0-9A-Z]{16}'
scan "Tokens comunes (GitHub/Slack/Stripe/Google)" '(ghp_[A-Za-z0-9]{36}|github_pat_[A-Za-z0-9_]{20,}|xox[baprs]-[A-Za-z0-9-]{10,}|sk_live_[A-Za-z0-9]{16,}|AIza[0-9A-Za-z_-]{35})'
scan "Asignaciones sospechosas de secretos" '(password|passwd|secret|api[_-]?key|token|private[_-]?key)["'"'"']?[[:space:]]*[:=][[:space:]]*["'"'"'][^"'"'"' ]{8,}["'"'"']'
scan "Archivos .env versionados" 'DB_PASSWORD=|SECRET_KEY=|JWT_SECRET='

echo ""; echo "######## INYECCIONES / EJECUCION ########"
scan "SQL por concatenación/interpolación" '(SELECT|INSERT|UPDATE|DELETE)[^;"'"'"']*("[[:space:]]*\+|\$\{|%s|f"|\.format\()'
scan "ORM raw/unsafe" '(\.raw\(|queryRawUnsafe|\.extra\(|executeRaw\(|createNativeQuery\()'
scan "Ejecución de comandos/eval" '(\beval\(|\bexec\(|shell=True|child_process\.exec\(|os\.system\(|Runtime\.getRuntime\(\)\.exec|new Function\()'
scan "Deserialización insegura" '(pickle\.loads?|yaml\.load\(|unserialize\(|ObjectInputStream|BinaryFormatter|Marshal\.load)'
scan "SSTI / templates desde string" '(render_template_string|Template\([^)]*request|Environment\([^)]*autoescape=False)'
scan "NoSQL operadores peligrosos" '(\$where|\$ne\b.*req\.|JSON\.parse\(req)'

echo ""; echo "######## CLIENTE / XSS ########"
scan "Sinks DOM XSS" '(innerHTML[[:space:]]*=|outerHTML|insertAdjacentHTML|document\.write\(|dangerouslySetInnerHTML|v-html|bypassSecurityTrust)'
scan "Tokens en storage del navegador" '(localStorage|sessionStorage)\.setItem\([^)]*(token|jwt|auth)'
scan "CORS permisivo" '(Access-Control-Allow-Origin["'"'"']?[:,][[:space:]]*["'"'"']?\*|origin:[[:space:]]*true|allow_origins=\[["'"'"']\*)'

echo ""; echo "######## CRIPTO / TLS ########"
scan "Algoritmos débiles" '(\bMD5\b|\bSHA-?1\b|\bDES\b|\bRC4\b|/ECB/|AES/ECB|createHash\(["'"'"'](md5|sha1)["'"'"']\))'
scan "Aleatoriedad insegura" '(Math\.random\(\)|\brand\(\)|random\.random\(|new Random\()'
scan "Verificación TLS deshabilitada" '(verify[[:space:]]*=[[:space:]]*False|rejectUnauthorized:[[:space:]]*false|InsecureSkipVerify:[[:space:]]*true|CURLOPT_SSL_VERIFYPEER[^;]*false|NODE_TLS_REJECT_UNAUTHORIZED[[:space:]]*=[[:space:]]*["'"'"']?0)'
scan "JWT inseguro" '(alg["'"'"']?[[:space:]]*:[[:space:]]*["'"'"']none|jwt\.decode\([^)]*verify[[:space:]]*=[[:space:]]*False|ignoreExpiration:[[:space:]]*true|algorithms=\[\])'

echo ""; echo "######## ARCHIVOS / RED / SSRF ########"
scan "SSRF / fetch con input" '(requests\.(get|post)\([^)]*(request|params|input)|fetch\([^)]*req\.(body|query|params)|axios\.(get|post)\([^)]*req\.)'
scan "Path traversal potencial" '(sendFile\([^)]*req\.|open\([^)]*request|os\.path\.join\([^)]*request|readFile(Sync)?\([^)]*req\.)'
scan "Uploads con nombre original" '(originalname|\.filename\b|move_uploaded_file)'

echo ""; echo "######## CONFIGURACION / ERRORES ########"
scan "Debug activo" '(DEBUG[[:space:]]*=[[:space:]]*True|app\.debug[[:space:]]*=[[:space:]]*True|APP_DEBUG=true|NODE_ENV=development)'
scan "Stack trace al cliente" '(res\.(send|json)\([^)]*(err|error)\.stack|printStackTrace|traceback\.format_exc\(\)[^)]*return)'
scan "Cookies sin flags (revisar)" '(set_cookie|setCookie|res\.cookie)\('
scan "Endpoints de diagnóstico" '(/actuator|/debug|phpinfo|graphiql|/swagger|/console)'
scan "Mass assignment" '(Object\.assign\([^)]*req\.body|\*\*request\.(json|data)|\.update\(req\.body|@RequestBody[[:space:]]+[A-Z][A-Za-z]*Entity)'

echo ""; echo "######## DOCKER / IaC / CI ########"
scan "Docker: root/latest/curl|bash" '(FROM[[:space:]]+[^[:space:]]+:latest|curl[^|]*\|[[:space:]]*(ba)?sh|--privileged|docker\.sock)'
scan "Terraform/K8s: permisivo" '(0\.0\.0\.0/0|"\*:\*"|Action"?[[:space:]]*:[[:space:]]*"\*"|privileged:[[:space:]]*true|hostNetwork:[[:space:]]*true|cluster-admin)'
scan "GitHub Actions riesgosas" '(pull_request_target|uses:[[:space:]]*[^@]+@(main|master)\b|\$\{\{[[:space:]]*github\.event\.(issue|pull_request|comment))'

echo ""
echo "== Fin: $FOUND categorías con coincidencias. Revisar cada una manualmente (puede haber falsos positivos). =="
echo "Recomendado además: semgrep --config auto, gitleaks detect, trivy fs ., osv-scanner, checkov/tfsec."
