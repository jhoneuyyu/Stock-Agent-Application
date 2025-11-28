import React from 'react';
import { ArrowRight, CheckCircle2, Circle } from 'lucide-react';

const steps = [
    { id: 'query', label: 'User Query' },
    { id: 'data', label: 'Data Retrieval' },
    { id: 'filter', label: 'Market Filtering' },
    { id: 'risk', label: 'Risk Assessment' },
    { id: 'report', label: 'Final Report' },
];

export default function WorkflowVis() {
    return (
        <div className="w-full overflow-x-auto p-4 mb-6 bg-white/5 border border-white/10 rounded-xl">
            <div className="flex items-center min-w-max gap-2 text-sm">
                {steps.map((step, index) => (
                    <React.Fragment key={step.id}>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span className="font-medium whitespace-nowrap">{step.label}</span>
                        </div>
                        {index < steps.length - 1 && (
                            <ArrowRight className="w-4 h-4 text-gray-600 flex-shrink-0" />
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
}
