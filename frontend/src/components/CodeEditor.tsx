import { Editor } from '@monaco-editor/react';
import { useEffect, useState } from 'react';

interface CodeEditorProps {
    code: string;
    onChange: (value: string) => void;
    language?: string;
}

export default function CodeEditor({ code, onChange, language = 'javascript' }: CodeEditorProps) {
    const [value, setValue] = useState(code);

    useEffect(() => {
        setValue(code);
    }, [code]);

    const handleEditorChange = (value: string | undefined) => {
        if (value !== undefined) {
            setValue(value);
            onChange(value);
        }
    };

    return (
        <div className="h-full w-full">
            <Editor
                height="100%"
                defaultLanguage="javascript"
                language={language}
                value={value}
                theme="vs-dark"
                onChange={handleEditorChange}
                options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    automaticLayout: true,
                }}
            />
        </div>
    );
}
