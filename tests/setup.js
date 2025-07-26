/**
 * Jest setup file for Ojisan Invader tests
 * Configures global test environment and mocks
 */

// Mock global objects and APIs
global.performance = {
  now: jest.fn(() => Date.now())
};

global.requestAnimationFrame = jest.fn((callback) => {
  return setTimeout(callback, 16); // ~60fps
});

global.cancelAnimationFrame = jest.fn((id) => {
  clearTimeout(id);
});

// Mock document methods
Object.defineProperty(document, 'hidden', {
  value: false,
  writable: true
});

Object.defineProperty(document, 'visibilityState', {
  value: 'visible',
  writable: true
});

// Mock canvas and context
const mockContext = {
  clearRect: jest.fn(),
  fillRect: jest.fn(),
  fillText: jest.fn(),
  save: jest.fn(),
  restore: jest.fn(),
  translate: jest.fn(),
  rotate: jest.fn(),
  scale: jest.fn(),
  beginPath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  arc: jest.fn(),
  fill: jest.fn(),
  stroke: jest.fn(),
  drawImage: jest.fn(),
  getImageData: jest.fn(() => ({ data: new Uint8ClampedArray(4) })),
  putImageData: jest.fn(),
  createImageData: jest.fn(() => ({ data: new Uint8ClampedArray(4) })),
  measureText: jest.fn(() => ({ width: 10 })),
  canvas: {
    width: 800,
    height: 600
  }
};

// Set default properties
Object.assign(mockContext, {
  fillStyle: '#000000',
  strokeStyle: '#000000',
  lineWidth: 1,
  font: '10px sans-serif',
  textAlign: 'start',
  textBaseline: 'alphabetic',
  imageSmoothingEnabled: true
});

global.HTMLCanvasElement.prototype.getContext = jest.fn(() => mockContext);

// Mock getBoundingClientRect
global.Element.prototype.getBoundingClientRect = jest.fn(() => ({
  x: 0,
  y: 0,
  width: 800,
  height: 600,
  top: 0,
  right: 800,
  bottom: 600,
  left: 0
}));

// Mock Image constructor
global.Image = class {
  constructor() {
    this.src = '';
    this.width = 0;
    this.height = 0;
    this.onload = null;
    this.onerror = null;
  }
  
  // Simulate image loading
  load() {
    setTimeout(() => {
      if (this.onload) {
        this.onload();
      }
    }, 0);
  }
};

// Mock audio
global.Audio = class {
  constructor() {
    this.volume = 1;
    this.currentTime = 0;
    this.paused = true;
  }
  
  play() {
    this.paused = false;
    return Promise.resolve();
  }
  
  pause() {
    this.paused = true;
  }
  
  load() {}
};

// Enhanced console methods for test debugging
const originalConsole = { ...console };
global.console = {
  ...originalConsole,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn()
};

// Test utilities
global.TestUtils = {
  // Create mock canvas element
  createMockCanvas: (width = 800, height = 600) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.getContext = jest.fn(() => mockContext);
    return canvas;
  },
  
  // Create mock keyboard event
  createKeyEvent: (type, code, key) => {
    return new KeyboardEvent(type, {
      code,
      key,
      bubbles: true,
      cancelable: true
    });
  },
  
  // Wait for next frame
  nextFrame: () => {
    return new Promise(resolve => {
      requestAnimationFrame(resolve);
    });
  },
  
  // Wait for multiple frames
  waitFrames: (count) => {
    return new Promise(resolve => {
      let remaining = count;
      const tick = () => {
        if (--remaining <= 0) {
          resolve();
        } else {
          requestAnimationFrame(tick);
        }
      };
      requestAnimationFrame(tick);
    });
  },
  
  // Reset all mocks
  resetMocks: () => {
    jest.clearAllMocks();
    Object.values(mockContext).forEach(method => {
      if (typeof method === 'function') {
        method.mockClear();
      }
    });
  }
};

// Setup before each test
beforeEach(() => {
  // Reset performance timer
  performance.now.mockReturnValue(0);
  
  // Reset request animation frame counter
  let rafId = 0;
  requestAnimationFrame.mockImplementation((callback) => {
    return setTimeout(callback, 16);
  });
  
  // Reset document visibility
  Object.defineProperty(document, 'hidden', { value: false, writable: true });
  Object.defineProperty(document, 'visibilityState', { value: 'visible', writable: true });
});

// Cleanup after each test
afterEach(() => {
  TestUtils.resetMocks();
});