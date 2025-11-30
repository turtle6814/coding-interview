import Editor from '@monaco-editor/react';

interface CodeEditorProps {
    code: string;
    language: string;
    onChange: (value: string) => void;
}

export default function CodeEditor({ code, language, onChange }: CodeEditorProps) {
    // Map our language IDs to Monaco language IDs
    const getMonacoLanguage = (lang: string): string => {
        const languageMap: Record<string, string> = {
            'javascript': 'javascript',
            'typescript': 'typescript',
            'python': 'python',
            'java': 'java',
            'cpp': 'cpp',
            'c': 'c',
            'csharp': 'csharp',
            'go': 'go',
            'rust': 'rust',
            'php': 'php',
            'ruby': 'ruby',
            'swift': 'swift',
            'kotlin': 'kotlin',
        };
        return languageMap[lang] || 'javascript';
    };

    return (
        <Editor
            height="100%"
            language={getMonacoLanguage(language)}
            value={code}
            onChange={(value) => onChange(value || '')}
            theme="vs-dark"
            options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                roundedSelection: true,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                wordWrap: 'on',
            }}
        />
    );
}
