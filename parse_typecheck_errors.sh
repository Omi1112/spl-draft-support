#!/bin/bash

# タイムスタンプを取得（ディレクトリ名に使用）
TIMESTAMP=$(date +%Y%m%d%H%M%S)

# タイムスタンプごとのディレクトリを作成
OUTPUT_DIR="tmp/typecheck/${TIMESTAMP}"
mkdir -p "$OUTPUT_DIR"

# エラーログを出力するディレクトリを作成
ERRORS_DIR="${OUTPUT_DIR}/errors"
mkdir -p "$ERRORS_DIR"

# エラー出力を一時ファイルに保存
ERROR_FILE="${OUTPUT_DIR}/errors.txt"
echo "型チェックを実行中..."

# npm run typecheckを実行して、その出力をファイルに保存
npm run typecheck 2>&1 | tee "$ERROR_FILE" || true

# エラーがない場合は終了
if ! grep -q "error TS" "$ERROR_FILE"; then
  echo "エラーは見つかりませんでした。"
  exit 0
fi

# ファイル一覧を取得
FILES=$(grep -oE '[a-zA-Z0-9_/.-]+\.(ts|tsx):[0-9]+:[0-9]+' "$ERROR_FILE" | cut -d':' -f1 | sort | uniq)

# エラーの総数を取得
ERROR_COUNT=$(grep -c "error TS" "$ERROR_FILE" || echo "0")
FILE_COUNT=$(echo "$FILES" | wc -l)

echo "合計 $ERROR_COUNT 個のエラーが $FILE_COUNT 個のファイルで見つかりました。"
echo "エラーをファイルごとに分割中..."

# すべてのエラー行を取得
ERROR_LINES=$(grep -n "error TS" "$ERROR_FILE" | cut -d':' -f1)

# エラー総数をカウント
TOTAL_ERRORS=$(echo "$ERROR_LINES" | wc -l)
echo "合計 $TOTAL_ERRORS 個のエラーを抽出しています..."

# エラーカウンター
ERROR_COUNTER=0

# 各エラー行を処理
for LINE_NUM in $ERROR_LINES; do
  # エラーカウンターを増やす
  ERROR_COUNTER=$((ERROR_COUNTER + 1))
  
  # エラー行を取得
  ERROR_LINE=$(sed -n "${LINE_NUM}p" "$ERROR_FILE")
  
  # エラーコードを抽出
  ERROR_CODE=$(echo "$ERROR_LINE" | grep -oE "TS[0-9]+" || echo "unknown")
  
  # ファイル名とエラー場所を抽出
  FILE_AND_LOCATION=$(echo "$ERROR_LINE" | grep -oE "^[^(]+\([0-9]+,[0-9]+\)" || echo "unknown-location")
  # ファイル名のみを抽出
  FILENAME=$(echo "$FILE_AND_LOCATION" | grep -oE "^[^(]+" || echo "unknown-file")
  # エラー場所を抽出
  LOCATION=$(echo "$FILE_AND_LOCATION" | grep -oE "\([0-9]+,[0-9]+\)" || echo "(0,0)")
  
  # ファイル名から安全な文字列を作成
  SAFE_FILENAME=$(echo "$FILENAME" | tr '/' '_' | tr '.' '_' | tr -d ' ' | tr -d ':')
  
  # エラーメッセージを取得
  ERROR_MESSAGE=$(echo "$ERROR_LINE" | sed 's/.*error TS[0-9]*: //' || echo "Unknown error")
  
  # 出力ファイル名を作成
  OUTPUT_FILE="${ERRORS_DIR}/${ERROR_COUNTER}_${SAFE_FILENAME}_${ERROR_CODE}.txt"
  
  # エラー情報をファイルに保存
  {
    echo "ファイル: $FILENAME"
    echo "場所: $LOCATION"
    echo "エラーコード: $ERROR_CODE"
    echo "エラーメッセージ: $ERROR_MESSAGE"
    echo ""
    echo "-- エラー詳細 --"
    echo "$ERROR_LINE"
    
    # エラー行の後に続くコード（存在する場合）
    NEXT_LINE=$((LINE_NUM + 1))
    NEXT_ERROR_LINE=$(echo "$ERROR_LINES" | awk -v current="$LINE_NUM" 'NR==FNR+1{print}' | head -1)
    
    # 次のエラーが見つからない場合はファイルの終わりまで
    if [ -z "$NEXT_ERROR_LINE" ]; then
      # 最大5行まで表示
      END_LINE=$((LINE_NUM + 5))
      MAX_FILE_LINE=$(wc -l < "$ERROR_FILE")
      if [ "$END_LINE" -gt "$MAX_FILE_LINE" ]; then
        END_LINE=$MAX_FILE_LINE
      fi
    else
      # 次のエラー行の前まで、最大5行まで
      END_LINE=$((NEXT_ERROR_LINE - 1))
      if [ "$((END_LINE - LINE_NUM))" -gt 5 ]; then
        END_LINE=$((LINE_NUM + 5))
      fi
    fi
    
    # 追加のコンテキストを表示（ある場合）
    if [ "$NEXT_LINE" -le "$END_LINE" ]; then
      echo ""
      echo "-- コンテキスト --"
      sed -n "${NEXT_LINE},${END_LINE}p" "$ERROR_FILE"
    fi
  } > "$OUTPUT_FILE"
  
  echo "📄 エラー #${ERROR_COUNTER}/${TOTAL_ERRORS}: $FILENAME ($ERROR_CODE) を ${OUTPUT_FILE} に保存しました"
done

# サマリー情報を別ファイルに保存
OUTPUT_SUMMARY="${OUTPUT_DIR}/summary.txt"

# ファイルごとのエラー数をカウント
echo "# TypeScriptエラーサマリー - $(date)" > "$OUTPUT_SUMMARY"
echo "" >> "$OUTPUT_SUMMARY"
echo "合計: $TOTAL_ERRORS 個のエラーが見つかりました" >> "$OUTPUT_SUMMARY"
echo "" >> "$OUTPUT_SUMMARY"
echo "## ファイル別エラー数" >> "$OUTPUT_SUMMARY"

# ファイルごとのエラーをカウント
grep -oE "^[^ ]+ *\([0-9]+,[0-9]+\)" "$ERROR_FILE" | sed 's/([0-9]*,[0-9]*)//g' | sort | uniq -c | sort -nr > "${OUTPUT_DIR}/files_with_errors.txt"

# サマリーファイルに追加
cat "${OUTPUT_DIR}/files_with_errors.txt" | while read -r LINE; do
  COUNT=$(echo "$LINE" | awk '{print $1}')
  FILE=$(echo "$LINE" | awk '{$1=""; print $0}' | sed 's/^ *//')
  printf "%6d  %s\n" "$COUNT" "$FILE" >> "$OUTPUT_SUMMARY"
done

echo "" >> "$OUTPUT_SUMMARY"
echo "## エラーコード別の集計" >> "$OUTPUT_SUMMARY"

# エラーコード別にカウント
grep -o "error TS[0-9]*:" "$ERROR_FILE" | sort | uniq -c | sort -nr > "${OUTPUT_DIR}/error_types.txt"

# サマリーファイルに追加
cat "${OUTPUT_DIR}/error_types.txt" | while read -r LINE; do
  COUNT=$(echo "$LINE" | awk '{print $1}')
  ERROR_TYPE=$(echo "$LINE" | awk '{print $3}' | tr -d ':')
  printf "%6d  %s\n" "$COUNT" "$ERROR_TYPE" >> "$OUTPUT_SUMMARY"
done

echo "✓ エラーサマリーを $OUTPUT_SUMMARY に保存しました"
echo "✓ 各エラーは ${ERRORS_DIR}/ に個別ファイルとして保存されています"
echo "🎉 処理が完了しました！"
