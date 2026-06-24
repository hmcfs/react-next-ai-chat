app/api
├── login/ # sys_user 用户登录
│ └── route.ts
├── register/ # sys_user 用户注册
│ └── route.ts
├── user/ # 用户信息CRUD
│ ├── [id]/
│ │ └── route.ts # 查询/修改/删除单个用户
│ └── route.ts # 用户列表、基础信息
├── chat/
│ ├── session/ # chat_session 会话相关
│ │ ├── route.ts # 创建新会话、查询当前用户全部会话列表
│ │ └── [chatId]/
│ │ ├── route.ts # 获取单会话详情、修改标题、删除会话
│ │ └── message/ # chat_message 消息子路由（归属某个会话）
│ │ └── route.ts # 发送消息、分页查询该会话所有消息
│ └── stream/ # AI流式对话接口（独立流式输出，不和CRUD混放）
│ └── [chatId]/
│ └── route.ts
└── common/ # 可选：上传、全局工具接口
└── upload/
└── route.ts
