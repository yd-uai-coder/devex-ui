"use client";

import { useEffect, useState } from "react";
import { Button, TextArea, Text, XStack, YStack } from "tamagui";
import { ChoiceCards } from "@/features/hearing/components/ChoiceCards";
import { MessageBubble } from "@/features/hearing/components/MessageBubble";
import { latestAiMessage, pendingAnswers } from "@/features/hearing/cards";
import { HearingCompletionBanner } from "@/features/hearing/components/HearingCompletionBanner";
import { useHearingStore } from "@/features/hearing/hearing-store";
import type { HearingCard } from "@/features/hearing/api/hearingApi";
import { ApiError } from "@/lib/api/client";

// 最新の AI の発言のカード。選択中の状態はここだけがストアから読む(選ぶたびにチャット全体を
// 描き直さないため。描き直すと、発言ごとの Markdown の解析で色が付くのが遅くなる)
function LatestChoiceCards({
  cards,
  onSend,
  disabled,
}: {
  cards: HearingCard[];
  onSend: (cardId: string) => void;
  disabled: boolean;
}) {
  const cardDrafts = useHearingStore((s) => s.cardDrafts);
  const selectCardOption = useHearingStore((s) => s.selectCardOption);
  return (
    <ChoiceCards
      cards={cards}
      drafts={cardDrafts}
      onSelect={selectCardOption}
      onSend={onSend}
      disabled={disabled}
    />
  );
}

const NO_DRAFTS: Record<string, number> = {};

export function ChatPanel({ projectId }: { projectId: string }) {
  const messages = useHearingStore((s) => s.messages);
  const streamingReply = useHearingStore((s) => s.streamingReply);
  const sending = useHearingStore((s) => s.sending);
  const connectionLost = useHearingStore((s) => s.connectionLost);
  const streamError = useHearingStore((s) => s.streamError);
  const completion = useHearingStore((s) => s.completion);
  const generationTriggered = useHearingStore((s) => s.generationTriggered);
  const loadHistory = useHearingStore((s) => s.loadHistory);
  const sendMessage = useHearingStore((s) => s.sendMessage);
  const approveAndGenerate = useHearingStore((s) => s.approveAndGenerate);
  const dismissConnectionLost = useHearingStore((s) => s.dismissConnectionLost);
  const points = useHearingStore((s) => s.points);

  const [draft, setDraft] = useState("");
  const [approving, setApproving] = useState(false);
  const [approveError, setApproveError] = useState<string | null>(null);

  useEffect(() => {
    void loadHistory(projectId);
  }, [projectId, loadHistory]);

  // 選べるのは最新の AI の発言のカードだけ。カードを選んでいれば、文が空でも送れる
  const latestAi = latestAiMessage(messages);
  // 件数だけを購読する(件数が変わったときだけ描き直す)
  const selectedCount = useHearingStore(
    (s) => pendingAnswers(latestAiMessage(s.messages)?.cards ?? [], s.cardDrafts).length,
  );
  const canSend = !sending && !generationTriggered && (draft.trim().length > 0 || selectedCount > 0);

  function handleSend() {
    const text = draft.trim();
    if (!canSend) return;
    setDraft("");
    void sendMessage(projectId, text);
  }

  // 必須がそろった後に、バナーに並べる未決の任意の観点(観点の表から)
  const optionalPoints = points?.points.filter((p) => !p.required && p.status === "open") ?? [];

  // バナーの「任意項目についてヒアリングを続ける」。返信に任意の観点のカードが付く
  function handleContinueOptional() {
    if (sending || generationTriggered) return;
    // 文は送らない(サーバーが決まった文を利用者の発言として残し、判定の LLM は呼ばない)
    void sendMessage(projectId, "", { continueOptional: true });
  }

  // カードごとの「この回答を送る」。入力欄の文も一緒に送る
  function handleSendCard(cardId: string) {
    if (sending || generationTriggered) return;
    const text = draft.trim();
    setDraft("");
    void sendMessage(projectId, text, { cardIds: [cardId] });
  }

  async function handleApprove() {
    // 二度押しの防止(ボタンも approving の間は無効にする)
    if (approving) return;
    setApproveError(null);
    setApproving(true);
    try {
      await approveAndGenerate(projectId);
    } catch (err) {
      setApproveError(err instanceof ApiError ? err.message : "設計書の生成開始に失敗しました");
    } finally {
      setApproving(false);
    }
  }

  return (
    <YStack gap="$4">
      {connectionLost ? (
        <XStack
          role="alert"
          aria-live="polite"
          justifyContent="space-between"
          alignItems="center"
          gap="$3"
          padding="$3"
          borderRadius="$4"
          backgroundColor="$red2"
        >
          <Text color="$color9">接続が切れました。直前のメッセージが保存されていない可能性があります。</Text>
          <Button size="$2" onPress={dismissConnectionLost}>
            閉じる
          </Button>
        </XStack>
      ) : null}
      {streamError ? (
        <XStack
          role="alert"
          aria-live="polite"
          justifyContent="space-between"
          alignItems="center"
          gap="$3"
          padding="$3"
          borderRadius="$4"
          backgroundColor="$red2"
        >
          <Text color="$color9">
            {streamError} 送信したメッセージは保存されていません。もう一度送信してください。
          </Text>
          <Button size="$2" onPress={dismissConnectionLost}>
            閉じる
          </Button>
        </XStack>
      ) : null}

      <YStack gap="$3">
        {/* sender='attachment'(添付ファイル抽出結果)・sender='others'(生成後の自己診断結果)は
            ヒアリング・ドキュメント生成のLLMコンテキスト/記録としては使うが、チャット画面には
            表示しない(添付ファイル名自体は最初のintake要約バブルに表示される。自己診断結果は
            チャットに戻った際に毎回再表示されると煩雑なため、ドキュメントプレビュー画面側で
            確認する設計に統一する)。 */}
        {messages
          .filter((message) => message.sender !== "attachment" && message.sender !== "others")
          .map((message) => (
            <YStack key={message.id} gap="$2">
              <MessageBubble message={message} />
              {message.cards && message.cards.length > 0 ? (
                message === latestAi ? (
                  <LatestChoiceCards
                    cards={message.cards}
                    onSend={handleSendCard}
                    disabled={sending || generationTriggered}
                  />
                ) : (
                  <ChoiceCards cards={message.cards} drafts={NO_DRAFTS} />
                )
              ) : null}
            </YStack>
          ))}
        {streamingReply ? (
          <MessageBubble
            message={{ id: "streaming", sender: "ai", message: streamingReply, created_at: "" }}
          />
        ) : null}
      </YStack>

      {completion && !generationTriggered ? (
        <HearingCompletionBanner
          completion={completion}
          onApprove={handleApprove}
          approving={approving}
          optionalPoints={optionalPoints}
          onContinueOptional={handleContinueOptional}
          sending={sending}
        />
      ) : null}
      {approveError ? (
        <Text role="alert" color="$color9" fontSize="$2">
          {approveError}
        </Text>
      ) : null}

      <YStack gap="$2">
        <TextArea
          value={draft}
          onChangeText={setDraft}
          placeholder="メッセージを入力"
          disabled={sending || generationTriggered}
        />
        <Button onPress={handleSend} disabled={!canSend}>
          {sending ? "送信中..." : selectedCount > 0 ? `送信(カード ${selectedCount} 件の選択を含む)` : "送信"}
        </Button>
      </YStack>
    </YStack>
  );
}
