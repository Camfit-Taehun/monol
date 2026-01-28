/**
 * Monol Plugin Loader
 * 플러그인 콘솔을 동적으로 로드하고 관리하는 모듈
 */

const PluginLoader = {
  // 로드된 플러그인 캐시
  loadedPlugins: new Map(),

  // 현재 활성 플러그인
  activePlugin: null,

  // 플러그인 컨테이너 ID
  containerId: 'plugin-container',

  /**
   * 초기화
   */
  async init(options = {}) {
    this.containerId = options.containerId || 'plugin-container';
    this.onPluginChange = options.onPluginChange || (() => {});
    this.onError = options.onError || console.error;

    // 플러그인 목록 로드
    try {
      const response = await fetch('/api/plugins');
      this.plugins = await response.json();
      return this.plugins;
    } catch (error) {
      this.onError('Failed to load plugins:', error);
      return [];
    }
  },

  /**
   * 플러그인 manifest 로드
   */
  async loadManifest(pluginId) {
    if (this.loadedPlugins.has(pluginId)) {
      return this.loadedPlugins.get(pluginId).manifest;
    }

    try {
      const response = await fetch(`/api/plugins/${pluginId}/manifest`);
      if (!response.ok) {
        throw new Error(`Manifest not found for ${pluginId}`);
      }
      return await response.json();
    } catch (error) {
      this.onError(`Failed to load manifest for ${pluginId}:`, error);
      return null;
    }
  },

  /**
   * 플러그인 콘솔 로드 (iframe 방식)
   */
  async loadPlugin(pluginId) {
    const container = document.getElementById(this.containerId);
    if (!container) {
      this.onError('Plugin container not found');
      return false;
    }

    // 기존 콘텐츠 숨기기
    this.hideAllPlugins();

    // 이미 로드된 플러그인이면 다시 표시
    if (this.loadedPlugins.has(pluginId)) {
      const cached = this.loadedPlugins.get(pluginId);
      cached.element.style.display = 'block';
      this.activePlugin = pluginId;
      this.onPluginChange(pluginId, cached.manifest);
      return true;
    }

    // manifest 로드
    const manifest = await this.loadManifest(pluginId);
    if (!manifest) {
      this.showError(container, `Plugin "${pluginId}" manifest not found`);
      return false;
    }

    // iframe 생성
    const iframe = document.createElement('iframe');
    iframe.id = `plugin-frame-${pluginId}`;
    iframe.className = 'plugin-frame';
    iframe.src = `/api/plugins/${pluginId}/web/${manifest.console.entry}`;
    iframe.style.cssText = 'width:100%;height:100%;border:none;';

    // 로딩 표시
    const loading = document.createElement('div');
    loading.className = 'plugin-loading';
    loading.innerHTML = `
      <div class="loading-spinner"></div>
      <p>Loading ${manifest.name}...</p>
    `;
    container.appendChild(loading);

    // iframe 로드 완료 처리
    iframe.onload = () => {
      loading.remove();
      iframe.style.display = 'block';

      // 디자인 시스템 CSS 주입
      this.injectDesignSystem(iframe);
    };

    iframe.onerror = () => {
      loading.remove();
      this.showError(container, `Failed to load ${manifest.name}`);
    };

    container.appendChild(iframe);

    // 캐시에 저장
    this.loadedPlugins.set(pluginId, {
      manifest,
      element: iframe
    });

    this.activePlugin = pluginId;
    this.onPluginChange(pluginId, manifest);
    return true;
  },

  /**
   * 모든 플러그인 숨기기
   */
  hideAllPlugins() {
    for (const [, cached] of this.loadedPlugins) {
      if (cached.element) {
        cached.element.style.display = 'none';
      }
    }
  },

  /**
   * 에러 표시
   */
  showError(container, message) {
    const errorEl = document.createElement('div');
    errorEl.className = 'plugin-error';
    errorEl.innerHTML = `
      <div class="error-icon">⚠️</div>
      <p>${message}</p>
      <button onclick="this.parentElement.remove()">Close</button>
    `;
    container.appendChild(errorEl);
  },

  /**
   * 디자인 시스템 CSS 주입
   */
  injectDesignSystem(iframe) {
    try {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

      // 이미 주입되었는지 확인
      if (iframeDoc.getElementById('monol-design-system')) {
        return;
      }

      // tokens.css 링크 추가
      const tokensLink = iframeDoc.createElement('link');
      tokensLink.id = 'monol-design-system';
      tokensLink.rel = 'stylesheet';
      tokensLink.href = '/design-system/tokens.css';
      iframeDoc.head.appendChild(tokensLink);

      // components.css 링크 추가
      const componentsLink = iframeDoc.createElement('link');
      componentsLink.rel = 'stylesheet';
      componentsLink.href = '/design-system/components.css';
      iframeDoc.head.appendChild(componentsLink);

      // charts.js 스크립트 추가
      const chartsScript = iframeDoc.createElement('script');
      chartsScript.src = '/design-system/charts.js';
      iframeDoc.head.appendChild(chartsScript);

    } catch (e) {
      // Cross-origin 제한으로 주입 불가능한 경우 무시
      console.warn('Could not inject design system (cross-origin):', e.message);
    }
  },

  /**
   * 플러그인 언로드
   */
  unloadPlugin(pluginId) {
    const cached = this.loadedPlugins.get(pluginId);
    if (cached && cached.element) {
      cached.element.remove();
      this.loadedPlugins.delete(pluginId);
    }
    if (this.activePlugin === pluginId) {
      this.activePlugin = null;
    }
  },

  /**
   * 모든 플러그인 언로드
   */
  unloadAll() {
    for (const [pluginId] of this.loadedPlugins) {
      this.unloadPlugin(pluginId);
    }
  },

  /**
   * 플러그인 탭 UI 생성
   */
  createTabsUI(containerId) {
    const container = document.getElementById(containerId);
    if (!container || !this.plugins) return;

    container.innerHTML = '';

    const tabsWrapper = document.createElement('div');
    tabsWrapper.className = 'plugin-tabs';

    this.plugins.forEach(plugin => {
      if (!plugin.hasConsole) return;

      const tab = document.createElement('button');
      tab.className = 'plugin-tab';
      tab.dataset.pluginId = plugin.id;
      tab.innerHTML = `
        <span class="tab-icon">${plugin.manifest?.icon || '🔌'}</span>
        <span class="tab-name">${plugin.manifest?.name || plugin.id}</span>
      `;

      tab.onclick = () => {
        this.setActiveTab(tab);
        this.loadPlugin(plugin.id);
      };

      tabsWrapper.appendChild(tab);
    });

    container.appendChild(tabsWrapper);
  },

  /**
   * 활성 탭 설정
   */
  setActiveTab(tabElement) {
    document.querySelectorAll('.plugin-tab').forEach(tab => {
      tab.classList.remove('active');
    });
    tabElement.classList.add('active');
  },

  /**
   * 플러그인과 통신 (postMessage)
   */
  sendToPlugin(pluginId, message) {
    const cached = this.loadedPlugins.get(pluginId);
    if (cached && cached.element && cached.element.contentWindow) {
      cached.element.contentWindow.postMessage({
        type: 'MONOL_MESSAGE',
        from: 'monol-console',
        ...message
      }, '*');
    }
  },

  /**
   * 플러그인 메시지 수신 리스너 등록
   */
  onMessage(callback) {
    window.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'MONOL_MESSAGE') {
        callback(event.data);
      }
    });
  }
};

// CSS 스타일 추가
const style = document.createElement('style');
style.textContent = `
  .plugin-tabs {
    display: flex;
    gap: 4px;
    padding: 8px 16px;
    background: var(--bg-secondary, #161b22);
    border-bottom: 1px solid var(--border-color, #30363d);
    overflow-x: auto;
  }

  .plugin-tab {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: transparent;
    border: none;
    border-radius: 6px;
    color: var(--text-secondary, #8b949e);
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
  }

  .plugin-tab:hover {
    background: var(--bg-hover, #30363d);
    color: var(--text-primary, #e6edf3);
  }

  .plugin-tab.active {
    background: var(--bg-tertiary, #21262d);
    color: var(--text-primary, #e6edf3);
  }

  .tab-icon {
    font-size: 16px;
  }

  .tab-name {
    font-size: 13px;
    font-weight: 500;
  }

  .plugin-frame {
    display: none;
    width: 100%;
    height: calc(100vh - 120px);
    border: none;
  }

  .plugin-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 48px;
    color: var(--text-secondary, #8b949e);
  }

  .loading-spinner {
    width: 32px;
    height: 32px;
    border: 3px solid var(--border-color, #30363d);
    border-top-color: var(--accent-blue, #58a6ff);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .plugin-error {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 48px;
    color: var(--color-error, #f85149);
    text-align: center;
  }

  .error-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }

  .plugin-error button {
    margin-top: 16px;
    padding: 8px 16px;
    background: var(--bg-tertiary, #21262d);
    border: 1px solid var(--border-color, #30363d);
    border-radius: 6px;
    color: var(--text-primary, #e6edf3);
    cursor: pointer;
  }

  .plugin-error button:hover {
    background: var(--bg-hover, #30363d);
  }
`;
document.head.appendChild(style);

// 전역으로 노출
if (typeof window !== 'undefined') {
  window.PluginLoader = PluginLoader;
}

// 모듈 내보내기
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PluginLoader;
}
