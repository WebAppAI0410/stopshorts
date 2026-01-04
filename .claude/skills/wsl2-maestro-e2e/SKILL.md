---
description: WSL2からWindows上のAndroidエミュレータに接続してMaestro E2Eテストを実行する方法
triggers:
  - "E2Eテスト"
  - "Maestro"
  - "エミュレータ接続"
  - "WSL2からテスト"
---

# WSL2 Maestro E2E Testing

## 概要

WSL2環境からWindows上で動作するAndroidエミュレータに接続し、Maestro E2Eテストを実行するためのスキル。

## 前提条件

1. Windows上でAndroidエミュレータが起動していること
2. WSL2にMaestroがインストールされていること（`maestro --version`で確認）
3. WSL2にLinux版adbがインストールされていること

## Linux版adbのインストール（初回のみ）

```bash
cd /tmp
curl -sL https://dl.google.com/android/repository/platform-tools-latest-linux.zip -o platform-tools.zip
unzip -o platform-tools.zip -d ~/.local/
# ~/.local/platform-tools/adb が使用可能になる
```

## 接続手順

### Step 1: Windows側のadbサーバーを確認

PowerShellで実行:
```powershell
netstat -aon | findstr :5037
```

出力例:
```
TCP    127.0.0.1:5037      0.0.0.0:0    LISTENING    174780
TCP    192.168.192.1:5037  0.0.0.0:0    LISTENING    5172
```

**重要**: `127.0.0.1` 以外のIPアドレス（例: `192.168.192.1`）でリッスンしているものを探す。

### Step 2: WSL2から接続

```bash
# 環境変数を設定（192.168.192.1は実際のIPに置き換え）
export ADB_SERVER_SOCKET=tcp:192.168.192.1:5037

# 接続確認
~/.local/platform-tools/adb devices
# emulator-5554 device と表示されればOK
```

### Step 3: Maestroテスト実行

```bash
export ADB_SERVER_SOCKET=tcp:192.168.192.1:5037
maestro --host 192.168.192.1 test .maestro/flows/onboarding-flow.yaml
```

## トラブルシューティング

### 問題1: `adb -a -P 5037 nodaemon server` がエラー (10048)

**原因**: ポート5037が既に使用中

**解決策**:
- 既存のadbサーバーをそのまま使う
- `netstat -aon | findstr :5037` で外部IPでリッスンしているサーバーを探す
- そのIPを使って接続

### 問題2: WSL2から接続がタイムアウト

**原因**: ファイアウォールがブロックしている可能性

**解決策**:
```powershell
# 管理者権限で
New-NetFirewallRule -DisplayName "ADB Server" -Direction Inbound -Protocol TCP -LocalPort 5037 -Action Allow
```

### 問題3: エミュレータが認識されない

**原因**: adbサーバーがlocalhostのみでリッスンしている

**解決策**:
1. タスクマネージャーで全adb.exeを終了
2. Android Studioを閉じる（エミュレータは残す）
3. `adb -a -P 5037 nodaemon server` を実行
4. 別ターミナルで `adb devices` を確認

## 教訓（2026-01-05）

1. **`adb -a` コマンドは不要な場合が多い**
   - エミュレータ起動時に自動的にadbサーバーが起動する
   - そのサーバーが既に外部IPでリッスンしている場合がある

2. **netstatでIPを確認することが重要**
   - `127.0.0.1` → WSL2から接続不可
   - `192.168.x.x` や `10.x.x.x` → WSL2から接続可能

3. **環境変数の設定が必須**
   - `ADB_SERVER_SOCKET=tcp:<IP>:5037`
   - `maestro --host <IP>`

## クイックコマンド

```bash
# ワンライナーでE2Eテスト実行
export ADB_SERVER_SOCKET=tcp:192.168.192.1:5037 && maestro --host 192.168.192.1 test .maestro/flows/onboarding-flow.yaml
```

## 関連ファイル

- `.maestro/flows/` - テストフロー定義
- `.maestro/config.yaml` - Maestro設定
