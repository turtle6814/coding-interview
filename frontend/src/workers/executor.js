self.onmessage = (e) => {
    const code = e.data;
    let logs = [];
    const originalConsoleLog = console.log;

    // Capture console.log
    console.log = (...args) => {
        logs.push(args.map(arg => String(arg)).join(' '));
    };

    try {
        // Basic sandboxing using Function constructor (not perfect security but standard for browser-side)
        // For better security, we would use an iframe or a more complex sandbox.
        // But for "interview" context, this is often sufficient for JS.
        new Function(code)();
        self.postMessage({ type: 'success', logs });
    } catch (error) {
        self.postMessage({ type: 'error', error: error.toString(), logs });
    } finally {
        console.log = originalConsoleLog;
    }
};
