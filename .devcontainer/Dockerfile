FROM mcr.microsoft.com/devcontainers/typescript-node:1-22-bookworm

# システムの依存パッケージをインストール
RUN apt-get update && apt-get install -y \
    git \
    curl \
    sudo \
    vim \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# 作業ディレクトリを作成
WORKDIR /workspace

# ユーザを作成
ARG USERNAME=node
ARG USER_UID=1000
ARG USER_GID=$USER_UID

# npmのグローバルパッケージをrootなしでインストールするための設定
ENV NPM_CONFIG_PREFIX=/home/node/.npm-global
ENV PATH=$PATH:/home/node/.npm-global/bin

# よく使用するnpmパッケージのグローバルインストール
RUN npm install -g npm@latest next@latest

# 必要なポートを公開
EXPOSE 3000