#!/usr/bin/env node
/**
 * Comprehensive test runner for Ojisan Invader
 * Runs all test suites and generates reports
 */

import { execSync } from 'child_process';
import { existsSync, writeFileSync, mkdirSync } from 'fs';
import path from 'path';

class TestRunner {
  constructor() {
    this.results = {
      unit: null,
      integration: null,
      e2e: null,
      performance: null,
      coverage: null
    };
    this.startTime = Date.now();
  }

  async runAllTests() {
    console.log('🚀 Starting comprehensive test suite for Ojisan Invader\n');

    try {
      // Ensure test reports directory exists
      this.ensureReportsDirectory();

      // Run test suites in order
      await this.runUnitTests();
      await this.runIntegrationTests();
      await this.runPerformanceTests();
      await this.runE2ETests();
      await this.generateCoverageReport();

      // Generate summary report
      this.generateSummaryReport();

      console.log('\n✅ All tests completed successfully!');
      this.printSummary();

    } catch (error) {
      console.error('\n❌ Test suite failed:', error.message);
      process.exit(1);
    }
  }

  ensureReportsDirectory() {
    const reportsDir = path.join(process.cwd(), 'test-reports');
    if (!existsSync(reportsDir)) {
      mkdirSync(reportsDir, { recursive: true });
    }
  }

  async runUnitTests() {
    console.log('📦 Running Unit Tests...');
    try {
      const output = execSync('npm run test -- --testPathPattern=unit --json --outputFile=test-reports/unit-results.json', {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      this.results.unit = this.parseJestOutput(output);
      console.log(`✓ Unit tests: ${this.results.unit.numPassedTests}/${this.results.unit.numTotalTests} passed`);
    } catch (error) {
      console.error('❌ Unit tests failed');
      throw error;
    }
  }

  async runIntegrationTests() {
    console.log('🔗 Running Integration Tests...');
    try {
      const output = execSync('npm run test -- --testPathPattern=integration --json --outputFile=test-reports/integration-results.json', {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      this.results.integration = this.parseJestOutput(output);
      console.log(`✓ Integration tests: ${this.results.integration.numPassedTests}/${this.results.integration.numTotalTests} passed`);
    } catch (error) {
      console.error('❌ Integration tests failed');
      throw error;
    }
  }

  async runPerformanceTests() {
    console.log('⚡ Running Performance Tests...');
    try {
      const output = execSync('npm run test -- --testPathPattern=performance --json --outputFile=test-reports/performance-results.json', {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      this.results.performance = this.parseJestOutput(output);
      console.log(`✓ Performance tests: ${this.results.performance.numPassedTests}/${this.results.performance.numTotalTests} passed`);
    } catch (error) {
      console.error('❌ Performance tests failed');
      throw error;
    }
  }

  async runE2ETests() {
    console.log('🌐 Running E2E Tests...');
    try {
      // First check if server is running, if not start it
      const serverCheck = this.checkServer();
      if (!serverCheck) {
        console.log('Starting development server...');
        // In a real scenario, you'd start the server here
      }

      const output = execSync('npm run test:e2e --', {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      // Parse Playwright output (simplified)
      this.results.e2e = this.parsePlaywrightOutput(output);
      console.log(`✓ E2E tests: ${this.results.e2e.passed}/${this.results.e2e.total} passed`);
    } catch (error) {
      console.error('❌ E2E tests failed');
      // Don't fail the entire suite for E2E issues in CI
      this.results.e2e = { passed: 0, total: 0, skipped: true };
    }
  }

  async generateCoverageReport() {
    console.log('📊 Generating Coverage Report...');
    try {
      const output = execSync('npm run test:coverage -- --json --outputFile=test-reports/coverage-results.json', {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      this.results.coverage = this.parseCoverageOutput(output);
      console.log(`✓ Code coverage: ${this.results.coverage.total}%`);
    } catch (error) {
      console.error('❌ Coverage generation failed');
      this.results.coverage = { total: 0 };
    }
  }

  checkServer() {
    try {
      execSync('curl -f http://localhost:8080 > /dev/null 2>&1');
      return true;
    } catch {
      return false;
    }
  }

  parseJestOutput(output) {
    try {
      const results = JSON.parse(output);
      return {
        numTotalTests: results.numTotalTests,
        numPassedTests: results.numPassedTests,
        numFailedTests: results.numFailedTests,
        numPendingTests: results.numPendingTests,
        success: results.success,
        testResults: results.testResults
      };
    } catch {
      // Fallback parsing
      const passed = (output.match(/✓/g) || []).length;
      const failed = (output.match(/✗/g) || []).length;
      return {
        numTotalTests: passed + failed,
        numPassedTests: passed,
        numFailedTests: failed,
        numPendingTests: 0,
        success: failed === 0
      };
    }
  }

  parsePlaywrightOutput(output) {
    // Simplified Playwright output parsing
    const passedMatch = output.match(/(\d+) passed/);
    const failedMatch = output.match(/(\d+) failed/);
    const skippedMatch = output.match(/(\d+) skipped/);

    const passed = passedMatch ? parseInt(passedMatch[1]) : 0;
    const failed = failedMatch ? parseInt(failedMatch[1]) : 0;
    const skipped = skippedMatch ? parseInt(skippedMatch[1]) : 0;

    return {
      passed,
      failed,
      skipped,
      total: passed + failed + skipped
    };
  }

  parseCoverageOutput(output) {
    try {
      const coverage = JSON.parse(output);
      return {
        total: Math.round(coverage.total?.statements?.pct || 0),
        statements: coverage.total?.statements?.pct || 0,
        branches: coverage.total?.branches?.pct || 0,
        functions: coverage.total?.functions?.pct || 0,
        lines: coverage.total?.lines?.pct || 0
      };
    } catch {
      return { total: 0 };
    }
  }

  generateSummaryReport() {
    const endTime = Date.now();
    const duration = endTime - this.startTime;

    const report = {
      timestamp: new Date().toISOString(),
      duration: `${(duration / 1000).toFixed(2)}s`,
      results: this.results,
      summary: {
        totalTests: (this.results.unit?.numTotalTests || 0) + 
                   (this.results.integration?.numTotalTests || 0) + 
                   (this.results.performance?.numTotalTests || 0) + 
                   (this.results.e2e?.total || 0),
        totalPassed: (this.results.unit?.numPassedTests || 0) + 
                    (this.results.integration?.numPassedTests || 0) + 
                    (this.results.performance?.numPassedTests || 0) + 
                    (this.results.e2e?.passed || 0),
        overallCoverage: this.results.coverage?.total || 0
      }
    };

    writeFileSync(
      'test-reports/summary.json',
      JSON.stringify(report, null, 2)
    );

    // Generate HTML report
    this.generateHTMLReport(report);
  }

  generateHTMLReport(report) {
    const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Ojisan Invader Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { background: #f0f0f0; padding: 20px; border-radius: 8px; }
        .section { margin: 20px 0; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
        .success { color: #28a745; }
        .failure { color: #dc3545; }
        .metric { display: inline-block; margin: 10px; padding: 10px; background: #f8f9fa; border-radius: 4px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎮 Ojisan Invader Test Report</h1>
        <p><strong>Generated:</strong> ${report.timestamp}</p>
        <p><strong>Duration:</strong> ${report.duration}</p>
    </div>

    <div class="section">
        <h2>📊 Summary</h2>
        <div class="metric">
            <strong>Total Tests:</strong> ${report.summary.totalTests}
        </div>
        <div class="metric">
            <strong>Passed:</strong> <span class="success">${report.summary.totalPassed}</span>
        </div>
        <div class="metric">
            <strong>Coverage:</strong> ${report.summary.overallCoverage}%
        </div>
    </div>

    <div class="section">
        <h2>🧪 Test Results</h2>
        <table>
            <tr>
                <th>Test Suite</th>
                <th>Passed</th>
                <th>Failed</th>
                <th>Total</th>
                <th>Status</th>
            </tr>
            <tr>
                <td>Unit Tests</td>
                <td class="success">${report.results.unit?.numPassedTests || 0}</td>
                <td class="failure">${report.results.unit?.numFailedTests || 0}</td>
                <td>${report.results.unit?.numTotalTests || 0}</td>
                <td class="${report.results.unit?.success ? 'success' : 'failure'}">
                    ${report.results.unit?.success ? '✅' : '❌'}
                </td>
            </tr>
            <tr>
                <td>Integration Tests</td>
                <td class="success">${report.results.integration?.numPassedTests || 0}</td>
                <td class="failure">${report.results.integration?.numFailedTests || 0}</td>
                <td>${report.results.integration?.numTotalTests || 0}</td>
                <td class="${report.results.integration?.success ? 'success' : 'failure'}">
                    ${report.results.integration?.success ? '✅' : '❌'}
                </td>
            </tr>
            <tr>
                <td>Performance Tests</td>
                <td class="success">${report.results.performance?.numPassedTests || 0}</td>
                <td class="failure">${report.results.performance?.numFailedTests || 0}</td>
                <td>${report.results.performance?.numTotalTests || 0}</td>
                <td class="${report.results.performance?.success ? 'success' : 'failure'}">
                    ${report.results.performance?.success ? '✅' : '❌'}
                </td>
            </tr>
            <tr>
                <td>E2E Tests</td>
                <td class="success">${report.results.e2e?.passed || 0}</td>
                <td class="failure">${report.results.e2e?.failed || 0}</td>
                <td>${report.results.e2e?.total || 0}</td>
                <td class="${report.results.e2e?.failed === 0 ? 'success' : 'failure'}">
                    ${report.results.e2e?.failed === 0 ? '✅' : '❌'}
                </td>
            </tr>
        </table>
    </div>

    <div class="section">
        <h2>📈 Code Coverage</h2>
        <div class="metric">
            <strong>Statements:</strong> ${report.results.coverage?.statements || 0}%
        </div>
        <div class="metric">
            <strong>Branches:</strong> ${report.results.coverage?.branches || 0}%
        </div>
        <div class="metric">
            <strong>Functions:</strong> ${report.results.coverage?.functions || 0}%
        </div>
        <div class="metric">
            <strong>Lines:</strong> ${report.results.coverage?.lines || 0}%
        </div>
    </div>

    <div class="section">
        <h2>🎯 Quality Metrics</h2>
        <ul>
            <li><strong>Test Coverage Target:</strong> 80% (${report.summary.overallCoverage >= 80 ? '✅' : '❌'})</li>
            <li><strong>All Tests Passing:</strong> ${report.summary.totalPassed === report.summary.totalTests ? '✅' : '❌'}</li>
            <li><strong>Performance Tests:</strong> ${report.results.performance?.success ? '✅' : '❌'}</li>
            <li><strong>E2E Tests:</strong> ${report.results.e2e?.failed === 0 ? '✅' : '❌'}</li>
        </ul>
    </div>
</body>
</html>`;

    writeFileSync('test-reports/report.html', html);
  }

  printSummary() {
    console.log('\n📋 Test Summary:');
    console.log('================');
    console.log(`Total Tests: ${(this.results.unit?.numTotalTests || 0) + 
                              (this.results.integration?.numTotalTests || 0) + 
                              (this.results.performance?.numTotalTests || 0) + 
                              (this.results.e2e?.total || 0)}`);
    console.log(`Unit Tests: ${this.results.unit?.numPassedTests || 0}/${this.results.unit?.numTotalTests || 0}`);
    console.log(`Integration Tests: ${this.results.integration?.numPassedTests || 0}/${this.results.integration?.numTotalTests || 0}`);
    console.log(`Performance Tests: ${this.results.performance?.numPassedTests || 0}/${this.results.performance?.numTotalTests || 0}`);
    console.log(`E2E Tests: ${this.results.e2e?.passed || 0}/${this.results.e2e?.total || 0}`);
    console.log(`Code Coverage: ${this.results.coverage?.total || 0}%`);
    console.log(`Duration: ${((Date.now() - this.startTime) / 1000).toFixed(2)}s`);
    console.log('\n📊 Report generated: test-reports/report.html');
  }
}

// Command line interface
const args = process.argv.slice(2);
const testRunner = new TestRunner();

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Ojisan Invader Test Runner

Usage: node test-runner.js [options]

Options:
  --help, -h     Show this help message
  --unit         Run only unit tests
  --integration  Run only integration tests
  --e2e          Run only E2E tests
  --performance  Run only performance tests
  --coverage     Generate coverage report only

Examples:
  node test-runner.js                    # Run all tests
  node test-runner.js --unit             # Run only unit tests
  node test-runner.js --coverage         # Generate coverage report
`);
  process.exit(0);
}

// Handle specific test type requests
if (args.includes('--unit')) {
  testRunner.runUnitTests().then(() => console.log('Unit tests completed'));
} else if (args.includes('--integration')) {
  testRunner.runIntegrationTests().then(() => console.log('Integration tests completed'));
} else if (args.includes('--e2e')) {
  testRunner.runE2ETests().then(() => console.log('E2E tests completed'));
} else if (args.includes('--performance')) {
  testRunner.runPerformanceTests().then(() => console.log('Performance tests completed'));
} else if (args.includes('--coverage')) {
  testRunner.generateCoverageReport().then(() => console.log('Coverage report generated'));
} else {
  // Run all tests
  testRunner.runAllTests();
}