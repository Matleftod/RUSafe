#!/usr/bin/env bash

set -euo pipefail

script_directory="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
project_root="$(cd -- "${script_directory}/.." && pwd)"

cd "${project_root}"

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Commande requise introuvable : $1" >&2
    exit 1
  fi
}

encode_video() {
  local source="$1"
  local output="$2"
  local temporary_output="${output}.tmp.mp4"

  ffmpeg -hide_banner -loglevel warning -stats -y \
    -i "${source}" \
    -map 0:v:0 \
    -map "0:a:0?" \
    -vf "scale=-2:720:flags=lanczos" \
    -c:v libx264 \
    -preset medium \
    -crf 24 \
    -profile:v high \
    -level 3.1 \
    -pix_fmt yuv420p \
    -movflags +faststart \
    -c:a aac \
    -b:a 128k \
    -ac 2 \
    -map_metadata -1 \
    -map_chapters -1 \
    "${temporary_output}"

  mv "${temporary_output}" "${output}"
}

require_command cwebp

mkdir -p assets/posters

# Les vidéos publiques sont livrées déjà encodées depuis les masters validés.
# Ne pas les régénérer ici sans ces sources : elles sont nommées par langue
# (par exemple DIAG8-2030.fr.web.mp4 et DIAG8-2030.en.web.mp4).

cwebp -quiet -q 82 -resize 400 400 -metadata none assets/avatars/aurelien.jpg -o assets/avatars/aurelien.webp
cwebp -quiet -q 82 -resize 400 400 -metadata none assets/avatars/gilles.jpg -o assets/avatars/gilles.webp
cwebp -quiet -q 82 -resize 400 400 -metadata none assets/avatars/mickael.jpg -o assets/avatars/mickael.webp
cwebp -quiet -q 82 -resize 400 400 -metadata none assets/avatars/parham.jpg -o assets/avatars/parham.webp

cwebp -quiet -lossless -z 9 -metadata none assets/mockups/handphoneLeft.png -o assets/mockups/handphoneLeft.webp
cwebp -quiet -lossless -z 9 -metadata none assets/mockups/handphoneright.png -o assets/mockups/handphoneright.webp
cwebp -quiet -lossless -z 9 -metadata none assets/mockups/laptop.png -o assets/mockups/laptop.webp
cwebp -quiet -lossless -z 9 -metadata none assets/mockups/moniteur.png -o assets/mockups/moniteur.webp

echo "Médias web régénérés avec succès."
