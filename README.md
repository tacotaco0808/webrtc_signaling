##必須なファイル

certs フォルダ内に自己署名証明書を配置してください。

- certs/server_crt.key
- certs/server_key.pem

##環境変数設定
プロジェクトルートに .env ファイルを作成し、以下の内容を追加してください。

```env
SERVER_ENV=dev  # 開発環境を指定
PORT=3000       # サーバーポートを指定
HOST=           # サーバーホストを指定（例:192.168.1.xx）
DOCKER=true     # Docker環境で実行する場合に指定
```

##Docker での実行
Docker 環境で実行する場合、.env ファイルに `DOCKER=true` を追加してください。
Docker イメージのビルドとコンテナの起動は以下のコマンドで行います。

```bash
docker-compose build
docker-compose up -d
docker-compose logs -f
docker-compose down

docker-compose up -d --build # ビルドと起動を同時に行う場合
docker inspect webrtc-signaling-server -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' # コンテナのIPアドレスを確認する場合
```
