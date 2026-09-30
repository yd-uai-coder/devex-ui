import type { LayoutModel, NotationType, SemanticModel } from "@/features/uml/api/types";

// UML デモページ(/uml-demo)用の固定データ。バックエンド無しで画面を確かめるためのもの。
// layout_model は devex-api のレイアウトエンジン(app/uml/layout、Phase 9)を実際に実行した出力を
// そのまま埋め込んでいる(直交辺の折れ点つき。Phase 12 からは辺ラベルの位置 label_pos も含む)。
// 意味モデルを変えたときは、devex-api/backend で SemanticModelAdapter.validate_python(モデル) と
// edge_labels(モデル, データ項目名) を app.uml.layout.compute_layout に渡し、出力の
// model_dump(mode="json") で置き換える(座標を手で書き換えない)。demoExports.ts も同じ出力から作り直す。
export const DEMO_MODELS: Record<
  NotationType,
  { semantic_model: SemanticModel; layout_model: LayoutModel }
> = {
  "component": {
    "semantic_model": {
      "notation": "component",
      "elements": [
        {
          "id": "c1",
          "name": "認証ルート",
          "kind": "module",
          "description": "ログイン・トークン更新",
          "layer": "API層"
        },
        {
          "id": "c2",
          "name": "プロジェクトルート",
          "kind": "module",
          "description": "プロジェクトCRUD",
          "layer": "API層"
        },
        {
          "id": "c3",
          "name": "認証サービス",
          "kind": "module",
          "description": "パスワード照合・JWT発行",
          "layer": "Service層"
        },
        {
          "id": "c4",
          "name": "プロジェクトサービス",
          "kind": "module",
          "description": "所有権の確認",
          "layer": "Service層"
        },
        {
          "id": "c5",
          "name": "ユーザーリポジトリ",
          "kind": "module",
          "description": null,
          "layer": "Repository層"
        },
        {
          "id": "c6",
          "name": "プロジェクトリポジトリ",
          "kind": "module",
          "description": null,
          "layer": "Repository層"
        }
      ],
      "relations": [
        {
          "id": "r1",
          "source_id": "c1",
          "target_id": "c3",
          "relation_type": "depends_on"
        },
        {
          "id": "r2",
          "source_id": "c2",
          "target_id": "c4",
          "relation_type": "depends_on"
        },
        {
          "id": "r3",
          "source_id": "c3",
          "target_id": "c5",
          "relation_type": "depends_on"
        },
        {
          "id": "r4",
          "source_id": "c4",
          "target_id": "c6",
          "relation_type": "depends_on"
        },
        {
          "id": "r5",
          "source_id": "c4",
          "target_id": "c5",
          "relation_type": "depends_on"
        }
      ]
    },
    "layout_model": {
      "width": 960.0,
      "height": 504.0,
      "nodes": {
        "c1": {
          "x": 115.91666666666666,
          "y": 88.0,
          "w": 101.5,
          "h": 38.0,
          "lane": 0,
          "row": 0
        },
        "c2": {
          "x": 86.51666666666665,
          "y": 172.0,
          "w": 160.3,
          "h": 38.0,
          "lane": 0,
          "row": 1
        },
        "c3": {
          "x": 421.9,
          "y": 340.0,
          "w": 116.2,
          "h": 38.0,
          "lane": 1,
          "row": 3
        },
        "c4": {
          "x": 392.5,
          "y": 256.0,
          "w": 175.0,
          "h": 38.0,
          "lane": 1,
          "row": 2
        },
        "c5": {
          "x": 713.1833333333333,
          "y": 340.0,
          "w": 160.3,
          "h": 38.0,
          "lane": 2,
          "row": 3
        },
        "c6": {
          "x": 698.4833333333332,
          "y": 424.0,
          "w": 189.70000000000002,
          "h": 38.0,
          "lane": 2,
          "row": 4
        }
      },
      "edges": {
        "r1": {
          "points": [
            [
              217.42,
              107.0
            ],
            [
              323.33,
              107.0
            ],
            [
              323.33,
              359.0
            ],
            [
              421.9,
              359.0
            ]
          ],
          "label_pos": null
        },
        "r2": {
          "points": [
            [
              86.52,
              191.0
            ],
            [
              72.52,
              191.0
            ],
            [
              72.52,
              66.0
            ],
            [
              378.5,
              66.0
            ],
            [
              378.5,
              275.0
            ],
            [
              392.5,
              275.0
            ]
          ],
          "label_pos": null
        },
        "r3": {
          "points": [
            [
              538.1,
              359.0
            ],
            [
              625.64,
              359.0
            ],
            [
              625.64,
              368.0
            ],
            [
              713.18,
              368.0
            ]
          ],
          "label_pos": null
        },
        "r4": {
          "points": [
            [
              567.5,
              266.0
            ],
            [
              902.18,
              266.0
            ],
            [
              902.18,
              443.0
            ],
            [
              888.18,
              443.0
            ]
          ],
          "label_pos": null
        },
        "r5": {
          "points": [
            [
              567.5,
              284.0
            ],
            [
              699.18,
              284.0
            ],
            [
              699.18,
              350.0
            ],
            [
              713.18,
              350.0
            ]
          ],
          "label_pos": null
        }
      },
      "metrics": {
        "crossings": 0,
        "overlaps": 0,
        "collisions": 0
      }
    }
  },
  "er": {
    "semantic_model": {
      "notation": "er",
      "elements": [
        {
          "id": "t1",
          "name": "users",
          "kind": "table",
          "columns": [
            {
              "name": "id",
              "type": "uuid",
              "is_primary_key": true,
              "is_foreign_key": false,
              "nullable": false
            },
            {
              "name": "email",
              "type": "varchar(255)",
              "is_primary_key": false,
              "is_foreign_key": false,
              "nullable": false
            },
            {
              "name": "hashed_password",
              "type": "varchar(255)",
              "is_primary_key": false,
              "is_foreign_key": false,
              "nullable": false
            }
          ]
        },
        {
          "id": "t2",
          "name": "projects",
          "kind": "table",
          "columns": [
            {
              "name": "id",
              "type": "uuid",
              "is_primary_key": true,
              "is_foreign_key": false,
              "nullable": false
            },
            {
              "name": "user_id",
              "type": "uuid",
              "is_primary_key": false,
              "is_foreign_key": true,
              "nullable": false
            },
            {
              "name": "title",
              "type": "varchar(255)",
              "is_primary_key": false,
              "is_foreign_key": false,
              "nullable": false
            }
          ]
        },
        {
          "id": "t3",
          "name": "chat_histories",
          "kind": "table",
          "columns": [
            {
              "name": "id",
              "type": "uuid",
              "is_primary_key": true,
              "is_foreign_key": false,
              "nullable": false
            },
            {
              "name": "project_id",
              "type": "uuid",
              "is_primary_key": false,
              "is_foreign_key": true,
              "nullable": false
            },
            {
              "name": "content",
              "type": "text",
              "is_primary_key": false,
              "is_foreign_key": false,
              "nullable": false
            }
          ]
        },
        {
          "id": "t4",
          "name": "generated_documents",
          "kind": "table",
          "columns": [
            {
              "name": "id",
              "type": "uuid",
              "is_primary_key": true,
              "is_foreign_key": false,
              "nullable": false
            },
            {
              "name": "project_id",
              "type": "uuid",
              "is_primary_key": false,
              "is_foreign_key": true,
              "nullable": false
            },
            {
              "name": "doc_type",
              "type": "varchar(50)",
              "is_primary_key": false,
              "is_foreign_key": false,
              "nullable": false
            },
            {
              "name": "version",
              "type": "integer",
              "is_primary_key": false,
              "is_foreign_key": false,
              "nullable": false
            }
          ]
        }
      ],
      "relations": [
        {
          "id": "r1",
          "source_id": "t1",
          "target_id": "t2",
          "relation_type": "one_to_many"
        },
        {
          "id": "r2",
          "source_id": "t2",
          "target_id": "t3",
          "relation_type": "one_to_many"
        },
        {
          "id": "r3",
          "source_id": "t2",
          "target_id": "t4",
          "relation_type": "one_to_many"
        }
      ]
    },
    "layout_model": {
      "width": 340.0,
      "height": 700.0,
      "nodes": {
        "t1": {
          "x": 33.54899999999998,
          "y": 84.0,
          "w": 272.90200000000004,
          "h": 104.0,
          "lane": 0,
          "row": 0
        },
        "t2": {
          "x": 76.47299999999998,
          "y": 234.0,
          "w": 187.05400000000003,
          "h": 104.0,
          "lane": 0,
          "row": 1
        },
        "t3": {
          "x": 77.79599999999999,
          "y": 384.0,
          "w": 184.40800000000002,
          "h": 104.0,
          "lane": 0,
          "row": 2
        },
        "t4": {
          "x": 69.26999999999998,
          "y": 534.0,
          "w": 201.46000000000004,
          "h": 124.0,
          "lane": 0,
          "row": 3
        }
      },
      "edges": {
        "r1": {
          "points": [
            [
              170.0,
              188.0
            ],
            [
              170.0,
              234.0
            ]
          ],
          "label_pos": [
            193.936,
            211.0
          ]
        },
        "r2": {
          "points": [
            [
              170.0,
              338.0
            ],
            [
              170.0,
              384.0
            ]
          ],
          "label_pos": [
            193.936,
            361.0
          ]
        },
        "r3": {
          "points": [
            [
              263.53,
              286.0
            ],
            [
              277.53,
              286.0
            ],
            [
              277.53,
              596.0
            ],
            [
              270.73,
              596.0
            ]
          ],
          "label_pos": [
            301.46599999999995,
            441.0
          ]
        }
      },
      "metrics": {
        "crossings": 0,
        "overlaps": 0,
        "collisions": 0
      }
    }
  },
  "dfd": {
    "semantic_model": {
      "notation": "dfd",
      "elements": [
        {
          "id": "e1",
          "name": "利用者",
          "element_type": "external_entity"
        },
        {
          "id": "p1",
          "name": "資格情報の検証",
          "element_type": "process",
          "description": "メールでユーザーを引きパスワードを照合",
          "layer": "認証"
        },
        {
          "id": "p2",
          "name": "トークン発行",
          "element_type": "process",
          "description": "JWTを署名して返す",
          "layer": "発行"
        },
        {
          "id": "s1",
          "name": "users",
          "element_type": "data_store"
        }
      ],
      "relations": [
        {
          "id": "f1",
          "source_id": "e1",
          "target_id": "p1",
          "data_item_id": "11111111-1111-4111-8111-111111111111"
        },
        {
          "id": "f2",
          "source_id": "s1",
          "target_id": "p1",
          "data_item_id": "33333333-3333-4333-8333-333333333333"
        },
        {
          "id": "f3",
          "source_id": "p1",
          "target_id": "p2",
          "data_item_id": "33333333-3333-4333-8333-333333333333"
        },
        {
          "id": "f4",
          "source_id": "p2",
          "target_id": "e1",
          "data_item_id": "22222222-2222-4222-8222-222222222222"
        }
      ]
    },
    "layout_model": {
      "width": 960.0,
      "height": 426.0,
      "nodes": {
        "e1": {
          "x": 745.3333333333333,
          "y": 84.0,
          "w": 96.0,
          "h": 38.0,
          "lane": 2,
          "row": 0
        },
        "p1": {
          "x": 101.21666666666665,
          "y": 262.0,
          "w": 130.9,
          "h": 38.0,
          "lane": 0,
          "row": 2
        },
        "p2": {
          "x": 421.9,
          "y": 346.0,
          "w": 116.2,
          "h": 38.0,
          "lane": 1,
          "row": 3
        },
        "s1": {
          "x": 745.3333333333333,
          "y": 168.0,
          "w": 96.0,
          "h": 48.0,
          "lane": 2,
          "row": 1
        }
      },
      "edges": {
        "f1": {
          "points": [
            [
              745.33,
              103.0
            ],
            [
              246.12,
              103.0
            ],
            [
              246.12,
              272.0
            ],
            [
              232.12,
              272.0
            ]
          ],
          "label_pos": [
            495.725,
            90.0
          ]
        },
        "f2": {
          "points": [
            [
              793.33,
              216.0
            ],
            [
              793.33,
              281.0
            ],
            [
              232.12,
              281.0
            ]
          ],
          "label_pos": [
            512.725,
            268.0
          ]
        },
        "f3": {
          "points": [
            [
              232.12,
              290.0
            ],
            [
              480.0,
              290.0
            ],
            [
              480.0,
              346.0
            ]
          ],
          "label_pos": [
            356.06,
            303.0
          ]
        },
        "f4": {
          "points": [
            [
              538.1,
              365.0
            ],
            [
              855.33,
              365.0
            ],
            [
              855.33,
              103.0
            ],
            [
              841.33,
              103.0
            ]
          ],
          "label_pos": [
            696.715,
            352.0
          ]
        }
      },
      "metrics": {
        "crossings": 0,
        "overlaps": 0,
        "collisions": 0
      }
    }
  }
};
