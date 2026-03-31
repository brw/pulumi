#!/usr/bin/env sh
set -e

ROLE=${SCCACHE_ROLE:?SCCACHE_ROLE must be 'scheduler' or 'server'}

envsubst <"/etc/sccache/templates/${ROLE}.conf" >"/etc/sccache/${ROLE}.conf"

exec sccache-dist "${ROLE}" --config "/etc/sccache/${ROLE}.conf"
