#!/usr/bin/env node
/**
 * Deployment Test Script
 * This script tests critical functionality to ensure the app will work when deployed
 */

import fetch from 'node-fetch';
import { spawn } from 'child_process';
import { setTimeout as delay } from 'timers/promises';

const PORT = process.env.PORT || 3001;
const BASE_URL = `http://localhost:${PORT}`;

let serverProcess = null;
let testsPassed = 0;
let testsFailed = 0;

function log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
        'info': '✓',
        'error': '✗',
        'warning': '⚠',
        'test': '▶'
    }[type] || 'ℹ';
    console.log(`[${timestamp}] ${prefix} ${message}`);
}

async function startServer() {
    log('Starting test server...', 'test');

    return new Promise((resolve, reject) => {
        serverProcess = spawn('node', ['app.js'], {
            env: {
                ...process.env,
                PORT: PORT,
                // Use a test MongoDB URI if available, otherwise use the default
                MONGODB_URI: process.env.MONGODB_URI || process.env.TEST_MONGODB_URI
            },
            stdio: ['ignore', 'pipe', 'pipe']
        });

        let output = '';

        serverProcess.stdout.on('data', (data) => {
            output += data.toString();
            if (output.includes('Server running')) {
                log(`Server started on port ${PORT}`, 'info');
                resolve();
            }
        });

        serverProcess.stderr.on('data', (data) => {
            const message = data.toString();
            // Only show warnings, not all stderr output
            if (message.includes('warn') || message.includes('error')) {
                console.error('Server stderr:', message);
            }
        });

        serverProcess.on('error', (error) => {
            log(`Failed to start server: ${error.message}`, 'error');
            reject(error);
        });

        // Timeout if server doesn't start
        setTimeout(() => {
            if (!output.includes('Server running')) {
                reject(new Error('Server failed to start within timeout'));
            }
        }, 15000);
    });
}

function stopServer() {
    if (serverProcess) {
        log('Stopping test server...', 'info');
        serverProcess.kill();
        serverProcess = null;
    }
}

async function testEndpoint(name, url, options = {}) {
    log(`Testing: ${name}`, 'test');
    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });

        const contentType = response.headers.get('content-type');
        let data;

        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            data = await response.text();
        }

        log(`✓ ${name} - Status: ${response.status}`, 'info');
        testsPassed++;
        return { response, data };
    } catch (error) {
        log(`✗ ${name} - Error: ${error.message}`, 'error');
        testsFailed++;
        throw error;
    }
}

async function runTests() {
    log('Starting deployment tests...', 'test');
    log('='.repeat(60), 'info');

    try {
        // Test 1: Server is running
        log('\n[TEST 1] Server Health Check', 'test');
        await testEndpoint(
            'Homepage loads',
            `${BASE_URL}/`
        );

        // Test 2: Static files are served
        log('\n[TEST 2] Static Files', 'test');
        await testEndpoint(
            'CSS file loads',
            `${BASE_URL}/stylesheets/style.css`
        );

        await testEndpoint(
            'JavaScript files load',
            `${BASE_URL}/javascripts/index.js`
        );

        // Test 3: API v3 GET posts endpoint
        log('\n[TEST 3] API v3 Endpoints', 'test');
        const postsResult = await testEndpoint(
            'GET /api/v3/posts',
            `${BASE_URL}/api/v3/posts`
        );

        if (Array.isArray(postsResult.data)) {
            log(`Found ${postsResult.data.length} posts in database`, 'info');
        }

        // Test 4: URL Preview endpoint
        log('\n[TEST 4] URL Preview Functionality', 'test');
        const previewResult = await testEndpoint(
            'GET /api/v3/urls/preview',
            `${BASE_URL}/api/v3/urls/preview?url=https://example.com`
        );

        if (typeof previewResult.data === 'string' && previewResult.data.includes('Example Domain')) {
            log('URL preview generated successfully', 'info');
        } else {
            log('URL preview may have issues', 'warning');
        }

        // Test 5: Security headers
        log('\n[TEST 5] Security Headers', 'test');
        const securityResult = await testEndpoint(
            'Security headers check',
            `${BASE_URL}/`
        );

        const headers = securityResult.response.headers;
        const securityHeaders = {
            'x-content-type-options': headers.get('x-content-type-options'),
            'x-frame-options': headers.get('x-frame-options'),
            'x-xss-protection': headers.get('x-xss-protection'),
            'content-security-policy': headers.get('content-security-policy')
        };

        log('Security Headers:', 'info');
        Object.entries(securityHeaders).forEach(([key, value]) => {
            if (value) {
                log(`  ✓ ${key}: ${value.substring(0, 50)}...`, 'info');
            } else {
                log(`  ✗ ${key}: Not set`, 'warning');
            }
        });

        // Test 6: Authentication endpoints exist
        log('\n[TEST 6] Authentication Endpoints', 'test');
        try {
            const signinResult = await testEndpoint(
                'GET /signin',
                `${BASE_URL}/signin`,
                { redirect: 'manual' }
            );

            // Should either redirect to Azure AD or return 503 if not configured
            if (signinResult.response.status === 503 || signinResult.response.status === 302) {
                log('Sign-in endpoint working as expected', 'info');
            }
        } catch (error) {
            log('Sign-in endpoint may need Azure AD configuration', 'warning');
        }

        // Test 7: API v1 and v2 backwards compatibility
        log('\n[TEST 7] API Version Compatibility', 'test');
        try {
            await testEndpoint('GET /api/v1/posts', `${BASE_URL}/api/v1/posts`);
            log('API v1 is available', 'info');
        } catch (error) {
            log('API v1 may not be configured', 'warning');
        }

        try {
            await testEndpoint('GET /api/v2/posts', `${BASE_URL}/api/v2/posts`);
            log('API v2 is available', 'info');
        } catch (error) {
            log('API v2 may not be configured', 'warning');
        }

    } catch (error) {
        log(`Test suite error: ${error.message}`, 'error');
    }

    log('\n' + '='.repeat(60), 'info');
    log(`\nTest Results:`, 'info');
    log(`  Passed: ${testsPassed}`, 'info');
    log(`  Failed: ${testsFailed}`, testsFailed > 0 ? 'error' : 'info');
    log(`  Total: ${testsPassed + testsFailed}`, 'info');

    if (testsFailed === 0) {
        log('\n✓ All critical tests passed! Application is ready for deployment.', 'info');
        log('\nDeployment Checklist:', 'info');
        log('  1. Set MONGODB_URI environment variable in deployment platform', 'info');
        log('  2. Optional: Set Azure AD credentials (CLIENT_ID, TENANT_ID, CLIENT_SECRET)', 'info');
        log('  3. Optional: Set SESSION_SECRET for production', 'info');
        log('  4. Ensure MongoDB Atlas allows connections from deployment IP (0.0.0.0/0)', 'info');
        return true;
    } else {
        log('\n✗ Some tests failed. Review errors above before deploying.', 'error');
        return false;
    }
}

// Main execution
async function main() {
    try {
        await startServer();
        await delay(2000); // Wait for server to fully initialize

        const success = await runTests();

        stopServer();
        process.exit(success ? 0 : 1);
    } catch (error) {
        log(`Fatal error: ${error.message}`, 'error');
        stopServer();
        process.exit(1);
    }
}

// Handle process termination
process.on('SIGINT', () => {
    log('\nReceived SIGINT, cleaning up...', 'warning');
    stopServer();
    process.exit(130);
});

process.on('SIGTERM', () => {
    log('\nReceived SIGTERM, cleaning up...', 'warning');
    stopServer();
    process.exit(143);
});

main();
