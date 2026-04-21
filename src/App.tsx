/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { Play, Square, Loader2, Search, Info, HelpCircle, Disc3, ListMusic, Volume2, VolumeX, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, Type } from '@google/genai';

const SETLIST = [
  { artist: 'Wheatus', title: 'Teenage Dirtbag' },
  { artist: 'Blink-182', title: 'The Rock Show' },
  { artist: 'The Distillers', title: 'Beat Your Heart Out' },
  { artist: 'M.I.A.', title: 'Paper Planes' },
  { artist: 'Tyler, The Creator & A$AP Rocky', title: 'Potato Salad' },
  { artist: 'WWE', title: 'The Rising Sun (Shinsuke Nakamura)' },
  { artist: 'Thursday', title: 'Jet Black New Year' },
  { artist: 'WWE', title: 'Celtic Invasion (Becky Lynch)' },
  { artist: 'Outkast', title: 'B.O.B. (Bombs Over Baghdad)' },
  { artist: 'My Chemical Romance', title: 'I\'m Not Okay (I Promise)' },
  { artist: 'Blink-182', title: 'Feeling This' },
  { artist: 'Hed PE', title: 'Renegade' },
  { artist: 'WWE', title: 'Worlds Apart (Sami Zayn)' },
  { artist: 'The White Stripes', title: 'Fell In Love With A Girl' },
  { artist: 'Ghost', title: 'He Is' },
  { artist: 'ICP', title: 'Dreams Of Grandeur' },
  { artist: 'Wu-Tang Clan', title: "Da Mystery of Chessboxin'" },
  { artist: 'Green Day', title: 'Song of the Century' },
  { artist: 'BOSS', title: 'The Night We Won It Six Times' },
  { artist: 'Fat Nick', title: 'Walking Harder' },
  { artist: 'Dropkick Murphys', title: 'The Dirty Glass' },
  { artist: 'Frank Ocean', title: 'Nikes' },
  { artist: 'The Beach Boys', title: 'Sloop John B' },
  { artist: 'A$AP Rocky', title: 'Excuse Me' },
  { artist: 'WWE', title: 'Turn It Up (Bayley)' },
  { artist: 'Good Charlotte', title: 'The Little Things' },
  { artist: 'BMTH', title: 'Kingslayer' },
  { artist: 'Fat Nick', title: 'Badly Educated' },
  { artist: 'WILLOW', title: 'Gaslight' },
  { artist: 'Gorillaz', title: 'Clint Eastwood' }
];

const PAD_LAYOUT = [
  { id: 1, short: 'HAT 1', colorTheme: 'cyan' },
  { id: 2, short: 'HAT 2', colorTheme: 'cyan' },
  { id: 3, short: 'SNR 1', colorTheme: 'yellow' },
  { id: 4, short: 'KICK 1', colorTheme: 'red' },
  { id: 5, short: 'KICK 2', colorTheme: 'red' },
  { id: 6, short: 'SNR 2', colorTheme: 'yellow' },
  { id: 7, short: 'ROLL', colorTheme: 'purple' },
  { id: 8, short: 'CRASH', colorTheme: 'orange' }
];

const LOADING_MESSAGES = [
  "Listening to rhythm section...",
  "Isolating kick and snare transients...",
  "Identifying bpm and time signature...",
  "Extracting chord progression and bassline...",
  "Synthesizing sequence map..."
];

const BASS_NOTES: Record<string, number> = {
    'C1': 32.70, 'C#1': 34.65, 'D1': 36.71, 'D#1': 38.89, 'E1': 41.20, 'F1': 43.65, 'F#1': 46.25, 'G1': 49.00, 'G#1': 51.91, 'A1': 55.00, 'A#1': 58.27, 'B1': 61.74,
    'C2': 65.41, 'C#2': 69.30, 'D2': 73.42, 'D#2': 77.78, 'E2': 82.41, 'F2': 87.31, 'F#2': 92.50, 'G2': 98.00, 'G#2': 103.83, 'A2': 110.00, 'A#2': 116.54, 'B2': 123.47,
    'C3': 130.81, 'C#3': 138.59, 'D3': 146.83, 'D#3': 155.56, 'E3': 164.81, 'F3': 174.61, 'F#3': 185.00, 'G3': 196.00, 'G#3': 207.65, 'A3': 220.00, 'A#3': 233.08, 'B3': 246.94
};

function getPadStyles(theme: string, active: boolean) {
  const base = "w-full aspect-square rounded-xl border-2 flex items-center justify-center relative overflow-hidden transition-colors duration-75 select-none";
  let colors = "";
  switch (theme) {
    case 'cyan':
        colors = active ? "bg-cyan-400 border-cyan-300 text-black shadow-[0_0_30px_rgba(34,211,238,0.8)]"
                        : "bg-cyan-950/50 border-cyan-500/30 text-cyan-500";
        break;
    case 'red':
        colors = active ? "bg-red-500 border-red-400 text-black shadow-[0_0_30px_rgba(239,68,68,0.8)]"
                        : "bg-red-950/50 border-red-500/30 text-red-500";
        break;
    case 'yellow':
        colors = active ? "bg-yellow-400 border-yellow-300 text-black shadow-[0_0_30px_rgba(250,204,21,0.8)]"
                        : "bg-yellow-950/50 border-yellow-500/30 text-yellow-500";
        break;
    case 'purple':
        colors = active ? "bg-purple-500 border-purple-400 text-white shadow-[0_0_30px_rgba(168,85,247,0.8)]"
                        : "bg-purple-950/50 border-purple-500/30 text-purple-400";
        break;
    case 'orange':
        colors = active ? "bg-orange-500 border-orange-400 text-black shadow-[0_0_30px_rgba(249,115,22,0.8)]"
                        : "bg-orange-950/50 border-orange-500/30 text-orange-400";
        break;
  }
  return `${base} ${colors}`;
}

function getMiniDotStyle(theme: string) {
   switch(theme) {
       case 'cyan': return 'bg-cyan-400 shadow-[0_0_5px_currentColor]';
       case 'red': return 'bg-red-500 shadow-[0_0_5px_currentColor]';
       case 'yellow': return 'bg-yellow-400 shadow-[0_0_5px_currentColor]';
       case 'purple': return 'bg-purple-400 shadow-[0_0_5px_currentColor]';
       case 'orange': return 'bg-orange-500 shadow-[0_0_5px_currentColor]';
       default: return 'bg-white/50';
   }
}

// --- Web Audio Synth Engine ---
class DrumSynth {
    ctx: AudioContext | null = null;

    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    playNoise(decay: number, filterFreq: number, type: 'highpass' | 'bandpass' = 'highpass') {
        if (!this.ctx) return;
        const time = this.ctx.currentTime;
        const bufferSize = this.ctx.sampleRate * decay;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = type;
        filter.frequency.value = filterFreq;
        
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(1, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + decay);
        
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        noise.start(time);
    }

    playKick(deep = false) {
        if (!this.ctx) return;
        const time = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        const startFreq = deep ? 120 : 150;
        osc.frequency.setValueAtTime(startFreq, time);
        osc.frequency.exponentialRampToValueAtTime(0.001, time + 0.5);
        gain.gain.setValueAtTime(1, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.5);
        
        osc.start(time);
        osc.stop(time + 0.5);
    }

    playSnare() {
        if (!this.ctx) return;
        const time = this.ctx.currentTime;
        this.playNoise(0.2, 2000, 'bandpass');
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.frequency.setValueAtTime(200, time);
        gain.gain.setValueAtTime(0.7, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);
        
        osc.start(time);
        osc.stop(time + 0.2);
    }
    
    playSnareRoll() {
        if (!this.ctx) return;
        const time = this.ctx.currentTime;
        this.playNoise(0.1, 1500, 'bandpass');
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.frequency.setValueAtTime(250, time);
        gain.gain.setValueAtTime(0.4, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
        osc.start(time);
        osc.stop(time + 0.1);
    }

    playBass(noteName: string, duration: number) {
        if (!this.ctx || !noteName || !BASS_NOTES[noteName.toUpperCase()]) return;
        
        const time = this.ctx.currentTime;
        const freq = BASS_NOTES[noteName.toUpperCase()];
        
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        // Fat synth bass sound
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, time);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, time);
        filter.frequency.exponentialRampToValueAtTime(100, time + duration * 0.8);

        gain.gain.setValueAtTime(0.25, time); // Keep bass volume slightly lower to not overpower drums
        gain.gain.setTargetAtTime(0, time + duration - 0.02, 0.02);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(time);
        osc.stop(time + duration);
    }

    playPad(id: number) {
        this.init();
        switch(id) {
            case 1: this.playNoise(0.05, 8000, 'highpass'); break; // Closed Hat
            case 2: this.playNoise(0.3, 7000, 'highpass'); break; // Open/Alt Hat
            case 3: this.playSnare(); break;
            case 4: this.playKick(true); break; // Deep Kick
            case 5: this.playKick(false); break; // Punchy Kick
            case 6: this.playSnare(); break;
            case 7: this.playSnareRoll(); break; // Snare roll / short hit
            case 8: this.playNoise(1.5, 4000, 'highpass'); break; // Crash
        }
    }
}

type AnalysisResult = {
    recommendedKit: string;
    bpm: number;
    patternDescription: string;
    sequence: number[][]; // 16 items
    bassline?: string[]; // 16 items
}

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeAnalysisDesc, setActiveAnalysisDesc] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBassMuted, setIsBassMuted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  
  const [userActivePads, setUserActivePads] = useState<Set<number>>(new Set());
  const synthRef = useRef<DrumSynth | null>(null);

  useEffect(() => {
      // Initialize synth on client side
      synthRef.current = new DrumSynth();
  }, []);

  // Handle loading message cycling
  useEffect(() => {
      if (!isLoading) {
          setLoadingMsgIdx(0);
          return;
      }
      const interval = setInterval(() => {
          setLoadingMsgIdx(prev => (prev + 1) % LOADING_MESSAGES.length);
      }, 2000);
      return () => clearInterval(interval);
  }, [isLoading]);

  useEffect(() => {
      let interval: ReturnType<typeof setInterval>;
      if (isPlaying && analysis) {
          const msPer16th = (60000 / analysis.bpm) / 4;
          interval = setInterval(() => {
              setCurrentStep(prev => {
                  const nextStep = (prev + 1) % 16;
                  // Auto-play the pads if sequencer is running
                  if (analysis.sequence[nextStep]) {
                      analysis.sequence[nextStep].forEach(padId => {
                          synthRef.current?.playPad(padId);
                      });
                  }
                  
                  // Auto-play bassline backing track
                  if (!isBassMuted && analysis.bassline && analysis.bassline[nextStep]) {
                      const note = analysis.bassline[nextStep];
                      if (note && note.trim() !== '') {
                          synthRef.current?.playBass(note, msPer16th / 1000); // Pass duration in seconds
                      }
                  }

                  return nextStep;
              });
          }, msPer16th);
      }
      return () => clearInterval(interval);
  }, [isPlaying, analysis, isBassMuted]);

  const handleAnalyze = async (overrideQuery?: string | any) => {
      const q = typeof overrideQuery === 'string' ? overrideQuery : searchQuery;
      if (!q.trim()) return;
      
      // Request audio context unlock
      synthRef.current?.init();

      if (typeof overrideQuery === 'string') {
          setSearchQuery(q);
      }
      setActiveAnalysisDesc(q);
      setIsLoading(true);
      try {
          const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
          const prompt = `The user wants to play along to the song "${q}" on their physical drum pad using djay Pro.

Their drum pad has 8 drum pads mapped in a 4x2 grid (Pad IDs 1-8 reading left to right):
Pad 1 (Top-Left): Hat
Pad 2 (Top-Inner-Left): Hat
Pad 3 (Top-Inner-Right): Snare 1
Pad 4 (Top-Right): Kick
Pad 5 (Bottom-Left): Kick
Pad 6 (Bottom-Inner-Left): Snare 2
Pad 7 (Bottom-Inner-Right): Snare Roll
Pad 8 (Bottom-Right): Crash

Task 1: Analyze the core, most recognizable main drum groove from "${q}" and produce a 1-bar looping sequence (4/4 time).
Task 2: Identify the main chord progression or signature bass riff from the track. Generate a simple 1-bar looping 16th-note synthesized bassline that perfectly matches the groove so the user has a backing track to play along to.`;

          const response = await ai.models.generateContent({
              model: 'gemini-3.1-pro-preview',
              contents: prompt,
              config: {
                  responseMimeType: "application/json",
                  responseSchema: {
                      type: Type.OBJECT,
                      properties: {
                          recommendedKit: { type: Type.STRING, description: "Exactly match the name of a built-in algorithmic/sampler pack available natively in Algoriddim djay Pro (e.g. 'Lo-Fi', 'Classic Hip Hop', 'EDM', 'Deep House', 'Trap', 'Dubstep', 'Percussion', 'Boutique 808')." },
                          bpm: { type: Type.NUMBER, description: "Approximate tempo" },
                          patternDescription: { type: Type.STRING, description: "A brief, highly practical explanation of how to play this beat using their specific pad setup." },
                          sequence: {
                              type: Type.ARRAY,
                              description: "Exactly 16 elements representing 16th notes of 1 bar. Elements are arrays of Pad IDs (1-8) hit on that step.",
                              items: {
                                  type: Type.ARRAY,
                                  items: { type: Type.NUMBER }
                              }
                          },
                          bassline: {
                              type: Type.ARRAY,
                              description: "Exactly 16 elements. A 1-bar synth bass backing track. Each element should be a musical note string (e.g., 'C2', 'G1', 'D#2') matching the song's bassline, or an empty string '' if it is a rest.",
                              items: { type: Type.STRING }
                          }
                      },
                      required: ["recommendedKit", "bpm", "patternDescription", "sequence", "bassline"]
                  }
              }
          });

          if (response.text) {
             const rawData = JSON.parse(response.text);
             const safeSequence = Array.from({length: 16}).map((_, i) => {
                 return Array.isArray(rawData.sequence[i]) ? rawData.sequence[i] : [];
             });
             const safeBassline = Array.from({length: 16}).map((_, i) => {
                 return typeof rawData.bassline?.[i] === 'string' ? rawData.bassline[i] : '';
             });
             setAnalysis({ ...rawData, sequence: safeSequence, bassline: safeBassline });
             setCurrentStep(0);
             setIsPlaying(false);
          }

      } catch (err) {
          console.error(err);
          alert("Failed to analyze track. Please try again.");
      } finally {
          setIsLoading(false);
      }
  };

  const handlePadDown = (id: number) => {
      // Synthesize sound strictly for User Input
      synthRef.current?.playPad(id);
      setUserActivePads(prev => new Set(prev).add(id));
  };
  
  const handlePadUp = (id: number) => setUserActivePads(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
  });

  const activePads = new Set([
      ...Array.from(userActivePads),
      ...(isPlaying && analysis ? analysis.sequence[currentStep] || [] : [])
  ]);

  return (
    <div className="min-h-screen bg-[#070709] text-white font-sans overflow-x-hidden p-4 md:p-8 flex flex-col gap-6 selection:bg-cyan-500/30">
      {/* HEADER */}
      <header className="flex justify-between items-center border-b border-white/10 pb-6 shrink-0 flex-col md:flex-row gap-6">
          <div className="flex flex-col items-start w-full md:w-auto">
             <span className="text-[10px] tracking-[0.2em] text-cyan-400 font-bold uppercase mb-1 flex items-center gap-2"><Disc3 className="w-3 h-3"/> djay Pro Companion</span>
             <h1 className="text-3xl font-light tracking-tight italic text-white/90">Beat<span className="font-bold">Sync</span></h1>
          </div>

          <div className="flex w-full md:w-auto items-center gap-2 relative">
              <input
                  type="text"
                  className="bg-white/5 border border-white/10 rounded-full pl-6 pr-12 py-3 w-full md:w-80 text-sm focus:outline-none focus:border-cyan-400/50 transition-colors placeholder-white/30"
                  placeholder="Enter custom track..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
              />
              <button
                  onClick={handleAnalyze}
                  disabled={isLoading || !searchQuery.trim()}
                  className="absolute right-1 top-1 bottom-1 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:hover:bg-cyan-500 text-black px-4 rounded-full font-bold flex items-center justify-center transition-colors shadow-[0_0_15px_rgba(34,211,238,0.2)] cursor-pointer"
              >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              </button>
          </div>
      </header>

      {/* MAIN WORKSPACE: 3 Columns */}
      <main className="flex-1 flex flex-col lg:flex-row gap-6 max-w-[1600px] mx-auto w-full">
         
         {/* LEFT: VERTICAL SETLIST */}
         <section className="w-full lg:w-[320px] flex flex-col gap-4 bg-white/5 rounded-3xl p-6 border border-white/10 overflow-hidden relative">
            <h2 className="text-xs tracking-widest text-white/40 font-bold uppercase mb-2 shrink-0 flex items-center gap-2">
                <ListMusic className="w-4 h-4 text-cyan-400" />
                Teaching Setlist
            </h2>
            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-2 pr-2">
               {SETLIST.map((song, i) => {
                  const queryStr = `${song.artist} - ${song.title}`;
                  const isAnalyzingMe = isLoading && activeAnalysisDesc === queryStr;
                  const isActive = activeAnalysisDesc === queryStr;
                  
                  return (
                      <button
                         key={i}
                         onClick={() => handleAnalyze(queryStr)}
                         disabled={isLoading}
                         className={`text-left p-3 rounded-xl border transition-all duration-200 cursor-pointer ${
                             isActive 
                             ? 'bg-cyan-500/10 border-cyan-400 border-l-4 shadow-[0_0_15px_rgba(34,211,238,0.05)]' 
                             : 'bg-black/20 border-white/5 hover:bg-white/10 hover:border-white/20 border-l-[1px]'
                         } disabled:opacity-50 flex items-center justify-between`}
                      >
                         <div className="flex flex-col">
                            <span className={`text-sm font-bold ${isActive ? 'text-cyan-300' : 'text-white/90'}`}>{song.title}</span>
                            <span className="text-xs text-white/50">{song.artist}</span>
                         </div>
                         {isAnalyzingMe && <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />}
                      </button>
                  );
               })}
            </div>
         </section>

         {/* MIDDLE: ANALYSIS & SETUP */}
         <section className="w-full lg:w-[400px] flex flex-col gap-4">
               <div className="bg-white/5 rounded-3xl p-6 md:p-8 border border-white/10 h-full flex flex-col relative overflow-hidden backdrop-blur-xl">
                  <div className="absolute top-0 right-0 p-32 bg-cyan-500/5 blur-[100px] rounded-full mix-blend-screen pointer-events-none" />

                  <h2 className="text-xs tracking-widest text-white/40 font-bold uppercase mb-6 shrink-0">Analysis & Pack</h2>

                  {isLoading ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 relative z-10">
                          <Activity className="w-12 h-12 text-cyan-400 animate-pulse mb-4" />
                          <div className="h-6 overflow-hidden">
                              <AnimatePresence mode="wait">
                                  <motion.p
                                      key={loadingMsgIdx}
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, y: -10 }}
                                      className="text-sm font-medium text-cyan-400"
                                  >
                                      {LOADING_MESSAGES[loadingMsgIdx]}
                                  </motion.p>
                              </AnimatePresence>
                          </div>
                          <p className="text-[10px] uppercase tracking-widest text-white/30 text-balance px-4 mt-2">
                             Extracting complex audio mappings for {activeAnalysisDesc || searchQuery}
                          </p>
                      </div>
                  ) : analysis ? (
                      <div className="flex flex-col gap-6 flex-1 overflow-y-auto pr-2 custom-scrollbar relative z-10 transition-opacity duration-300">
                         <div className="flex flex-col gap-4">
                             <div className="flex-1 bg-black/40 rounded-2xl p-4 border border-white/5 shadow-inner">
                                 <div className="text-[10px] text-white/40 uppercase font-bold mb-2">djay Pro Selected Pack</div>
                                 <div className="text-sm font-medium text-cyan-300 leading-tight">{analysis.recommendedKit}</div>
                             </div>
                             <div className="bg-black/40 rounded-2xl p-4 border border-white/5 shadow-inner flex justify-between items-center">
                                 <div className="text-[10px] text-white/40 uppercase font-bold mb-1">Target Tempo</div>
                                 <div className="text-xl font-mono font-bold text-white">{analysis.bpm} <span className="text-xs text-white/40">BPM</span></div>
                             </div>
                         </div>

                         <div className="bg-black/40 rounded-2xl p-5 border border-white/5 border-l-2 border-l-cyan-400 relative">
                             <div className="text-[10px] text-cyan-400/80 uppercase font-bold mb-3 flex items-center gap-2">
                                 <Info className="w-4 h-4" /> Pattern Breakdown
                             </div>
                             <p className="text-sm text-white/80 leading-relaxed font-light whitespace-pre-wrap">{analysis.patternDescription}</p>
                         </div>
                      </div>
                  ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50 space-y-4 relative z-10">
                          <HelpCircle className="w-16 h-16 text-white/20" />
                          <p className="text-sm max-w-[200px] font-light">Select a track from your setlist to generate your mapping.</p>
                      </div>
                  )}
               </div>
           </section>

           {/* RIGHT: DRUM PADS & SEQUENCER */}
           <section className="flex-1 flex flex-col gap-6">
             <div className="bg-black/50 rounded-3xl p-6 md:p-8 border border-white/5 flex flex-col items-center justify-center shadow-[inset_0_0_100px_rgba(0,0,0,1)] relative overflow-hidden h-full min-h-[500px]">
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-b from-cyan-900/10 to-transparent blur-[120px] pointer-events-none" />

                 <div className="grid grid-cols-4 gap-4 p-5 bg-black/80 rounded-3xl border border-white/10 shadow-2xl w-full max-w-2xl mx-auto relative z-10">
                     {PAD_LAYOUT.map((pad) => {
                         const isActive = activePads.has(pad.id);
                         return (
                             <div
                                 key={pad.id}
                                 onPointerDown={() => handlePadDown(pad.id)}
                                 onPointerUp={() => handlePadUp(pad.id)}
                                 onPointerLeave={() => handlePadUp(pad.id)}
                                 onPointerCancel={() => handlePadUp(pad.id)}
                                 className={getPadStyles(pad.colorTheme, isActive) + ` cursor-pointer ${isActive ? 'scale-95' : 'scale-100'} transition-transform duration-75`}
                                 style={{ touchAction: 'none' }} // Prevent scrolling while drumming on mobile
                             >
                                 <span className="text-xs md:text-sm lg:text-base font-mono font-bold tracking-tight pointer-events-none">{pad.short}</span>
                                 <span className="absolute top-2 left-2 text-[10px] opacity-40 font-mono pointer-events-none">{pad.id}</span>
                             </div>
                         )
                     })}
                 </div>

                 <div className="mt-10 bg-black/40 p-5 rounded-3xl border border-white/5 w-full max-w-2xl mx-auto relative z-10">
                    <div className="flex items-center justify-between mb-4 px-1 gap-4">
                        <span className="text-[10px] tracking-widest text-white/40 uppercase font-bold flex-1 hidden sm:block">16-Step Live Sequencer</span>
                        
                        <div className="flex items-center gap-2">
                             <button
                               onClick={() => setIsBassMuted(!isBassMuted)}
                               disabled={!analysis || isLoading}
                               className={`h-10 px-4 rounded-full flex items-center justify-center transition-colors border cursor-pointer text-xs font-bold gap-2 
                                  ${!isBassMuted ? 'bg-cyan-500/20 border-cyan-400 text-cyan-400' : 'bg-white/5 border-white/10 hover:bg-white/10 text-white/50 disabled:opacity-30'}`}
                             >
                                {!isBassMuted ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                                <span className="hidden sm:inline">Backing Track</span>
                             </button>
                             <button
                               onClick={() => {
                                  if (isPlaying) {
                                      setIsPlaying(false);
                                      setCurrentStep(0);
                                  } else {
                                      synthRef.current?.init(); // Unlock audio context
                                      setIsPlaying(true);
                                  }
                               }}
                               disabled={!analysis || isLoading}
                               className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors border cursor-pointer 
                                  ${isPlaying ? 'bg-red-500/20 border-red-400 text-red-500' : 'bg-white/5 border-white/10 hover:bg-white/10 text-white disabled:opacity-30'}`}
                             >
                                {isPlaying ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 ml-1 fill-current" />}
                             </button>
                        </div>
                    </div>

                    <div className="flex gap-1 md:gap-2 h-16 w-full mb-1">
                        {Array.from({length: 16}).map((_, i) => {
                            const isBeat = i % 4 === 0;
                            const isCurrent = isPlaying && i === currentStep;
                            const stepPads = analysis ? analysis.sequence[i] : [];

                            return (
                                <div key={i} className={`flex-1 rounded-lg flex flex-col items-center justify-end p-1 overflow-hidden transition-all duration-75 relative
                                    ${isCurrent ? 'bg-white/20 shadow-[inset_0_0_15px_rgba(255,255,255,0.15)]' : (isBeat ? 'bg-white/10' : 'bg-white/5')}`}
                                >
                                     {isCurrent && <div className="absolute top-0 w-full h-[2px] bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,1)]" />}

                                    <div className="flex flex-col gap-1 mb-1">
                                        {stepPads.map(padId => {
                                           const layoutPad = PAD_LAYOUT.find(p => p.id === padId);
                                           if (!layoutPad) return null;
                                           return <div key={padId} className={`w-3 h-1.5 md:w-5 md:h-2 rounded-full ${getMiniDotStyle(layoutPad.colorTheme)}`} />
                                        })}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                    {/* Bassline Notes Visualizer */}
                    {analysis?.bassline && (
                        <div className="flex gap-1 md:gap-2 w-full mt-2">
                             {analysis.bassline.map((note, i) => (
                                 <div key={`bass-${i}`} className="flex-1 flex justify-center h-4">
                                     {note && note.trim() && (
                                         <span className={`text-[8px] sm:text-[10px] font-mono font-bold ${isPlaying && currentStep === i && !isBassMuted ? 'text-cyan-400' : 'text-white/30'}`}>
                                            {note}
                                         </span>
                                     )}
                                 </div>
                             ))}
                        </div>
                    )}
                 </div>
             </div>
           </section>
      </main>
    </div>
  );
}
