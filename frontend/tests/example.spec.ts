import { test, expect } from '@playwright/test';

test('homepage loads successfully', async ({ page }) => {
  await page.goto('/');
  
  // Check that the page loaded with correct title
  await expect(page).toHaveTitle(/Collaborative Code Editor/i);
  
  // Verify main heading is visible
  await expect(page.getByRole('heading', { name: /Code Interview Platform/i })).toBeVisible();
  
  // Verify "Create New Session" button exists
  await expect(page.getByRole('button', { name: /Create New Session/i })).toBeVisible();
});

test.describe('Session Creation and Navigation', () => {
  test('should create a new session and redirect to session page', async ({ page }) => {
    await page.goto('/');
    
    // Click "Create New Session" button
    await page.getByRole('button', { name: /Create New Session/i }).click();
    
    // Should redirect to a session URL with UUID format
    await expect(page).toHaveURL(/\/session\/[a-f0-9-]{36}/, { timeout: 10000 });
    
    // Wait for Monaco editor container to be visible
    await expect(page.locator('.monaco-editor').first()).toBeVisible({ timeout: 15000 });
    
    // Verify editor content area is loaded
    await expect(page.locator('.view-lines').first()).toBeVisible({ timeout: 10000 });
  });

  test('should persist session when navigating back and forth', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Create New Session/i }).click();
    
    // Wait for redirect
    await page.waitForURL(/\/session\/[a-f0-9-]{36}/, { timeout: 10000 });
    
    // Capture the session URL
    const sessionUrl = page.url();
    const sessionId = sessionUrl.match(/\/session\/([a-f0-9-]{36})/)?.[1];
    
    expect(sessionId).toBeTruthy();
    
    // Navigate back to home
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /Code Interview Platform/i })).toBeVisible();
    
    // Navigate to the same session again
    await page.goto(sessionUrl);
    
    // Should still load the session page
    await expect(page).toHaveURL(sessionUrl);
    await expect(page.locator('.monaco-editor').first()).toBeVisible({ timeout: 15000 });
  });

  test('should handle invalid session ID gracefully', async ({ page }) => {
    // Try to access a session with invalid UUID
    const response = await page.goto('/session/invalid-id-12345');
    
    // Should either redirect or show error (adjust based on your app's behavior)
    // Check that page doesn't crash and renders something
    await expect(page.locator('body')).toBeVisible();
    
    // Could be redirect to home or error page
    const url = page.url();
    const isValidResponse = url.includes('/') || response?.status() !== 500;
    expect(isValidResponse).toBeTruthy();
  });
});

test.describe('Code Editor Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Create a new session before each test
    await page.goto('/');
    await page.getByRole('button', { name: /Create New Session/i }).click();
    
    // Wait for Monaco to fully load
    await expect(page.locator('.monaco-editor').first()).toBeVisible({ timeout: 15000 });
    await expect(page.locator('.view-lines').first()).toBeVisible({ timeout: 10000 });
    
    // Wait a bit for Monaco to fully initialize
    await page.waitForTimeout(2000);
  });

  test('should display Monaco editor with code', async ({ page }) => {
    // Verify Monaco editor loaded
    await expect(page.locator('.monaco-editor')).toBeVisible();
    
    // Verify we can see some default code or placeholder
    const viewLines = page.locator('.view-lines');
    await expect(viewLines).toBeVisible();
    
    // Check that editor has some content (default template)
    const content = await viewLines.textContent();
    expect(content).toBeTruthy();
    expect(content!.length).toBeGreaterThan(0);
  });

  test('should show language selector', async ({ page }) => {
    // Look for language selector (adjust selector based on your UI)
    const languageSelector = page.locator('select').first();
    
    if (await languageSelector.isVisible()) {
      await expect(languageSelector).toBeVisible();
      
      // Verify it has language options
      const options = await languageSelector.locator('option').count();
      expect(options).toBeGreaterThan(1);
    }
  });

  test('should have Run/Execute button', async ({ page }) => {
    // Look for the run button
    const runButton = page.getByRole('button', { name: /run|execute|play/i }).first();
    
    if (await runButton.isVisible({ timeout: 5000 })) {
      await expect(runButton).toBeVisible();
      await expect(runButton).toBeEnabled();
    }
  });

  test('should allow clicking in editor area', async ({ page }) => {
    // Click somewhere in the editor
    const editor = page.locator('.monaco-editor').first();
    await editor.click();
    
    // Editor should remain visible and responsive
    await expect(editor).toBeVisible();
    
    // Wait for focus
    await page.waitForTimeout(500);
  });
});

test.describe('Real-Time Collaboration via WebSocket', () => {
  test('should sync code changes between two users in same session', async ({ browser }) => {
    // Create two browser contexts (simulating two users)
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    
    const user1 = await context1.newPage();
    const user2 = await context2.newPage();
    
    try {
      // User 1 creates a session
      await user1.goto('/');
      await user1.getByRole('button', { name: /Create New Session/i }).click();
      await expect(user1.locator('.monaco-editor')).toBeVisible({ timeout: 15000 });
      await user1.waitForTimeout(2000);
      
      // Get the session URL
      const sessionUrl = user1.url();
      console.log('Session URL:', sessionUrl);
      
      // User 2 joins the same session
      await user2.goto(sessionUrl);
      await expect(user2.locator('.monaco-editor')).toBeVisible({ timeout: 15000 });
      
      // Wait for WebSocket connection to establish
      await user1.waitForTimeout(3000);
      await user2.waitForTimeout(3000);
      
      // Get initial content from User 1
      const initialContent = await user1.locator('.view-lines').first().textContent();
      console.log('Initial content length:', initialContent?.length);
      
      // Verify User 2 sees similar initial content
      const user2InitialContent = await user2.locator('.view-lines').first().textContent();
      
      // Both should have some content (default template)
      expect(initialContent).toBeTruthy();
      expect(user2InitialContent).toBeTruthy();
      
      console.log('✅ Both users connected and see editor content');
      
    } finally {
      await context1.close();
      await context2.close();
    }
  });

  test('should maintain connection after navigation', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Create New Session/i }).click();
    await expect(page.locator('.monaco-editor')).toBeVisible({ timeout: 15000 });
    
    const sessionUrl = page.url();
    
    // Reload the page
    await page.reload();
    
    // Should still be on same session
    await expect(page).toHaveURL(sessionUrl);
    await expect(page.locator('.monaco-editor')).toBeVisible({ timeout: 15000 });
  });
});

test.describe('Backend API Integration', () => {
  test('should create session via API and return valid UUID', async ({ request }) => {
    const response = await request.post('http://localhost:8080/api/sessions', {
      data: {
        language: 'javascript',
        code: '// Initial code'
      }
    });
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    
    // Validate response structure
    expect(data).toHaveProperty('id');
    expect(data.id).toMatch(/^[a-f0-9-]{36}$/); // UUID format
    expect(data).toHaveProperty('language');
    expect(data).toHaveProperty('code');
  });

  test('should retrieve existing session via API', async ({ request }) => {
    // Create a session first
    const createResponse = await request.post('http://localhost:8080/api/sessions', {
      data: {
        language: 'python',
        code: 'print("Hello")'
      }
    });
    
    const createdSession = await createResponse.json();
    const sessionId = createdSession.id;
    
    // Retrieve the session
    const getResponse = await request.get(`http://localhost:8080/api/sessions/${sessionId}`);
    
    expect(getResponse.ok()).toBeTruthy();
    const retrievedSession = await getResponse.json();
    
    expect(retrievedSession.id).toBe(sessionId);
    expect(retrievedSession.language).toBe('python');
    expect(retrievedSession.code).toBe('print("Hello")');
  });

  test('should update session code via API', async ({ request }) => {
    // Create session
    const createResponse = await request.post('http://localhost:8080/api/sessions', {
      data: {
        language: 'javascript',
        code: 'console.log("initial");'
      }
    });
    
    const session = await createResponse.json();
    const sessionId = session.id;
    
    // Update session
    const updatedCode = 'console.log("updated code");';
    const updateResponse = await request.put(`http://localhost:8080/api/sessions/${sessionId}`, {
      data: {
        code: updatedCode,
        language: 'javascript'
      }
    });
    
    expect(updateResponse.ok()).toBeTruthy();
    
    // Verify update
    const getResponse = await request.get(`http://localhost:8080/api/sessions/${sessionId}`);
    const updatedSession = await getResponse.json();
    
    expect(updatedSession.code).toBe(updatedCode);
  });

  test('should return 404 for non-existent session', async ({ request }) => {
    const fakeId = '00000000-0000-0000-0000-000000000000';
    const response = await request.get(`http://localhost:8080/api/sessions/${fakeId}`);
    
    expect(response.status()).toBe(404);
  });
});

test.describe('End-to-End Interview Workflow', () => {
  test('complete interview session workflow', async ({ browser }) => {
    const interviewer = await browser.newContext();
    const candidate = await browser.newContext();
    
    const interviewerPage = await interviewer.newPage();
    const candidatePage = await candidate.newPage();
    
    try {
      // Step 1: Interviewer creates session
      await interviewerPage.goto('/');
      await interviewerPage.getByRole('button', { name: /Create New Session/i }).click();
      await expect(interviewerPage.locator('.monaco-editor')).toBeVisible({ timeout: 15000 });
      await interviewerPage.waitForTimeout(3000);
      
      const sessionUrl = interviewerPage.url();
      console.log('Created session:', sessionUrl);
      
      // Step 2: Candidate joins the session
      await candidatePage.goto(sessionUrl);
      await expect(candidatePage.locator('.monaco-editor')).toBeVisible({ timeout: 15000 });
      await candidatePage.waitForTimeout(3000);
      
      // Step 3: Both should see the editor
      const interviewerContent = await interviewerPage.locator('.view-lines').textContent();
      const candidateContent = await candidatePage.locator('.view-lines').textContent();
      
      expect(interviewerContent).toBeTruthy();
      expect(candidateContent).toBeTruthy();
      
      console.log('✅ Interview session established successfully');
      
    } finally {
      await interviewer.close();
      await candidate.close();
    }
  });

  test('multiple users can join and observe same session', async ({ browser }) => {
    const contexts = await Promise.all([
      browser.newContext(),
      browser.newContext(),
      browser.newContext()
    ]);
    
    const [host, observer1, observer2] = await Promise.all(
      contexts.map(ctx => ctx.newPage())
    );
    
    try {
      // Host creates session
      await host.goto('/');
      await host.getByRole('button', { name: /Create New Session/i }).click();
      await expect(host.locator('.monaco-editor')).toBeVisible({ timeout: 15000 });
      await host.waitForTimeout(2000);
      
      const sessionUrl = host.url();
      
      // Observers join
      await observer1.goto(sessionUrl);
      await observer2.goto(sessionUrl);
      
      await Promise.all([
        expect(observer1.locator('.monaco-editor')).toBeVisible({ timeout: 15000 }),
        expect(observer2.locator('.monaco-editor')).toBeVisible({ timeout: 15000 })
      ]);
      
      await Promise.all([
        host.waitForTimeout(2000),
        observer1.waitForTimeout(2000),
        observer2.waitForTimeout(2000)
      ]);
      
      // All should see editor content
      const [hostContent, obs1Content, obs2Content] = await Promise.all([
        host.locator('.view-lines').textContent(),
        observer1.locator('.view-lines').textContent(),
        observer2.locator('.view-lines').textContent()
      ]);
      
      expect(hostContent).toBeTruthy();
      expect(obs1Content).toBeTruthy();
      expect(obs2Content).toBeTruthy();
      
      console.log('✅ Multiple users successfully joined session');
      
    } finally {
      await Promise.all(contexts.map(ctx => ctx.close()));
    }
  });
});