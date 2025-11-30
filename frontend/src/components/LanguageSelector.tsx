import { Code2 } from 'lucide-react';

interface LanguageSelectorProps {
    value: string;
    onChange: (language: string) => void;
    disabled?: boolean;
}

const languages = [
    { id: 'javascript', name: 'JavaScript', ext: '.js' },
    { id: 'typescript', name: 'TypeScript', ext: '.ts' },
    { id: 'python', name: 'Python', ext: '.py' },
    { id: 'java', name: 'Java', ext: '.java' },
    { id: 'cpp', name: 'C++', ext: '.cpp' },
    { id: 'c', name: 'C', ext: '.c' },
    { id: 'csharp', name: 'C#', ext: '.cs' },
    { id: 'go', name: 'Go', ext: '.go' },
    { id: 'rust', name: 'Rust', ext: '.rs' },
    { id: 'php', name: 'PHP', ext: '.php' },
    { id: 'ruby', name: 'Ruby', ext: '.rb' },
    { id: 'swift', name: 'Swift', ext: '.swift' },
    { id: 'kotlin', name: 'Kotlin', ext: '.kt' },
];

export default function LanguageSelector({ value, onChange, disabled }: LanguageSelectorProps) {
    return (
        <div className="flex items-center space-x-2">
            <Code2 size={18} className="text-gray-400" />
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                className="bg-gray-700 text-white px-3 py-1.5 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {languages.map((lang) => (
                    <option key={lang.id} value={lang.id}>
                        {lang.name}
                    </option>
                ))}
            </select>
        </div>
    );
}