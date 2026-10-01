import type { LogicSpec, Procedure } from "./procedureModel";

// 詳細設計モードのデモページ(/detailed-design-demo)用の仮データ「備品予約システム」。
// 見本ページ(05・06 章)と同じ題材に、手順が複数あるときの見え方を確かめるため F-03・F-05 を足した。
// 分岐の行(isBranch)は action に条件、branch に結果を書く。

export const DEMO_PROCEDURES: Procedure[] = [
  {
    id: "F-01",
    name: "予約を登録する",
    trigger: "POST /api/v1/reservations",
    reason: "同じ備品への同時予約を行ロックで直列にする(並行制御)",
    steps: [
      { no: "1", from: "利用者", to: "routes/reservations", call: "create_reservation", data: "予約リクエスト", action: "本文を型で検証し、認証済みの利用者を取り出す", result: "ReservationCreate", db: "—", branch: "1a へ" },
      { no: "1a", from: "", to: "", data: "", action: "本文の型が不正", result: "", db: "", branch: "422(共通エラー形式)", isBranch: true },
      { no: "2", from: "routes", to: "services/reservation_service", call: "ReservationService.create", data: "予約リクエスト、user_id", action: "開始 < 終了、開始が過去でないことを確かめる", result: "—", db: "—", branch: "2a へ", logic: "L-01" },
      { no: "2a", from: "", to: "", data: "", action: "期間が不正", result: "", db: "", branch: "InvalidPeriodError → 400", isBranch: true },
      { no: "3", from: "service", to: "repositories/equipment", call: "get_for_update", data: "equipment_id", action: "備品を行ロック付きで取得する(同じ備品への同時予約を直列にする)", result: "備品情報", db: "equipments R", branch: "3a へ" },
      { no: "3a", from: "", to: "", data: "", action: "備品が無い", result: "", db: "", branch: "EquipmentNotFoundError → 404", isBranch: true },
      { no: "4", from: "service", to: "repositories/reservation", call: "count_overlapping", data: "equipment_id, start_at, end_at", action: "期間が重なる予約の数を数える", result: "重なりの件数", db: "reservations R", branch: "—", logic: "L-02" },
      { no: "5", from: "service", to: "services/reservation_service", data: "stock、重なりの件数", action: "在庫数 − 重なりの件数 が 1 以上か確かめる", result: "—", db: "—", branch: "5a へ" },
      { no: "5a", from: "", to: "", data: "", action: "空きが無い", result: "", db: "", branch: "EquipmentUnavailableError → 409", isBranch: true },
      { no: "6", from: "service", to: "repositories/reservation", call: "create", data: "予約", action: "予約を追加して commit する(ロックはここで外れる)", result: "予約(id 採番済み)", db: "reservations C", branch: "—" },
      { no: "7", from: "routes", to: "利用者", data: "予約結果", action: "応答のスキーマに詰めて返す", result: "201 Created", db: "—", branch: "—" },
    ],
    note: "トランザクション: 手順 3〜6 が1つのトランザクション(サービス層だけが commit する)。",
  },
  {
    id: "F-03",
    name: "リマインドを送る",
    trigger: "バッチ 毎日 18:00",
    reason: "外部サービスへの送信と再試行、1件ずつの確定(部分失敗の扱い)",
    steps: [
      { no: "1", from: "スケジューラ", to: "batch/reminder", call: "run", data: "実行日時", action: "翌日 0:00〜24:00 の期間を求める", result: "from, to", db: "—", branch: "—" },
      { no: "2", from: "batch", to: "repositories/reservation", call: "list_to_remind", data: "from, to", action: "翌日開始で reminded_at が空の予約を、備品名・利用者のメールと結合して取得する", result: "通知対象の一覧", db: "reservations R, equipments R, users R", branch: "2a へ" },
      { no: "2a", from: "", to: "", data: "", action: "対象が0件", result: "", db: "", branch: "件数をログに出して終了", isBranch: true },
      { no: "3", from: "batch", to: "batch/reminder", data: "通知対象の一覧", action: "1件ずつ手順 4・5 を繰り返す", result: "—", db: "—", branch: "—" },
      { no: "4", from: "batch", to: "clients/notifier", call: "send", data: "リマインド通知", action: "メール API へ送る。一時的な失敗は再試行する", result: "—", db: "—", branch: "4a へ", logic: "L-03" },
      { no: "4a", from: "", to: "", data: "", action: "再試行しても送れない", result: "", db: "", branch: "その予約は記録せずログに出し、次の予約へ", isBranch: true },
      { no: "5", from: "batch", to: "repositories/reservation", call: "mark_reminded", data: "reservation_id, reminded_at", action: "送れた予約だけ送信日時を記録し、1件ずつ commit する", result: "—", db: "reservations U", branch: "—" },
      { no: "6", from: "batch", to: "batch/reminder", data: "送信件数、失敗件数", action: "結果をログに出す", result: "—", db: "—", branch: "—" },
    ],
    note: "トランザクション: 手順 5 を予約1件ごとに確定する(途中で止まっても、送った分は二重送信しない)。",
  },
  {
    id: "F-05",
    name: "予約の期間を変更する",
    trigger: "PATCH /api/v1/reservations/{id}",
    reason: "F-01 と同じ在庫確認を、自分の予約を除いて行う",
    steps: [
      { no: "1", from: "利用者", to: "routes/reservations", call: "update_reservation", data: "期間の変更リクエスト", action: "本文を型で検証し、認証済みの利用者を取り出す", result: "ReservationUpdate", db: "—", branch: "1a へ" },
      { no: "1a", from: "", to: "", data: "", action: "本文の型が不正", result: "", db: "", branch: "422(共通エラー形式)", isBranch: true },
      { no: "2", from: "routes", to: "services/reservation_service", call: "ReservationService.change_period", data: "reservation_id、新しい期間、user_id", action: "新しい期間が正しいか確かめる", result: "—", db: "—", branch: "2a へ" },
      { no: "2a", from: "", to: "", data: "", action: "期間が不正", result: "", db: "", branch: "InvalidPeriodError → 400", isBranch: true },
      { no: "3", from: "service", to: "repositories/reservation", call: "get", data: "reservation_id", action: "予約を取得し、本人の予約か確かめる", result: "予約", db: "reservations R", branch: "3a へ" },
      { no: "3a", from: "", to: "", data: "", action: "予約が無い、または他人の予約", result: "", db: "", branch: "ReservationNotFoundError → 404", isBranch: true },
      { no: "4", from: "service", to: "repositories/equipment", call: "get_for_update", data: "equipment_id", action: "備品を行ロック付きで取得する", result: "備品情報", db: "equipments R", branch: "—" },
      { no: "5", from: "service", to: "repositories/reservation", call: "count_overlapping", data: "equipment_id、新しい期間、exclude_id", action: "自分の予約を除いて、期間が重なる予約の数を数える", result: "重なりの件数", db: "reservations R", branch: "—", logic: "L-02" },
      { no: "6", from: "service", to: "services/reservation_service", data: "stock、重なりの件数", action: "在庫数 − 重なりの件数 が 1 以上か確かめる", result: "—", db: "—", branch: "6a へ" },
      { no: "6a", from: "", to: "", data: "", action: "空きが無い", result: "", db: "", branch: "EquipmentUnavailableError → 409", isBranch: true },
      { no: "7", from: "service", to: "repositories/reservation", call: "update_period", data: "予約、新しい期間", action: "期間を更新して commit する", result: "予約", db: "reservations U", branch: "—" },
      { no: "8", from: "routes", to: "利用者", data: "予約結果", action: "応答のスキーマに詰めて返す", result: "200 OK", db: "—", branch: "—" },
    ],
    note: "トランザクション: 手順 3〜7 が1つのトランザクション。",
  },
];

export const DEMO_LOGICS: LogicSpec[] = [
  {
    id: "L-01",
    fn: "ReservationService.create",
    module: "app/services/reservation_service.py",
    signature: "async def create(self, *, user_id: UUID, payload: ReservationCreate) -> Reservation",
    args: "user_id: 認証済みの利用者 / payload: 予約リクエスト",
    returns: "保存済みの予約(id 採番済み、commit 後に refresh 済み)",
    raises: "InvalidPeriodError(400)、EquipmentNotFoundError(404)、EquipmentUnavailableError(409)",
    pre: "利用者は有効。セッションはトランザクションを開始していない",
    post: "成功時は予約が1件増え、同じ備品の重なる予約の数が在庫数以下に保たれる",
    pseudo: [
      { text: "期間を確かめる", sub: ["開始 ≥ 終了、または開始が現在より前なら InvalidPeriodError"] },
      { text: "備品を行ロック付きで取得する", sub: ["無ければ EquipmentNotFoundError"] },
      { text: "重なる予約の数を数える(L-02)" },
      { text: "在庫数 − 重なりの件数 ≤ 0 なら EquipmentUnavailableError" },
      { text: "予約を追加して flush、commit、refresh して返す" },
    ],
  },
  {
    id: "L-02",
    fn: "ReservationRepository.count_overlapping",
    module: "app/repositories/reservation.py",
    signature:
      "async def count_overlapping(self, *, equipment_id: UUID, start_at: datetime, end_at: datetime, exclude_id: UUID | None = None) -> int",
    args: "equipment_id: 対象の備品 / start_at, end_at: 調べる期間 / exclude_id: 数から除く予約(期間の変更で自分を除く)",
    returns: "期間が重なる予約の件数",
    raises: "なし",
    pre: "呼び出し元が備品の行ロックを取っている(取らないと数えた後に他の予約が入る)",
    post: "DB を変えない",
    pseudo: [
      { text: "同じ備品の予約を対象にする" },
      { text: "期間は半開区間で比べる", sub: ["重なる条件: start_at < 相手の end_at かつ end_at > 相手の start_at", "終了と開始がちょうど同じ時刻なら重ならない"] },
      { text: "exclude_id があれば、その予約を除く" },
      { text: "件数を返す(索引 (equipment_id, start_at) を使う)" },
    ],
  },
  {
    id: "L-03",
    fn: "Notifier.send",
    module: "app/clients/notifier.py",
    signature: "async def send(self, notice: ReminderNotice) -> None",
    args: "notice: 宛先のメール、備品名、開始日時",
    returns: "なし(送れたら戻る)",
    raises: "NotifierPermanentError(宛先不正など、再試行しても無駄なもの)、NotifierUnavailableError(再試行しても送れない)",
    pre: "API キーが設定されている",
    post: "送れたときだけ正常に戻る",
    pseudo: [
      { text: "メール API へ送る" },
      { text: "失敗したら種類で分ける", sub: ["429・5xx・タイムアウトは一時的な失敗。1秒・2秒・4秒待って、最大3回まで再試行", "それ以外の 4xx は NotifierPermanentError(再試行しない)"] },
      { text: "3回再試行しても送れなければ NotifierUnavailableError" },
    ],
  },
];
