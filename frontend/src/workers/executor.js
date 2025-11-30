self.onmessage = function(e) {
    const code = e.data;
    const logs = [];
    
    // Override console methods to capture output
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;
    
    console.log = (...args) => {
        logs.push(args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' '));
    };
    
    console.error = (...args) => {
        logs.push('ERROR: ' + args.map(arg => String(arg)).join(' '));
    };
    
    console.warn = (...args) => {
        logs.push('WARNING: ' + args.map(arg => String(arg)).join(' '));
    };
    
    try {
        // Execute the code
        eval(code);
        
        // Restore console methods
        console.log = originalLog;
        console.error = originalError;
        console.warn = originalWarn;
        
        self.postMessage({
            type: 'success',
            logs: logs.length > 0 ? logs : ['(no output)']
        });
    } catch (error) {
        // Restore console methods
        console.log = originalLog;
        console.error = originalError;
        console.warn = originalWarn;
        
        self.postMessage({
            type: 'error',
            logs: logs,
            error: error.message
        });
    }
};
