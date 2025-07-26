# Testing Documentation for Ojisan Invader

This document describes the comprehensive testing strategy and implementation for the Ojisan Invader retro-style browser game.

## Overview

The testing suite ensures the game maintains high quality, performance, and reliability across different browsers and devices. It covers all aspects from individual component behavior to complete gameplay scenarios.

## Test Architecture

### Test Types

1. **Unit Tests** - Test individual components, systems, and utilities in isolation
2. **Integration Tests** - Test interactions between different game systems
3. **End-to-End (E2E) Tests** - Test complete user workflows and gameplay scenarios
4. **Performance Tests** - Ensure 60fps performance and memory efficiency

### Technology Stack

- **Jest** - Unit and integration testing framework
- **Playwright** - E2E testing across multiple browsers
- **jest-canvas-mock** - Canvas API mocking for unit tests
- **jsdom** - DOM environment simulation

## Directory Structure

```
tests/
├── unit/                    # Unit tests
│   ├── core/               # ECS core system tests
│   ├── components/         # Game component tests
│   ├── systems/           # Game system tests
│   └── utils/             # Utility class tests
├── integration/            # Integration tests
├── e2e/                   # End-to-end tests
├── performance/           # Performance tests
├── utils/                 # Test utilities
├── mocks/                 # Mock objects and components
└── setup.js              # Global test setup
```

## Running Tests

### Quick Start

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run comprehensive test suite
node test-runner.js
```

### Specific Test Types

```bash
# Unit tests only
npm test -- --testPathPattern=unit

# Integration tests only
npm test -- --testPathPattern=integration

# Performance tests only
npm test -- --testPathPattern=performance

# Watch mode for development
npm run test:watch
```

### E2E Tests

```bash
# Run E2E tests in headed mode
npm run test:e2e:ui

# Run E2E tests in specific browser
npx playwright test --project=chromium

# Debug E2E tests
npx playwright test --debug
```

## Test Coverage Requirements

### Coverage Targets

- **Overall Coverage**: 80% minimum
- **Functions**: 80% minimum
- **Branches**: 75% minimum
- **Lines**: 80% minimum

### Critical Components (95%+ coverage required)

- ECS Core System (Entity, Component, System, World)
- Collision Detection System
- Game Engine Core
- Player Component
- Input System

## Unit Tests

### Core ECS System

Tests the fundamental Entity-Component-System architecture:

```javascript
// Example: Entity component management
test('should add and retrieve components', () => {
  const entity = new Entity();
  const position = new Position(100, 200);
  
  entity.addComponent(position);
  
  expect(entity.hasComponent(Position)).toBe(true);
  expect(entity.getComponent(Position)).toBe(position);
});
```

### Game Components

Each component is thoroughly tested for:
- Constructor initialization
- Method behavior
- State management
- Object pooling compatibility
- Edge cases

### Game Systems

System tests cover:
- Entity filtering and processing
- Update cycle behavior
- Performance characteristics
- Integration with other systems

## Integration Tests

Integration tests verify system interactions:

```javascript
// Example: Movement and collision integration
test('should detect collision after movement', () => {
  const world = new World();
  const movementSystem = new MovementSystem(world);
  const collisionSystem = new CollisionSystem(world);
  
  // Create moving entities that will collide
  const entity1 = createMovingEntity(world, 100, 100, 50, 0);
  const entity2 = createStaticEntity(world, 150, 100);
  
  // Update systems
  movementSystem.update(0.5); // Move entity1 right
  collisionSystem.update(0.016);
  
  // Verify collision detected
  expect(collisionSystem.collisionEvents).toHaveLength(1);
});
```

## E2E Tests

End-to-end tests simulate real user interactions:

### Game Flow Tests
- Menu navigation
- Game start/restart
- Keyboard controls
- Game over scenarios

### Performance Tests
- Frame rate stability
- Memory usage over time
- Input responsiveness

### Accessibility Tests
- Keyboard navigation
- Screen reader compatibility
- Color contrast

### Browser Compatibility
- Cross-browser functionality
- Mobile responsiveness
- Touch controls

## Performance Tests

Performance tests ensure the game meets 60fps requirements:

### Frame Rate Tests
```javascript
test('should maintain 60fps with moderate entity count', () => {
  // Create 50 entities
  createTestEntities(world, 50);
  
  const frameTimes = [];
  for (let frame = 0; frame < 60; frame++) {
    const startTime = performance.now();
    gameEngine.update(1/60);
    frameTimes.push(performance.now() - startTime);
  }
  
  const avgFrameTime = average(frameTimes);
  expect(avgFrameTime).toBeLessThan(16.67 * 0.8); // 80% of frame budget
});
```

### Memory Tests
- Object pooling efficiency
- Memory leak detection
- Garbage collection impact

### Scalability Tests
- Performance with increasing entity counts
- System complexity scaling
- Rendering efficiency

## Mock Objects and Test Utilities

### Canvas Mocking
The test environment includes comprehensive canvas mocking:

```javascript
// Automatic canvas context mocking
const mockContext = {
  fillRect: jest.fn(),
  clearRect: jest.fn(),
  fillText: jest.fn(),
  // ... all canvas methods
};
```

### Test Utilities
```javascript
// Helper functions for common test scenarios
TestUtils.createMockCanvas()
TestUtils.createKeyEvent('keydown', 'Space')
TestUtils.waitFrames(10)
TestUtils.resetMocks()
```

### Component Factories
```javascript
// Standardized component creation for tests
function createPlayer(x = 400, y = 500) {
  const entity = world.createEntity();
  entity.addComponent(new Position(x, y));
  entity.addComponent(new Player());
  entity.addComponent(new Health(3));
  return entity;
}
```

## Continuous Integration

### GitHub Actions Workflow
```yaml
name: Test Suite
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm ci
      - run: npm run test:coverage
      - run: npm run test:e2e
```

### Quality Gates
- All tests must pass
- Coverage must meet thresholds
- Performance tests must pass
- E2E tests must pass in CI environment

## Test Development Guidelines

### Writing Unit Tests

1. **Test Structure**: Use AAA pattern (Arrange, Act, Assert)
2. **Descriptive Names**: Test names should describe the behavior being tested
3. **Edge Cases**: Include tests for boundary conditions and error cases
4. **Mocking**: Mock dependencies to isolate units under test
5. **Performance**: Unit tests should run quickly (< 1ms each)

### Writing Integration Tests

1. **Real Interactions**: Test actual system interactions
2. **Minimal Mocking**: Use real components where possible
3. **Scenario-Based**: Test realistic game scenarios
4. **Performance Aware**: Consider performance implications

### Writing E2E Tests

1. **User Perspective**: Write tests from user's point of view
2. **Stable Selectors**: Use reliable element selectors
3. **Wait Strategies**: Implement proper waiting for async operations
4. **Cross-Browser**: Consider different browser behaviors

## Debugging Tests

### Common Issues

1. **Timing Issues**: Use proper async/await and waiting strategies
2. **Canvas Context**: Ensure canvas mocking is properly set up
3. **Memory Leaks**: Check for proper cleanup in afterEach blocks
4. **Flaky Tests**: Identify and fix non-deterministic test behavior

### Debug Commands
```bash
# Debug specific test
npm test -- --testNamePattern="collision detection"

# Run with verbose output
npm test -- --verbose

# Debug E2E test
npx playwright test --debug game-flow.spec.js
```

## Performance Benchmarks

### Target Metrics

- **Frame Time**: < 13.3ms average (75% of 16.67ms budget)
- **Memory Growth**: < 10MB over 5 minutes of gameplay
- **Entity Count**: Support 200+ entities at 60fps
- **Collision Checks**: Handle 1000+ collision checks per frame

### Monitoring

Tests automatically monitor and report:
- Frame time distribution
- Memory allocation patterns
- System update times
- Garbage collection impact

## Contributing

### Adding New Tests

1. Follow existing patterns and conventions
2. Add tests for new features and bug fixes
3. Ensure tests are deterministic and fast
4. Update this documentation for significant changes

### Test Review Checklist

- [ ] Tests cover happy path and edge cases
- [ ] Tests are well-named and documented
- [ ] Tests don't have external dependencies
- [ ] Tests clean up after themselves
- [ ] Performance tests meet timing requirements

## Reporting

### Test Reports

The test runner generates comprehensive reports:

- **Summary Report**: Overall test results and metrics
- **Coverage Report**: Line-by-line coverage information
- **Performance Report**: Frame time and memory analysis
- **HTML Report**: Visual dashboard of test results

### Accessing Reports

```bash
# Generate comprehensive report
node test-runner.js

# View HTML report
open test-reports/report.html

# View coverage report
open coverage/lcov-report/index.html
```

## Troubleshooting

### Common Problems

1. **Canvas Tests Failing**: Ensure jest-canvas-mock is properly configured
2. **E2E Server Issues**: Check that development server is running
3. **Performance Flaky**: Run performance tests multiple times
4. **Memory Tests Failing**: Verify Node.js has sufficient memory

### Getting Help

- Check existing test examples for patterns
- Review error messages and stack traces
- Run tests in isolation to identify issues
- Use debug tools and verbose output

---

For more information about specific test implementations, see the individual test files and their documentation comments.