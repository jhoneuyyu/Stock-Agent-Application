import React, { useState } from 'react';
import { Copy, Check, Download, ChevronDown, ChevronUp, FileText } from 'lucide-react';

interface ReportCardProps {
    title?: string;
    content: React.ReactNode;
    rawContent: string;
}

export default function ReportCard({ title = "Analysis Report", content, rawContent }: ReportCardProps) {
    const [isCopied, setIsCopied] = useState(false);
    const [isExpanded, setIsExpanded] = useState(true);

    const handleCopy = () => {
        navigator.clipboard.writeText(rawContent);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="w-full bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
                <div className="flex items-center gap-2 text-gray-700">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-sm">{title}</span>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={handleCopy}
                        className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Copy to clipboard"
                    >
                        {isCopied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            {/* Content */}
            {isExpanded && (
                <div className="p-6 bg-white text-gray-900">
                    {content}
                </div>
            )}
        </div>
    );
}
