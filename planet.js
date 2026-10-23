(() => {
    const MAX_LEVEL = 20;
    const PROGRESS_KEY = "planetProgress";
    const readProgress = () => {
        const saved = Number.parseInt(localStorage.getItem(PROGRESS_KEY) || "1", 10);
        return Number.isFinite(saved) ? Math.max(1, Math.min(MAX_LEVEL, saved)) : 1;
    };
    const shuffle = (items) => {
        for (let index = items.length - 1; index > 0; index -= 1) {
            const other = Math.floor(Math.random() * (index + 1));
            [items[index], items[other]] = [items[other], items[index]];
        }
        return items;
    };

    const toast = (message) => {
        let node = document.querySelector(".toast");
        if (!node) {
            node = document.createElement("div");
            node.className = "toast";
            node.setAttribute("role", "status");
            document.body.append(node);
        }
        node.textContent = message;
        node.classList.remove("hidden");
        window.clearTimeout(node.timer);
        node.timer = window.setTimeout(() => node.classList.add("hidden"), 1800);
    };

    document.querySelectorAll("[data-toast]").forEach((control) => {
        control.addEventListener("click", () => toast(control.dataset.toast));
    });

    const settingsPanel = document.querySelector("[data-settings-panel]");
    const menuPanel = document.querySelector("[data-menu-panel]");
    const profilePanel = document.querySelector("[data-profile-panel]");
    document.querySelector("[data-open-settings]")?.addEventListener("click", () => {
        menuPanel?.classList.add("hidden");
        settingsPanel?.classList.remove("hidden");
    });
    document.querySelector("[data-close-settings]")?.addEventListener("click", () => settingsPanel?.classList.add("hidden"));
    document.querySelector("[data-open-menu]")?.addEventListener("click", () => menuPanel?.classList.remove("hidden"));
    document.querySelector("[data-close-menu]")?.addEventListener("click", () => menuPanel?.classList.add("hidden"));
    document.querySelectorAll("[data-open-profile]").forEach((button) => {
        button.addEventListener("click", () => {
            menuPanel?.classList.add("hidden");
            profilePanel?.classList.remove("hidden");
        });
    });
    document.querySelector("[data-close-profile]")?.addEventListener("click", () => profilePanel?.classList.add("hidden"));
    const profileEditPanel = document.querySelector("[data-profile-edit-panel]");
    [settingsPanel, menuPanel, profilePanel, profileEditPanel].filter(Boolean).forEach((panel) => {
        panel.addEventListener("click", (event) => {
            if (event.target === panel) panel.classList.add("hidden");
        });
    });
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") [settingsPanel, menuPanel, profilePanel, profileEditPanel].filter(Boolean).forEach((panel) => panel.classList.add("hidden"));
    });
    const gameDate = document.querySelector("[data-game-date]");
    if (gameDate) {
        gameDate.textContent = new Intl.DateTimeFormat("zh-CN", { month: "long", day: "numeric" }).format(new Date());
    }

    document.querySelectorAll(".switch").forEach((control) => {
        if (control.disabled) return;
        control.setAttribute("aria-checked", localStorage.getItem(control.dataset.setting) === "true" ? "true" : "false");
        control.addEventListener("click", () => {
            const enabled = control.getAttribute("aria-checked") !== "true";
            control.setAttribute("aria-checked", String(enabled));
            localStorage.setItem(control.dataset.setting, String(enabled));
            if (control.dataset.setting === "planetNightMode") {
                document.querySelector(".home-screen")?.classList.toggle("night-mode", enabled);
            }
            toast(enabled ? "已开启" : "已关闭");
        });
    });
    if (localStorage.getItem("planetNightMode") === "true") document.querySelector(".home-screen")?.classList.add("night-mode");

    const wallet = Math.max(0, Number.parseInt(localStorage.getItem("planetCoins") || "286", 10) || 0);
    const ownedItems = (localStorage.getItem("planetOwnedItems") || "").split(",").filter(Boolean);
    const updateWallet = (amount) => {
        document.querySelectorAll("[data-wallet]").forEach((element) => { element.textContent = String(amount); });
        document.querySelectorAll("[data-profile-value='costumes']").forEach((element) => { element.textContent = `${3 + ownedItems.length} 羊`; });
    };
    updateWallet(wallet);
    document.querySelectorAll("[data-buy]").forEach((button) => {
        const item = button.dataset.buy;
        const price = Number.parseInt(button.dataset.price, 10);
        if (ownedItems.includes(item)) {
            button.disabled = true;
            button.textContent = "已拥有";
        }
        button.addEventListener("click", () => {
            if (!Number.isFinite(price) || price < 0) return toast("商品价格无效");
            if (ownedItems.includes(item)) return toast("这件装扮已经在收藏里啦");
            const currentWallet = Math.max(0, Number.parseInt(localStorage.getItem("planetCoins") || "286", 10) || 0);
            if (currentWallet < price) return toast("星球能量不足，先去完成每日任务吧");
            const nextWallet = currentWallet - price;
            ownedItems.push(item);
            localStorage.setItem("planetCoins", String(nextWallet));
            localStorage.setItem("planetOwnedItems", ownedItems.join(","));
            updateWallet(nextWallet);
            button.disabled = true;
            button.textContent = "已拥有";
            toast("兑换成功，装扮已加入收藏");
        });
    });

    const profileFields = ["gender", "region", "title", "name"];
    profileFields.forEach((field) => {
        const value = localStorage.getItem(`planetProfile-${field}`);
        const element = field === "name"
            ? document.querySelector("[data-profile-name]")
            : document.querySelector(`[data-profile-value="${field}"]`);
        if (value && element) element.textContent = value;
    });
    const profileEditForm = document.querySelector("[data-profile-edit-form]");
    const profileEditInput = document.querySelector("[data-profile-edit-input]");
    let profileEditField = "";
    document.querySelectorAll("[data-edit-profile]").forEach((button) => {
        button.addEventListener("click", () => {
            profileEditField = button.dataset.editProfile;
            const defaults = { gender: "未设置", region: "未设置", title: "星球新朋友", name: "星球牧羊人" };
            const labels = { gender: "性别", region: "地区", title: "称号", name: "牧羊人昵称" };
            const current = localStorage.getItem(`planetProfile-${profileEditField}`) || defaults[profileEditField];
            document.querySelector("[data-edit-field-label]").textContent = labels[profileEditField];
            profileEditInput.value = current === "未设置" ? "" : current;
            profileEditInput.placeholder = profileEditField === "gender" ? "例如：女 / 男 / 不公开" : `输入${labels[profileEditField]}`;
            profileEditInput.maxLength = profileEditField === "name" ? 16 : 20;
            profileEditPanel.classList.remove("hidden");
            profileEditInput.focus();
        });
    });
    document.querySelectorAll("[data-cancel-profile-edit]").forEach((button) => {
        button.addEventListener("click", () => profileEditPanel?.classList.add("hidden"));
    });
    profileEditForm?.addEventListener("submit", (event) => {
        event.preventDefault();
        const value = profileEditInput.value.trim();
        if (!value) return toast("内容不能为空");
        localStorage.setItem(`planetProfile-${profileEditField}`, value);
        const element = profileEditField === "name"
            ? document.querySelector("[data-profile-name]")
            : document.querySelector(`[data-profile-value="${profileEditField}"]`);
        if (element) element.textContent = value;
        profileEditPanel.classList.add("hidden");
        toast("名片资料已更新");
    });
    const avatars = ["🐑", "🐏", "🐸", "🐱", "🦊", "🐻"];
    const avatarButton = document.querySelector("[data-avatar-cycle]");
    if (avatarButton) {
        const storedAvatar = localStorage.getItem("planetProfile-avatar");
        let avatarIndex = Math.max(0, avatars.indexOf(storedAvatar));
        if (storedAvatar) avatarButton.firstChild.textContent = storedAvatar;
        avatarButton.addEventListener("click", () => {
            avatarIndex = (avatarIndex + 1) % avatars.length;
            avatarButton.firstChild.textContent = avatars[avatarIndex];
            localStorage.setItem("planetProfile-avatar", avatars[avatarIndex]);
            toast("头像已更换");
        });
    }
    document.querySelectorAll("[data-copy]").forEach((button) => {
        button.addEventListener("click", () => {
            const id = document.querySelector("[data-profile-id]")?.textContent || "67c7bfc498583ec7";
            const input = document.createElement("textarea");
            input.value = id;
            input.setAttribute("readonly", "");
            input.style.position = "fixed";
            input.style.opacity = "0";
            document.body.append(input);
            input.select();
            const copied = document.execCommand("copy");
            input.remove();
            toast(copied ? "编号已复制" : "复制失败，请手动记录编号");
        });
    });

    const unlockedLevel = readProgress();
    const levelLink = (level) => `planet-game.html?level=${level}`;
    document.querySelectorAll("[data-current-level]").forEach((element) => {
        element.textContent = String(unlockedLevel).padStart(2, "0");
    });
    document.querySelectorAll("[data-level-link]").forEach((link) => {
        link.href = levelLink(unlockedLevel);
    });
    document.querySelectorAll("[data-progress-label]").forEach((element) => {
        element.textContent = `已通关 ${unlockedLevel - 1} / ${MAX_LEVEL} 关 · 已解锁至第 ${unlockedLevel} 关`;
    });
    document.querySelectorAll("[data-level-progress]").forEach((bar) => {
        bar.style.width = `${((unlockedLevel - 1) / MAX_LEVEL) * 100}%`;
    });

    const levelList = document.querySelector("[data-level-list]");
    if (levelList) {
        levelList.replaceChildren(...Array.from({ length: MAX_LEVEL }, (_, index) => {
            const level = index + 1;
            const link = document.createElement(level <= unlockedLevel ? "a" : "span");
            link.className = `level-node${level < unlockedLevel ? " is-complete" : ""}${level === unlockedLevel ? " is-current" : ""}${level > unlockedLevel ? " is-locked" : ""}`;
            link.textContent = level > unlockedLevel ? "🔒" : String(level);
            link.setAttribute("aria-label", level > unlockedLevel ? `第 ${level} 关，尚未解锁` : `第 ${level} 关${level < unlockedLevel ? "，已通关" : "，开始挑战"}`);
            if (level <= unlockedLevel) link.href = levelLink(level);
            levelList.append(link);
            return link;
        }));
    }

    const result = document.querySelector("[data-result]");
    if (result) {
        const lastLevel = Math.max(1, Math.min(MAX_LEVEL, Number.parseInt(localStorage.getItem("planetLastLevel") || String(unlockedLevel - 1), 10) || 1));
        const isWin = localStorage.getItem("planetLastResult") === "win";
        result.querySelector("[data-result-level]").textContent = `青草星球 · 第 ${lastLevel} 关`;
        result.querySelector("[data-result-heading]").innerHTML = isWin ? "太棒啦！<br>小羊出发成功" : "再试一次！<br>小羊还在等你";
        result.querySelector("[data-result-icon]").textContent = isWin ? "🎉" : "🐑";
        result.querySelector("[data-result-stars]").textContent = isWin ? "⭐ 3" : "⭐ 0";
        result.querySelector("[data-result-energy]").textContent = isWin ? "+20" : "+0";
        result.querySelector("[data-result-reward]").textContent = isWin ? "+20" : "+0";
        const nextButton = result.querySelector("[data-next-level]");
        if (isWin && lastLevel < MAX_LEVEL) {
            nextButton.href = levelLink(lastLevel + 1);
            nextButton.textContent = `挑战第 ${lastLevel + 1} 关`;
        } else if (isWin) {
            nextButton.href = "planet-worlds.html";
            nextButton.textContent = "全部关卡已通关";
        } else {
            nextButton.href = levelLink(lastLevel);
            nextButton.textContent = `重试第 ${lastLevel} 关`;
        }
    }

    const game = document.querySelector("[data-game]");
    if (game) {
        const requestedLevel = Number.parseInt(new URLSearchParams(window.location.search).get("level") || "1", 10);
        const level = Number.isFinite(requestedLevel) ? Math.max(1, Math.min(unlockedLevel, Math.min(MAX_LEVEL, requestedLevel))) : 1;
        const symbolPool = ["🐑", "🌼", "🥕", "🍀", "🍄", "⭐", "🌙", "🪵", "🐝", "🍓", "🐞", "🌻"];
        const symbolCount = Math.min(5 + Math.floor((level - 1) / 2), symbolPool.length);
        const symbols = symbolPool.slice(0, symbolCount);
        const tileCount = symbolCount * 3;
        const desiredTopCount = level >= 4 ? Math.min(12, 3 + Math.floor((level - 4) / 3) * 3) : 0;
        const topCount = Math.min(desiredTopCount, Math.max(0, tileCount - 15));
        const upperCount = Math.min(12, tileCount - 9 - topCount, 6 + Math.floor((level - 1) / 2) * 3);
        const layerSizes = [tileCount - upperCount - topCount, upperCount];
        if (topCount > 0) layerSizes.push(topCount);
        const tiles = [];
        let nextId = 0;
        layerSizes.forEach((size, layer) => {
            const previousLayer = layer === 0 ? [] : tiles.filter((tile) => tile.layer === layer - 1);
            for (let index = 0; index < size; index += 1) {
                const parent = previousLayer.length ? previousLayer[index % previousLayer.length] : null;
                const tile = {
                    id: nextId++,
                    layer,
                    column: parent ? parent.column : index % 4,
                    row: parent ? parent.row : Math.floor(index / 4),
                    covers: parent ? parent.id : null
                };
                tiles.push(tile);
            }
        });
        const symbolsForTiles = shuffle(symbols.flatMap((symbol) => [symbol, symbol, symbol]));
        shuffle(tiles).forEach((tile, index) => { tile.symbol = symbolsForTiles[index]; });
        const board = game.querySelector(".tile-grid");
        const slots = game.querySelector(".slots");
        const notice = game.querySelector(".notice");
        const selected = [];
        let locked = false;
        game.querySelectorAll("[data-level-label]").forEach((label) => { label.textContent = String(level).padStart(2, "0"); });
        game.querySelector("[data-difficulty]").textContent = `${symbols.length} 种图案 · ${layerSizes.length} 层堆叠`;
        game.querySelector("[data-game-description]").textContent = level < 4
            ? "点击可见方块收集小伙伴，集齐 3 个相同图案即可消除。上层方块会遮住下层图案。"
            : "图案种类和堆叠层数增加了！露出一角的方块也可能藏着新伙伴。";

        const renderSlots = () => {
            slots.replaceChildren(...Array.from({ length: 7 }, (_, index) => {
                const slot = document.createElement("span");
                slot.className = "slot";
                slot.textContent = selected[index] ? selected[index].symbol : "";
                return slot;
            }));
        };
        const updateCoveredTiles = () => {
            const liveTiles = tiles.filter((tile) => !tile.matched && !tile.selected);
            for (const tile of tiles) {
                const button = tile.button;
                if (!button || tile.matched || tile.selected) continue;
                const covered = liveTiles.some((other) => other.layer > tile.layer && other.covers === tile.id);
                button.disabled = covered;
                button.classList.toggle("is-covered", covered);
                button.setAttribute("aria-disabled", String(covered));
                button.tabIndex = covered ? -1 : 0;
            }
        };
        const tileSize = Math.min(88, Math.floor((board.clientWidth - 14) / 4));
        const tileHeight = Math.round(tileSize * 1.1);
        const stepX = board.clientWidth / 4;
        const stepY = tileSize * .72;
        const finish = (won) => {
            locked = true;
            notice.textContent = won ? "恭喜通关！正在前往结算…" : "槽位满啦，再试一次！";
            localStorage.setItem("planetLastResult", won ? "win" : "lose");
            localStorage.setItem("planetLastLevel", String(level));
            if (won) localStorage.setItem(PROGRESS_KEY, String(Math.max(unlockedLevel, Math.min(MAX_LEVEL, level + 1))));
            window.setTimeout(() => {
                window.location.href = `planet-result.html?level=${level}`;
            }, 1000);
        };
        const choose = (tile) => {
            if (locked || tile.button.disabled || tile.matched || tile.selected) return;
            tile.selected = true;
            selected.push(tile);
            const matches = selected.filter((item) => item.symbol === tile.symbol);
            if (matches.length === 3) {
                matches.forEach((item) => {
                    item.matched = true;
                    item.button.classList.add("is-matched");
                });
                for (let index = selected.length - 1; index >= 0; index -= 1) {
                    if (matches.includes(selected[index])) selected.splice(index, 1);
                }
            }
            tile.button.classList.add("is-picked");
            tile.button.disabled = true;
            updateCoveredTiles();
            renderSlots();
            if (tiles.every((item) => item.matched)) {
                finish(true);
            } else if (selected.length >= 7) {
                finish(false);
            } else {
                notice.textContent = matches.length === 3 ? "消除成功！上层图案已露出来" : "凑齐 3 个相同图案即可消除";
            }
        };
        tiles.forEach((tile) => {
            const button = document.createElement("button");
            button.className = "tile";
            button.type = "button";
            button.textContent = tile.symbol;
            button.dataset.symbol = tile.symbol;
            const fullyCovered = tile.layer > 0 && tile.id % 4 === 0;
            const offset = fullyCovered ? 0 : tile.layer * 8;
            button.style.width = `${tileSize}px`;
            button.style.height = `${tileHeight}px`;
            button.style.left = `${tile.column * stepX + offset}px`;
            button.style.top = `${tile.row * stepY + offset}px`;
            button.style.zIndex = String(tile.layer + 1);
            if (fullyCovered) button.classList.add("is-full-cover");
            button.setAttribute("aria-label", `选择小伙伴 ${tile.symbol}`);
            button.addEventListener("click", () => choose(tile));
            tile.button = button;
            board.append(button);
        });
        const rowCount = Math.ceil(layerSizes[0] / 4);
        board.style.height = `${rowCount * stepY + tileHeight + (layerSizes.length - 1) * 8}px`;
        updateCoveredTiles();
        renderSlots();
        game.querySelector("[data-game-action='undo']").addEventListener("click", () => {
            if (!selected.length || locked) return toast("暂时没有可撤回的方块");
            const tile = selected.pop();
            tile.selected = false;
            tile.button.classList.remove("is-picked");
            tile.button.disabled = false;
            updateCoveredTiles();
            renderSlots();
            notice.textContent = "已撤回一个方块";
        });
        game.querySelector("[data-game-action='move-out']").addEventListener("click", () => {
            if (selected.length < 3 || locked) return toast("收集槽至少要有 3 个小伙伴才能移出");
            selected.splice(-3).forEach((tile) => {
                tile.selected = false;
                tile.button.classList.remove("is-picked");
                tile.button.disabled = false;
            });
            updateCoveredTiles();
            renderSlots();
            notice.textContent = "已移出 3 个小伙伴，继续闯关吧";
        });
        game.querySelector("[data-game-action='shuffle']").addEventListener("click", () => {
            if (locked) return;
            const available = shuffle(tiles.filter((tile) => !tile.matched && !tile.selected));
            const remainingSymbols = shuffle(available.map((tile) => tile.symbol));
            available.forEach((tile, index) => {
                tile.symbol = remainingSymbols[index];
                tile.button.textContent = tile.symbol;
                tile.button.dataset.symbol = tile.symbol;
                tile.button.setAttribute("aria-label", `选择小伙伴 ${tile.symbol}`);
            });
            renderSlots();
            toast("剩余小伙伴已重新排列");
        });
    }

    document.querySelectorAll("[data-admin-form]").forEach((form) => {
        form.addEventListener("submit", (event) => {
            event.preventDefault();
            toast("公告已保存（演示）");
            form.reset();
        });
    });
})();
