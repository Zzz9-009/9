---
name: commit-and-push-github
description: 将本项目的 Git 改动提交并推送到 GitHub 仓库 Zzz9-009/9，使用本机已配置的 SSH 公钥鉴权。用户要求提交、推送或同步本项目到 GitHub 时使用，不用于部署、创建 PR 或初始化无关仓库。
---

# Commit and Push to GitHub

固定远端仓库为 `https://github.com/Zzz9-009/9.git`。推送使用 SSH 公钥，默认使用 `git@github.com:Zzz9-009/9.git`；当 22 端口不可用时改用 SSH over 443：`ssh://git@ssh.github.com:443/Zzz9-009/9.git`。

本项目带有便携版 Git，`git` 不在 PATH 时使用 `.\Git\cmd\git.exe`，SSH 使用 `.\Git\usr\bin\ssh.exe`。

## 执行流程

### 1. 确认仓库与当前状态

在项目根目录运行：

```powershell
& ".\Git\cmd\git.exe" rev-parse --is-inside-work-tree
& ".\Git\cmd\git.exe" branch --show-current
& ".\Git\cmd\git.exe" status --short
```

- 未初始化时先执行 `git init`，保留当前默认分支，不擅自改名。
- 记录当前分支名，后续推送使用实际分支。

### 2. 配置远端

```powershell
& ".\Git\cmd\git.exe" remote -v
```

- 没有 `origin`：优先执行 `git remote add origin git@github.com:Zzz9-009/9.git`。
- `origin` 是给定仓库的 HTTPS 地址：改为 SSH 地址。
- 22 端口连接被拒绝时：执行 `git remote set-url origin ssh://git@ssh.github.com:443/Zzz9-009/9.git`。
- `origin` 指向其他仓库：停止操作，向用户确认后再修改，禁止擅自覆盖。

### 3. 验证 SSH 公钥

```powershell
& ".\Git\usr\bin\ssh.exe" -T git@github.com
& ".\Git\usr\bin\ssh.exe" -o StrictHostKeyChecking=accept-new -T -p 443 git@ssh.github.com
```

- 出现 `Hi <用户名>! You've successfully authenticated` 即表示公钥可用；该命令以退出码 1 结束时仍可视为成功。
- 22 端口被拒绝或超时但 443 端口认证成功时，远端必须使用第 2 步的 SSH over 443 地址。
- 认证失败时停止并报告缺少公钥或未添加到 GitHub，禁止读取、打印或提交私钥。

### 4. 审查改动

```powershell
git diff --stat
git diff
git status --short
```

- 逐项确认改动来源，排除与本次任务无关的文件。
- 严禁使用 `git add .`、`git add -A` 或 `git add -u`。
- 严禁暂存 `Git/`、`npm/`、`skils/`、`node_modules/`、`dist/`、日志、缓存、`.env` 或任何密钥文件。

### 5. 暂存明确文件

按实际改动逐项添加，例如：

```powershell
git add -- index.html starter-level1-0207王振旭.html starter-level2-0207王振旭.html wzx_prompt.md
```

再次执行 `git status --short`，确认暂存区只包含预期文件。

### 6. 创建提交

```powershell
git commit -m "type: 简要说明本次改动"
```

- 提交信息聚焦“为什么改”，使用 `feat`、`fix`、`docs`、`chore` 等前缀。
- 禁止 `--amend`、`--no-verify`，除非用户明确要求。
- 无改动可提交时不要创建空提交。

### 7. 推送到 GitHub

首次推送：

```powershell
git push -u origin HEAD
```

后续推送：

```powershell
git push
```

- 禁止 `git push --force` 或 `--force-with-lease` 到 `main`、`master`。
- 遇到 non-fast-forward 拒绝时停止，报告远端有新提交；未经用户同意不得执行 `git pull`、`rebase` 或任何可能覆盖本地改动的操作。
- 推送成功后执行 `git status` 与 `git log -1 --oneline` 核对结果。

### 8. 汇报

输出：分支名、提交哈希与提交信息、远端地址、推送结果。认证失败或推送被拒时如实报告原因，不声称成功。

## 安全约束

- 不提交私钥、令牌、账号密码或 `.env`。
- 不修改 Git 全局配置。
- 不删除分支、不重置历史、不做破坏性操作。
- 远端仓库不一致或 SSH 认证失败时，先停止并与用户确认。
