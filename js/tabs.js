/**
 * 作者：王振旭
 * 建立时间：2026-11-04
 * 使用大模型：DeepSeek-V4.1-Flash
 * 功能名称：可复用的新闻 Tab 选项卡切换
 */
(function (wzx_window, wzx_document) {
  "use strict";

  const wzx_activeTabClass = "wzx_tab--active";
  const wzx_activePanelClass = "wzx_panel--active";

  // 功能：清除容器内所有选项卡和面板的选中状态
  function wzx_clearState(wzx_root) {
    wzx_root.querySelectorAll("[data-wzx-tab]").forEach(function (wzx_tab) {
      wzx_tab.classList.remove(wzx_activeTabClass);
      wzx_tab.setAttribute("aria-selected", "false");
    });

    wzx_root.querySelectorAll("[data-wzx-panel]").forEach(function (wzx_panel) {
      wzx_panel.classList.remove(wzx_activePanelClass);
      wzx_panel.hidden = true;
    });
  }

  // 功能：先清除全部选中状态，再设置当前选项卡及其对应面板
  function wzx_activateTab(wzx_root, wzx_targetTab) {
    wzx_clearState(wzx_root);

    wzx_targetTab.classList.add(wzx_activeTabClass);
    wzx_targetTab.setAttribute("aria-selected", "true");

    const wzx_panelId = wzx_targetTab.getAttribute("data-wzx-tab");
    const wzx_targetPanel = wzx_root.querySelector('[data-wzx-panel="' + wzx_panelId + '"]');

    if (wzx_targetPanel) {
      wzx_targetPanel.classList.add(wzx_activePanelClass);
      wzx_targetPanel.hidden = false;
    }
  }

  // 功能：为单个选项卡容器绑定点击监听事件
  function wzx_initTabs(wzx_root) {
    if (!wzx_root) {
      return;
    }

    wzx_root.querySelectorAll("[data-wzx-tab]").forEach(function (wzx_tab) {
      wzx_tab.addEventListener("click", function () {
        wzx_activateTab(wzx_root, wzx_tab);
      });
    });
  }

  // 功能：初始化页面内所有带有 data-wzx-tabs 的选项卡容器
  function wzx_initAllTabs() {
    wzx_document.querySelectorAll("[data-wzx-tabs]").forEach(function (wzx_root) {
      wzx_initTabs(wzx_root);
    });
  }

  // 暴露初始化方法，便于页面动态新增选项卡容器后再次调用
  wzx_window.wzx_initTabs = wzx_initTabs;

  if (wzx_document.readyState === "loading") {
    wzx_document.addEventListener("DOMContentLoaded", wzx_initAllTabs);
  } else {
    wzx_initAllTabs();
  }
})(window, document);
