FROM alpine:latest

ARG VERSION

RUN --mount=type=cache,target=/etc/apk/cache apk add --update-cache curl gettext bubblewrap

RUN curl -L https://github.com/mozilla/sccache/releases/download/$VERSION/sccache-dist-$VERSION-x86_64-unknown-linux-musl.tar.gz > sccache-dist.tar.gz \
    && tar xf sccache-dist.tar.gz \
    && mv sccache-dist-$VERSION-x86_64-unknown-linux-musl/sccache-dist /usr/bin/sccache-dist \
    && rm -r sccache-dist.tar.gz sccache-dist-$VERSION-x86_64-unknown-linux-musl

RUN apk del curl

COPY ./configs/ /etc/sccache/templates/
COPY ./entrypoint.sh /entrypoint.sh

ENV SCCACHE_NO_DAEMON=1

ENTRYPOINT ["/entrypoint.sh"]
