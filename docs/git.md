# Git 使用规范

## 一、Commit Message 规范

### 1.1 格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

- **type**（必填）：提交类型
- **scope**（可选）：影响范围
- **subject**（必填）：简短描述
- **body**（可选）：详细描述
- **footer**（可选）：不兼容变动、关闭 Issue 等

### 1.2 Type 类型说明

| 标识       | 含义                     | 示例                                |
| :--------- | :----------------------- | :---------------------------------- |
| `feat`     | 新功能                   | `feat: add user login`              |
| `fix`      | 修复 bug                 | `fix: resolve null pointer error`   |
| `docs`     | 文档变更                 | `docs: update README`               |
| `style`    | 代码格式（不影响功能）   | `style: format code with prettier`  |
| `refactor` | 重构（非新功能、非修复） | `refactor: simplify config loading` |
| `perf`     | 性能优化                 | `perf: optimize database query`     |
| `test`     | 测试相关                 | `test: add unit tests for auth`     |
| `build`    | 构建系统/依赖            | `build: update dependencies`        |
| `ci`       | CI/CD 配置               | `ci: add github actions`            |
| `chore`    | 其他不修改源码的变更     | `chore: update .gitignore`          |
| `revert`   | 回滚提交                 | `revert: feat: add login`           |

### 1.3 Subject 规则

- 不超过 50 个字符
- 使用祈使句（动词开头，如 `add`、`fix`、`update`）
- 首字母小写
- 结尾不加句号

### 1.4 示例

```bash
# 正确示例
feat(auth): add JWT token refresh mechanism
fix(ui): resolve button alignment on mobile devices
docs: add API documentation for user endpoints
refactor(db): simplify connection pool configuration

# 错误示例
update code
fixed the bug
Add new feature.
```

---

## 二、分支管理规范

### 2.1 分支命名

| 分支类型   | 命名格式            | 示例                       |
| :--------- | :------------------ | :------------------------- |
| 主分支     | `main` / `master`   | `main`                     |
| 开发分支   | `develop`           | `develop`                  |
| 功能分支   | `feat/<功能名>`     | `feat/user-authentication` |
| 修复分支   | `fix/<问题名>`      | `fix/login-validation`     |
| 热修复分支 | `hotfix/<问题名>`   | `hotfix/critical-security` |
| 重构分支   | `refactor/<模块名>` | `refactor/database-layer`  |
| 文档分支   | `docs/<文档名>`     | `docs/api-reference`       |
| 发布分支   | `release/<版本号>`  | `release/v1.2.0`           |

### 2.2 分支使用规则

1. **main 分支**：仅用于生产环境发布，禁止直接提交
2. **develop 分支**：日常开发集成分支，禁止直接提交，必须通过 PR/MR 合并
3. **功能分支**：从 `develop` 拉取，开发完成后合并回 `develop`
4. **hotfix 分支**：从 `main` 拉取，修复后同时合并到 `main` 和 `develop`
5. **及时清理**：功能合并后及时删除远程分支

---

## 三、提交规范

### 3.1 提交频率

- 每完成一个逻辑单元就提交一次
- 不要累积大量改动后一次性提交
- 单次提交改动文件不宜过多（建议 < 10 个文件）

### 3.2 提交前检查

```bash
# 1. 查看改动
git status
git diff

# 2. 运行 lint 和测试
npm run lint
npm run test

# 3. 确认无误后提交
git add .
git commit -m "feat: your message"
```

### 3.3 禁止行为

- 禁止提交敏感信息（密码、密钥、Token 等）
- 禁止提交本地配置文件（`.env.local`、`config.local.js` 等）
- 禁止提交大文件（> 10MB）
- 禁止提交 `node_modules`、`.next`、`dist` 等构建产物
- 禁止使用 `git push --force` 推送到共享分支

---

## 四、常用命令

### 4.1 日常操作

```bash
# 拉取最新代码
git pull origin develop

# 创建并切换分支
git checkout -b feat/feature-name

# 查看提交历史
git log --oneline --graph

# 查看某个文件的历史
git log -p -- <file>

# 暂存当前改动
git stash
git stash pop
```

### 4.2 撤销操作

```bash
# 撤销工作区改动
git checkout -- <file>

# 撤销暂存区文件
git reset HEAD <file>

# 撤销最后一次提交（保留改动）
git reset --soft HEAD~1

# 撤销最后一次提交（丢弃改动）
git reset --hard HEAD~1
```

### 4.3 合并与变基

```bash
# 合并分支
git merge <branch>

# 变基（保持线性历史）
git rebase develop

# 交互式变基（整理提交历史）
git rebase -i HEAD~3
```

---

## 五、.gitignore 规范

### 5.1 必须忽略的内容

```
# 依赖
node_modules/
.pnp/

# 构建产物
dist/
build/
.next/
out/

# 环境变量
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# 系统文件
.DS_Store
Thumbs.db

# 日志
*.log
npm-debug.log*

# 测试覆盖率
coverage/
.nyc_output/
```

### 5.2 规则

- 项目根目录必须包含 `.gitignore` 文件
- 不要提交已经被 Git 跟踪但后来加入 `.gitignore` 的文件（需先用 `git rm --cached` 移除）

---

## 六、协作规范

### 6.1 Pull Request 规范

1. PR 标题使用与 commit message 相同的格式
2. PR 描述需包含：
   - 改动目的
   - 主要改动内容
   - 测试情况
   - 相关 Issue 链接
3. 至少需要 1 人 Review 后才能合并
4. 合并前确保 CI 全部通过

### 6.2 冲突解决

```bash
# 1. 拉取最新 develop
git checkout develop
git pull origin develop

# 2. 切回功能分支并合并
git checkout feat/your-feature
git merge develop

# 3. 解决冲突后提交
git add .
git commit -m "fix: resolve merge conflicts with develop"
```

### 6.3 版本标签

```bash
# 创建标签
git tag -a v1.0.0 -m "Release v1.0.0"

# 推送标签
git push origin v1.0.0

# 查看所有标签
git tag -l
```
