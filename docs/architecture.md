# アーキテクチャ

## Overview
Claude CodeからAbleton Liveを操作して音楽制作を行うプロジェクト。
AbletonOSC (OSC通信) + MCP Server 経由でAbleton Liveを制御する。

## MCP Server
- ソース: `/mnt/c/Users/roomt/Documents/Projects/AbletonMCP/src/mcp_server.py`
- 実行: Windows版Python (`.venv/Scripts/python.exe`)
- プロトコル: stdio経由のMCP

## AbletonOSC (Remote Script)
- 場所: `C:\ProgramData\Ableton\Live 12 Suite\Resources\MIDI Remote Scripts\AbletonOSC\`
- ポート設定 (`abletonosc/constants.py`):
  - `OSC_LISTEN_PORT = 11000` (Ableton側の受信ポート)
  - `OSC_RESPONSE_PORT = 11001` (Python側の受信ポート)
- ログ: `AbletonOSC/logs/abletonosc.log` で動作確認可能

## OSC通信フロー
```
MCP Server (Python) --[UDP:11000]--> AbletonOSC (Ableton内)
MCP Server (Python) <--[UDP:11001]-- AbletonOSC (Ableton内)
```

## Strudel（ブラウザ版TidalCycles）
- 公式: https://strudel.cc/
- Ableton不要、ブラウザ上でライブコーディング音楽制作
- 生成コードを strudel.cc にペーストして `Ctrl+Enter` で再生
- リファレンス: [strudel-reference.md](strudel-reference.md)
- 生成済みパターン: `strudel/` ディレクトリ

## Troubleshooting

### 接続できない場合のチェックリスト
1. Ableton Liveが起動しているか
2. Preferences > Link, Tempo & MIDI > Control Surface に AbletonOSC が設定されているか
3. **ポート競合チェック** (最も多い原因):
   ```powershell
   netstat -ano | findstr 11001
   ```
   複数プロセスが11001を使っている場合、古いPythonプロセスを終了する:
   ```powershell
   Get-Process -Id <PID> | Select-Object ProcessName,Id
   Stop-Process -Id <PID> -Force
   ```
4. 古いプロセスを終了した場合、Claude Codeの再起動が必要（MCPサーバーも再起動される）

### 接続確認
- `ableton_connect` でモックモードでなく接続されればOK
- AbletonOSCログ末尾で最新のOSC通信を確認可能
