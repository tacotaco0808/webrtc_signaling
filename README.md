## 必須なファイル

certs フォルダ内に自己署名証明書を配置してください。

- certs/server_crt.key
- certs/server_key.pem

## 環境変数設定
プロジェクトルートに .env ファイルを作成し、以下の内容を追加してください。

```env
SERVER_ENV=dev  # 開発環境を指定
PORT=3000       # サーバーポートを指定
HOST=           # サーバーホストを指定（例:192.168.1.xx）
DOCKER=true     # Docker環境で実行する場合に指定
```

## Docker での実行
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

## webrtcシグナリングサーバ 殴り書きの設計書
必要な機能</br>
sdp(offer,answer),ice-candidateの交換</br>

接続ユーザは自作roomとsocket.ioの部屋機能の二つで管理</br>
userMapに全ユーザを保持</br>
さらにroomsにroom単位でユーザを保持</br>

```
userMap
-[socketId]:string
rooms
-[roomId]:any[]
```

入室処理(roomId,userIdがクライアント側から送られる)</br>
join</br>
↓</br>
userMap,roomsにユーザ追加</br>
↓</br>
socket.io機能の部屋に参加※socket.ioで部屋管理できてrooms/socket.ioのroomsの二つを同期している</br></br>

切断処理</br>
disconnect</br>
↓</br>
userMap,roomsからユーザ削除</br>

