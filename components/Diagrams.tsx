
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, Activity, Cpu, BarChart2 } from 'lucide-react';

// --- SURFACE CODE DIAGRAM ---
export const SurfaceCodeDiagram: React.FC = () => {
  // 3x3 grid of data qubits (9 total)
  // Interspersed with 4 stabilizers (checkers)
  const [errors, setErrors] = useState<number[]>([]);
  
  // Map data qubit indices (0-8) to affected stabilizers (0-3)
  // Layout:
  // D0  S0  D1
  // S1  D4  S2
  // D3  S3  D5
  // (Simplified layout for viz)
  
  // Adjacency list: DataQubit Index -> Stabilizer Indices
  const adjacency: Record<number, number[]> = {
    0: [0, 1],
    1: [0, 2],
    2: [1, 3],
    3: [2, 3],
    4: [0, 1, 2, 3], // Center affects all in this simplified tightly packed model
  };

  const toggleError = (id: number) => {
    setErrors(prev => prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]);
  };

  // Calculate active stabilizers based on parity (even errors = off, odd errors = on)
  const activeStabilizers = [0, 1, 2, 3].filter(stabId => {
    let errorCount = 0;
    Object.entries(adjacency).forEach(([dataId, stabs]) => {
        if (errors.includes(parseInt(dataId)) && stabs.includes(stabId)) {
            errorCount++;
        }
    });
    return errorCount % 2 !== 0;
  });

  return (
    <div className="flex flex-col items-center p-8 bg-white rounded-xl shadow-sm border border-stone-200 my-8">
      <h3 className="font-serif text-xl mb-4 text-stone-800">Interactive: Surface Code Detection</h3>
      <p className="text-sm text-stone-500 mb-6 text-center max-w-md">
        Click the grey <strong>Data Qubits</strong> to inject errors. Watch the colored <strong>Stabilizers</strong> light up when they detect an odd number of errors.
      </p>
      
      <div className="relative w-64 h-64 bg-[#F5F4F0] rounded-lg border border-stone-200 p-4 flex flex-wrap justify-between content-between relative">
         {/* Grid Lines */}
         <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-20">
            <div className="w-2/3 h-2/3 border border-stone-400"></div>
            <div className="absolute w-full h-[1px] bg-stone-400"></div>
            <div className="absolute h-full w-[1px] bg-stone-400"></div>
         </div>

         {/* Stabilizers (Z=Blue, X=Red) - positioned absolutely for control */}
         {[
             {id: 0, x: '50%', y: '20%', type: 'Z', color: 'bg-blue-500', name: 'Z-Stabilizer'},
             {id: 1, x: '20%', y: '50%', type: 'X', color: 'bg-red-500', name: 'X-Stabilizer'},
             {id: 2, x: '80%', y: '50%', type: 'X', color: 'bg-red-500', name: 'X-Stabilizer'},
             {id: 3, x: '50%', y: '80%', type: 'Z', color: 'bg-blue-500', name: 'Z-Stabilizer'},
         ].map(stab => {
             const isActive = activeStabilizers.includes(stab.id);
             return (
                 <div key={`stab-${stab.id}`} className="absolute group z-20" style={{ left: stab.x, top: stab.y }}>
                     <motion.div
                        className={`absolute w-10 h-10 -ml-5 -mt-5 flex items-center justify-center text-white text-xs font-bold rounded-sm ${isActive ? stab.color : 'bg-stone-300'}`}
                        initial={false}
                        animate={
                            isActive 
                                ? { 
                                    scale: [1.1, 1.25, 1.1], 
                                    opacity: 1,
                                    boxShadow: stab.type === 'Z' 
                                        ? ['0px 0px 0px rgba(59, 130, 246, 0.4)', '0px 0px 20px rgba(59, 130, 246, 0.8)', '0px 0px 0px rgba(59, 130, 246, 0.4)']
                                        : ['0px 0px 0px rgba(239, 68, 68, 0.4)', '0px 0px 20px rgba(239, 68, 68, 0.8)', '0px 0px 0px rgba(239, 68, 68, 0.4)']
                                  } 
                                : { scale: 1, opacity: 0.4, boxShadow: 'none' }
                        }
                        transition={
                            isActive
                                ? { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
                                : { duration: 0.3 }
                        }
                     >
                         {stab.type}
                     </motion.div>
                     <div className="absolute bottom-full mb-6 w-max px-2 py-1 bg-stone-900 text-stone-100 text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 transform -translate-x-1/2 left-0 shadow-lg border border-stone-700">
                         {stab.name} <span className="text-stone-400 ml-1">({isActive ? 'Violation detected' : 'Parity normal'})</span>
                     </div>
                 </div>
             );
         })}

         {/* Data Qubits */}
         {[
             {id: 0, x: '20%', y: '20%'}, {id: 1, x: '80%', y: '20%'},
             {id: 4, x: '50%', y: '50%'}, // Center
             {id: 2, x: '20%', y: '80%'}, {id: 3, x: '80%', y: '80%'},
         ].map(q => {
             const isError = errors.includes(q.id);
             return (
                 <div key={`data-${q.id}`} className="absolute group z-30" style={{ left: q.x, top: q.y }}>
                     <button
                        onClick={() => toggleError(q.id)}
                        className={`absolute w-8 h-8 -ml-4 -mt-4 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${isError ? 'bg-stone-900 border-red-500 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'bg-white border-stone-300 hover:border-stone-500 hover:bg-stone-50'}`}
                     >
                        {isError && (
                            <motion.div
                                animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                            >
                                <Activity size={14} />
                            </motion.div>
                        )}
                     </button>
                     <div className="absolute bottom-full mb-5 w-max px-2 py-1 bg-stone-900 text-stone-100 text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 transform -translate-x-1/2 left-0 shadow-lg border border-stone-700">
                         {isError ? "Remove Error" : "Inject Error"}
                     </div>
                 </div>
             );
         })}
      </div>

      <div className="mt-6 flex items-center gap-4 text-xs font-mono text-stone-500">
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-stone-800"></div> Error</div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-blue-500"></div> Z-Check</div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-red-500"></div> X-Check</div>
      </div>
      
      <div className={`mt-4 h-6 text-sm font-serif italic flex items-center gap-2 transition-colors duration-300 ${errors.length > 0 ? 'text-red-500 font-medium' : 'text-stone-600'}`}>
        {errors.length === 0 ? "System is stable." : (
            <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                Detected {activeStabilizers.length} parity violations.
            </>
        )}
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-3 w-full max-w-sm">
        <button 
          onClick={() => setErrors([])}
          disabled={errors.length === 0}
          className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded border border-stone-300 text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Clear Errors
        </button>
        <button 
          onClick={() => setErrors([4])} // Center qubit
          className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded bg-stone-900 text-white hover:bg-stone-800 transition-colors"
        >
          Single Error
        </button>
        <button 
          onClick={() => setErrors([0, 4])} // Correlated/adjacent
          className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded bg-stone-900 text-white hover:bg-stone-800 transition-colors"
        >
          Cross-talk Simulation
        </button>
        <button 
          onClick={() => {
            const randomErrors = [0, 1, 2, 3, 4].filter(() => Math.random() > 0.6);
            setErrors(randomErrors.length > 0 ? randomErrors : [1, 2]); // ensure at least some error
          }}
          className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded bg-nobel-gold text-white hover:bg-nobel-gold/90 transition-colors"
        >
          Random Noise
        </button>
      </div>
    </div>
  );
};

// --- TRANSFORMER DECODER DIAGRAM ---
export const TransformerDecoderDiagram: React.FC = () => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
        setStep(s => (s + 1) % 4);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center p-8 bg-[#F5F4F0] rounded-xl border border-stone-200 my-8">
      <h3 className="font-serif text-xl mb-4 text-stone-900">AlphaQubit Architecture</h3>
      <p className="text-sm text-stone-600 mb-6 text-center max-w-md">
        The model processes syndrome history using a recurrent transformer, attending to spatial and temporal correlations.
      </p>

      <div className="relative w-full max-w-lg h-56 bg-white rounded-lg shadow-inner overflow-hidden mb-6 border border-stone-200 flex items-center justify-center gap-8 p-4">
        
        {/* Input Stage */}
        <div className="flex flex-col items-center gap-2 group relative">
            <div className={`w-16 h-16 rounded-lg border-2 flex flex-col items-center justify-center transition-colors duration-500 ${step === 0 ? 'border-nobel-gold bg-nobel-gold/10' : 'border-stone-200 bg-stone-50'}`}>
                <div className="grid grid-cols-3 gap-1">
                    {[...Array(9)].map((_, i) => <div key={i} className={`w-2 h-2 rounded-full ${Math.random() > 0.7 ? 'bg-stone-800' : 'bg-stone-300'}`}></div>)}
                </div>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-stone-500">Syndrome</span>
            <div className="absolute bottom-full mb-2 w-48 text-center px-3 py-2 bg-stone-900 text-stone-100 text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-50 shadow-xl border border-stone-700">
                 Read out of parity measurements indicating potential errors.
            </div>
        </div>

        {/* Arrows */}
        <motion.div animate={{ opacity: step >= 1 ? 1 : 0.3, x: step >= 1 ? 0 : -5 }}>→</motion.div>

        {/* Transformer Stage */}
        <div className="flex flex-col items-center gap-2 group relative">
             <div className={`w-24 h-24 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-colors duration-500 relative overflow-hidden ${step === 1 || step === 2 ? 'border-stone-800 bg-stone-900 text-white' : 'border-stone-200 bg-stone-50'}`}>
                <Cpu size={24} className={step === 1 || step === 2 ? 'text-nobel-gold animate-pulse' : 'text-stone-300'} />
                {step === 1 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-full h-[1px] bg-nobel-gold absolute top-1/3 animate-ping"></div>
                        <div className="w-full h-[1px] bg-nobel-gold absolute top-2/3 animate-ping delay-75"></div>
                    </div>
                )}
             </div>
             <span className="text-[10px] uppercase font-bold tracking-wider text-stone-500">Transformer</span>
             <div className="absolute bottom-full mb-2 w-48 text-center px-3 py-2 bg-stone-900 text-stone-100 text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-50 shadow-xl border border-stone-700">
                 Recurrent attention mechanism analyzing spatial and temporal correlations.
            </div>
        </div>

        {/* Arrows */}
        <motion.div animate={{ opacity: step >= 3 ? 1 : 0.3, x: step >= 3 ? 0 : -5 }}>→</motion.div>

        {/* Output Stage */}
        <div className="flex flex-col items-center gap-2 group relative">
            <div className={`w-16 h-16 rounded-lg border-2 flex flex-col items-center justify-center transition-colors duration-500 ${step === 3 ? 'border-green-500 bg-green-50' : 'border-stone-200 bg-stone-50'}`}>
                {step === 3 ? (
                    <span className="text-2xl font-serif text-green-600">X</span>
                ) : (
                    <span className="text-2xl font-serif text-stone-300">?</span>
                )}
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-stone-500">Correction</span>
            <div className="absolute bottom-full mb-2 w-48 text-center px-3 py-2 bg-stone-900 text-stone-100 text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-50 shadow-xl border border-stone-700">
                 Predicts the most probable logical error needed for correction.
            </div>
        </div>

      </div>

      <div className="flex gap-2">
          {[0, 1, 2, 3].map(s => (
              <div key={s} className={`h-1 rounded-full transition-all duration-300 ${step === s ? 'w-8 bg-nobel-gold' : 'w-2 bg-stone-300'}`}></div>
          ))}
      </div>
    </div>
  );
};

// --- PERFORMANCE CHART ---
export const PerformanceMetricDiagram: React.FC = () => {
    const [noiseType, setNoiseType] = useState<'real' | 'simulated'>('real');
    const [distance, setDistance] = useState<3 | 5 | 11>(5);
    
    // Values represent Logical Error Rate (approx %). Lower is better.
    // Includes comparison against Tensor Network (TN) decoder and MWPM.
    const data = {
        real: {
            3: { mwpm: 3.5, tensor: 3.1, alpha: 2.9 },
            5: { mwpm: 3.6, tensor: 3.0, alpha: 2.75 }
        },
        simulated: {
            3: { mwpm: 2.1, tensor: 1.8, alpha: 1.6 },
            5: { mwpm: 0.8, tensor: 0.6, alpha: 0.5 },
            11: { mwpm: 0.0041, tensor: 0.0015, alpha: 0.0009 }
        }
    };

    // If switching to real, distance 11 is not available
    useEffect(() => {
        if (noiseType === 'real' && distance === 11) {
            setDistance(5);
        }
    }, [noiseType, distance]);

    // @ts-ignore
    const currentData = data[noiseType][distance] || data.real[5];
    
    // Normalize to max value of current set to visually fill the chart, with some headroom
    const maxVal = Math.max(currentData.mwpm, currentData.tensor, currentData.alpha) * 1.25;
    
    const formatValue = (val: number) => {
        if (val < 0.01) return val.toFixed(4) + '%';
        return val.toFixed(2) + '%';
    }

    return (
        <div className="flex flex-col md:flex-row gap-8 justify-between items-center p-8 bg-stone-900 text-stone-100 rounded-xl my-8 border border-stone-800 shadow-lg">
            <div className="flex-1 min-w-[240px] max-w-sm">
                <h3 className="font-serif text-xl mb-2 text-nobel-gold">Performance Benchmarks</h3>
                <p className="text-stone-400 text-sm mb-4 leading-relaxed">
                    AlphaQubit consistently achieves lower logical error rates than standard (MWPM) and advanced (Tensor Network) decoders across different distances and noise models.
                </p>
                
                <div className="flex flex-col gap-4 mt-6">
                    <div>
                        <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-2">Noise Model</div>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setNoiseType('real')} 
                                className={`px-3 py-1.5 rounded text-sm font-medium transition-all duration-200 border ${noiseType === 'real' ? 'bg-stone-700 text-stone-100 border-stone-600' : 'bg-transparent text-stone-400 border-stone-700 hover:border-stone-500'}`}
                            >
                                Sycamore (Real)
                            </button>
                            <button 
                                onClick={() => setNoiseType('simulated')} 
                                className={`px-3 py-1.5 rounded text-sm font-medium transition-all duration-200 border ${noiseType === 'simulated' ? 'bg-stone-700 text-stone-100 border-stone-600' : 'bg-transparent text-stone-400 border-stone-700 hover:border-stone-500'}`}
                            >
                                Depolarizing (Sim)
                            </button>
                        </div>
                    </div>

                    <div>
                        <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-2">Code Distance</div>
                        <div className="flex gap-2">
                            {[3, 5, 11].map((d) => (
                                <button 
                                    key={d}
                                    onClick={() => setDistance(d as any)} 
                                    disabled={noiseType === 'real' && d === 11}
                                    className={`px-3 py-1.5 rounded text-sm font-medium transition-all duration-200 border ${noiseType === 'real' && d === 11 ? 'opacity-30 cursor-not-allowed border-stone-800 bg-transparent text-stone-600' : distance === d ? 'bg-nobel-gold text-stone-900 border-nobel-gold' : 'bg-transparent text-stone-400 border-stone-700 hover:border-stone-500 hover:text-stone-200'}`}
                                >
                                    d={d}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="mt-6 font-mono text-[10px] text-stone-500 flex items-center gap-2">
                    <BarChart2 size={12} className="text-nobel-gold" /> 
                    <span>LOGICAL ERROR RATE% (LOWER IS BETTER)</span>
                </div>
            </div>
            
            <div className="relative w-full max-w-[400px] h-72 bg-stone-800/50 rounded-xl border border-stone-700/50 p-6 flex justify-around items-end">
                {/* Background Grid Lines */}
                <div className="absolute inset-0 p-6 flex flex-col justify-between pointer-events-none opacity-10">
                   <div className="w-full h-[1px] bg-stone-400"></div>
                   <div className="w-full h-[1px] bg-stone-400"></div>
                   <div className="w-full h-[1px] bg-stone-400"></div>
                   <div className="w-full h-[1px] bg-stone-400"></div>
                </div>

                {/* MWPM Bar */}
                <div className="w-[28%] flex flex-col justify-end items-center h-full z-10 group">
                    <div className="flex-1 w-full flex items-end justify-center relative mb-3">
                        <div className="absolute -top-7 w-max opacity-0 group-hover:opacity-100 transition-opacity z-50 text-center text-xs font-mono text-stone-300 bg-stone-900/90 py-1 px-2 rounded backdrop-blur-sm border border-stone-700/50 shadow-lg pointer-events-none">MWPM (Standard)</div>
                        <div className="absolute -top-5 w-full text-center text-[11px] md:text-sm font-mono text-stone-400 font-bold bg-transparent py-1 px-1">{formatValue(currentData.mwpm)}</div>
                        <motion.div 
                            className="w-full max-w-[50px] bg-stone-600 rounded-t-md border-t border-x border-stone-500/30"
                            initial={{ height: 0 }}
                            animate={{ height: `${(currentData.mwpm / maxVal) * 100}%` }}
                            transition={{ type: "spring", stiffness: 80, damping: 15 }}
                        />
                    </div>
                    <div className="h-6 flex items-center text-[9px] md:text-xs font-bold text-stone-500 uppercase tracking-wider text-center">MWPM</div>
                </div>

                {/* Tensor Network Bar */}
                <div className="w-[28%] flex flex-col justify-end items-center h-full z-10 group">
                    <div className="flex-1 w-full flex items-end justify-center relative mb-3">
                         <div className="absolute -top-7 w-max opacity-0 group-hover:opacity-100 transition-opacity z-50 text-center text-xs font-mono text-stone-300 bg-stone-900/90 py-1 px-2 rounded backdrop-blur-sm border border-stone-700/50 shadow-lg pointer-events-none">Tensor Network</div>
                        <div className="absolute -top-5 w-full text-center text-[11px] md:text-sm font-mono text-stone-300 font-bold bg-transparent py-1 px-1">{formatValue(currentData.tensor)}</div>
                        <motion.div 
                            className="w-full max-w-[50px] bg-stone-500 rounded-t-md border-t border-x border-stone-400/30"
                            initial={{ height: 0 }}
                            animate={{ height: `${(currentData.tensor / maxVal) * 100}%` }}
                            transition={{ type: "spring", stiffness: 80, damping: 15, delay: 0.05 }}
                        />
                    </div>
                    <div className="h-6 flex items-center text-[9px] md:text-xs font-bold text-stone-400 uppercase tracking-wider text-center">Tensor</div>
                </div>

                {/* AlphaQubit Bar */}
                <div className="w-[28%] flex flex-col justify-end items-center h-full z-10 group">
                     <div className="flex-1 w-full flex items-end justify-center relative mb-3">
                         <div className="absolute -top-7 w-max opacity-0 group-hover:opacity-100 transition-opacity z-50 text-center text-xs font-mono text-nobel-gold bg-stone-900/90 py-1 px-2 rounded backdrop-blur-sm border border-nobel-gold/30 shadow-lg pointer-events-none">AlphaQubit</div>
                        <div className="absolute -top-5 w-full text-center text-[11px] md:text-sm font-mono text-nobel-gold font-bold bg-transparent py-1 px-1">{formatValue(currentData.alpha)}</div>
                        <motion.div 
                            className="w-full max-w-[50px] bg-nobel-gold rounded-t-md shadow-[0_0_20px_rgba(197,160,89,0.25)] relative overflow-hidden"
                            initial={{ height: 0 }}
                            animate={{ height: Math.max(1, (currentData.alpha / maxVal) * 100) + '%' }}
                            transition={{ type: "spring", stiffness: 80, damping: 15, delay: 0.1 }}
                        >
                           {/* Shine effect */}
                           <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-white/20"></div>
                        </motion.div>
                    </div>
                     <div className="h-6 flex items-center text-[9px] md:text-xs font-bold text-nobel-gold uppercase tracking-wider text-center">Alpha</div>
                </div>
            </div>
        </div>
    )
}
