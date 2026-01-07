# Bunの公式イメージを使用
FROM oven/bun:1 AS base
WORKDIR /app

# 依存関係のインストール
FROM base AS install
COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile

# 本番環境用イメージ
FROM base AS release
COPY --from=install /app/node_modules ./node_modules
COPY . .

# 証明書ディレクトリの作成（マウント用）
RUN mkdir -p /app/certs

# ポート公開
EXPOSE 3000

# サーバー起動
CMD ["bun", "run", "src/index.ts"]