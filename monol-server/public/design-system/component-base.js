/**
 * Monol Component Base
 * 플러그인 콘솔 컴포넌트의 기본 클래스 및 유틸리티
 */

/**
 * 컴포넌트 기본 클래스
 * 모든 플러그인 컴포넌트는 이 클래스를 상속
 */
export class MonolComponent {
  constructor(container, options = {}) {
    this.container = typeof container === 'string'
      ? document.querySelector(container)
      : container;
    this.options = options;
    this.eventHandlers = new Map();
    this.state = {};
  }

  /**
   * 컴포넌트 초기화 (서브클래스에서 구현)
   */
  async init() {
    throw new Error('init() must be implemented');
  }

  /**
   * 컴포넌트 렌더링 (서브클래스에서 구현)
   */
  render() {
    throw new Error('render() must be implemented');
  }

  /**
   * 컴포넌트 정리
   */
  destroy() {
    this.eventHandlers.clear();
    if (this.container) {
      this.container.innerHTML = '';
    }
  }

  /**
   * 상태 업데이트 및 리렌더링
   */
  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.render();
  }

  /**
   * 이벤트 발행
   */
  emit(eventName, data) {
    const handlers = this.eventHandlers.get(eventName) || [];
    handlers.forEach(handler => handler(data));
  }

  /**
   * 이벤트 구독
   */
  on(eventName, handler) {
    if (!this.eventHandlers.has(eventName)) {
      this.eventHandlers.set(eventName, []);
    }
    this.eventHandlers.get(eventName).push(handler);
    return () => this.off(eventName, handler);
  }

  /**
   * 이벤트 구독 해제
   */
  off(eventName, handler) {
    const handlers = this.eventHandlers.get(eventName) || [];
    const index = handlers.indexOf(handler);
    if (index > -1) {
      handlers.splice(index, 1);
    }
  }

  /**
   * HTML 템플릿 렌더링 헬퍼
   */
  html(strings, ...values) {
    return strings.reduce((result, str, i) => {
      const value = values[i] !== undefined ? values[i] : '';
      return result + str + value;
    }, '');
  }
}

/**
 * 컴포넌트 레지스트리
 * 플러그인 간 컴포넌트 공유 및 연동
 */
export const ComponentRegistry = {
  components: new Map(),
  instances: new Map(),

  /**
   * 컴포넌트 클래스 등록
   */
  register(name, ComponentClass) {
    this.components.set(name, ComponentClass);
  },

  /**
   * 컴포넌트 인스턴스 생성
   */
  create(name, container, options = {}) {
    const ComponentClass = this.components.get(name);
    if (!ComponentClass) {
      throw new Error(`Component "${name}" not found`);
    }
    const instance = new ComponentClass(container, options);
    this.instances.set(name, instance);
    return instance;
  },

  /**
   * 컴포넌트 인스턴스 가져오기
   */
  get(name) {
    return this.instances.get(name);
  },

  /**
   * 컴포넌트 간 연동 설정
   */
  connect(sourceName, eventName, targetName, targetMethod) {
    const source = this.instances.get(sourceName);
    const target = this.instances.get(targetName);

    if (source && target && typeof target[targetMethod] === 'function') {
      source.on(eventName, (data) => target[targetMethod](data));
    }
  }
};

/**
 * 컴포넌트 동적 로더
 */
export const ComponentLoader = {
  loaded: new Map(),

  /**
   * 플러그인 컴포넌트 로드
   */
  async load(pluginId, componentName) {
    const key = `${pluginId}/${componentName}`;

    if (this.loaded.has(key)) {
      return this.loaded.get(key);
    }

    try {
      const module = await import(`/api/plugins/${pluginId}/components/${componentName}.js`);
      this.loaded.set(key, module);
      return module;
    } catch (error) {
      console.error(`Failed to load component ${key}:`, error);
      return null;
    }
  },

  /**
   * 플러그인의 모든 컴포넌트 로드
   */
  async loadAll(pluginId) {
    try {
      const manifest = await fetch(`/api/plugins/${pluginId}/manifest`).then(r => r.json());
      const components = manifest.components || [];

      const loaded = await Promise.all(
        components.map(name => this.load(pluginId, name))
      );

      return loaded.filter(Boolean);
    } catch (error) {
      console.error(`Failed to load components for ${pluginId}:`, error);
      return [];
    }
  }
};

/**
 * 플러그인 간 이벤트 버스
 * 통합 콘솔에서 플러그인 간 통신에 사용
 */
export const EventBus = {
  handlers: new Map(),

  /**
   * 이벤트 발행
   */
  emit(eventName, data, source = null) {
    const handlers = this.handlers.get(eventName) || [];
    handlers.forEach(({ handler, target }) => {
      if (!target || target !== source) {
        handler(data, source);
      }
    });
  },

  /**
   * 이벤트 구독
   */
  on(eventName, handler, target = null) {
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, []);
    }
    this.handlers.get(eventName).push({ handler, target });

    return () => this.off(eventName, handler);
  },

  /**
   * 이벤트 구독 해제
   */
  off(eventName, handler) {
    const handlers = this.handlers.get(eventName) || [];
    const index = handlers.findIndex(h => h.handler === handler);
    if (index > -1) {
      handlers.splice(index, 1);
    }
  },

  /**
   * 모든 구독 해제
   */
  clear() {
    this.handlers.clear();
  }
};

// 전역 노출 (비모듈 환경용)
if (typeof window !== 'undefined') {
  window.MonolComponent = MonolComponent;
  window.ComponentRegistry = ComponentRegistry;
  window.ComponentLoader = ComponentLoader;
  window.EventBus = EventBus;
}
