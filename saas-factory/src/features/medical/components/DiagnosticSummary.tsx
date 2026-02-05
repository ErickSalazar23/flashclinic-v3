import React from 'react';
import { Diagnostic } from '../types';

interface DiagnosticSummaryProps {
  diagnostic: Diagnostic;
}

export const DiagnosticSummary: React.FC<DiagnosticSummaryProps> = ({ diagnostic }) => {
  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/20 text-red-500 border-red-500/50';
      case 'severe': return 'bg-orange-500/20 text-orange-500 border-orange-500/50';
      case 'moderate': return 'bg-amber-500/20 text-amber-500 border-amber-500/50';
      default: return 'bg-emerald-500/20 text-emerald-500 border-emerald-500/50';
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
            <h2 className="text-2xl font-bold text-white mb-2">Diagnóstico de Hemorragia</h2>
            <p className="text-slate-400">Análisis operativo basado en métricas reales de la clínica.</p>
        </div>
        <div className={`px-4 py-2 rounded-full border text-sm font-bold uppercase tracking-widest ${getSeverityStyles(diagnostic.severity)}`}>
            ESTADO: {diagnostic.severity}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
            <div className="p-6 rounded-xl bg-black/20 border border-white/5">
                <h4 className="text-slate-400 text-sm font-medium mb-4 uppercase">Interpretación Clínica</h4>
                <div className="prose prose-invert max-w-none text-slate-300">
                    {diagnostic.diagnosticText.split('\n').map((line, i) => (
                        <p key={i} className="mb-2 leading-relaxed">{line.replace(/\*\*/g, '')}</p>
                    ))}
                </div>
            </div>
        </div>

        <div className="space-y-6">
            <h4 className="text-slate-400 text-sm font-medium uppercase tracking-wider">Tratamiento Recomendado</h4>
            <div className="flex flex-col gap-4">
                {diagnostic.recommendations.map((rec, i) => (
                    <div key={i} className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/10 transition-colors hover:bg-white/10">
                        <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${
                            rec.priority === 'critical' ? 'bg-red-500' : 
                            rec.priority === 'high' ? 'bg-orange-500' : 'bg-blue-500'
                        }`} />
                        <div>
                            <h5 className="font-semibold text-white text-sm mb-1">{rec.title}</h5>
                            <p className="text-slate-400 text-xs leading-relaxed">{rec.description}</p>
                            <div className="mt-2 text-[10px] font-bold text-emerald-400 uppercase tracking-tighter">
                                IMPACTO: {rec.impact}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};
