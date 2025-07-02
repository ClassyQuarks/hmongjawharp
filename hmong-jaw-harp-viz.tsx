import React, { useState } from 'react';

const HmongJawHarpViz = () => {
  const [selectedTone, setSelectedTone] = useState(null);
  const [selectedVowel, setSelectedVowel] = useState(null);
  const [viewMode, setViewMode] = useState('heatmap');

  // Data from the document
  const vowels = ['/i/', '/e/', '/w/', '/a/', '/o/', '/u/', '/ai/', '/ia/', '/au/', '/ua/', '/aw/', '/ee/', '/oo/'];
  const tones = ['j', 'm', 's', 'g', '–', 'b', 'v'];
  
  const data = {
    'j': {'/i/': [], '/e/': ['H12'], '/w/': [], '/a/': [], '/o/': ['H12'], '/u/': [], '/ai/': [], '/ia/': [], '/au/': [], '/ua/': ['H12'], '/aw/': ['H12'], '/ee/': [], '/oo/': ['H12']},
    'm': {'/i/': ['H12'], '/e/': ['H6'], '/w/': [], '/a/': ['H12'], '/o/': ['H15'], '/u/': [], '/ai/': [], '/ia/': ['H12'], '/au/': [], '/ua/': ['H12'], '/aw/': ['H12'], '/ee/': [], '/oo/': []},
    's': {'/i/': ['H7'], '/e/': ['H7'], '/w/': [], '/a/': ['H7'], '/o/': ['H7'], '/u/': ['H7'], '/ai/': ['H7'], '/ia/': ['H7'], '/au/': ['H7'], '/ua/': ['H7'], '/aw/': [], '/ee/': [], '/oo/': ['H7']},
    'g': {'/i/': ['H8'], '/e/': ['H8'], '/w/': ['H8'], '/a/': ['H8'], '/o/': ['H8'], '/u/': [], '/ai/': [], '/ia/': ['H8'], '/au/': [], '/ua/': [], '/aw/': [], '/ee/': ['H18'], '/oo/': []},
    '–': {'/i/': ['H8'], '/e/': ['H8'], '/w/': [], '/a/': [], '/o/': ['H16'], '/u/': [], '/ai/': [], '/ia/': ['H8'], '/au/': ['H16'], '/ua/': ['H16'], '/aw/': [], '/ee/': [], '/oo/': ['H16']},
    'b': {'/i/': ['H9'], '/e/': ['H9'], '/w/': ['H9'], '/a/': ['H23'], '/o/': ['H9'], '/u/': ['H9'], '/ai/': [], '/ia/': ['H9'], '/au/': [], '/ua/': [], '/aw/': ['H9'], '/ee/': [], '/oo/': ['H9']},
    'v': {'/i/': [], '/e/': [], '/w/': [], '/a/': [], '/o/': ['H9'], '/u/': ['H9'], '/ai/': [], '/ia/': ['H9'], '/au/': [], '/ua/': ['H9'], '/aw/': [], '/ee/': [], '/oo/': []}
  };

  // Add secondary harmonics and special cases
  const secondaryData = {
    's': {'/i/': [], '/e/': ['H15'], '/w/': [], '/a/': ['H15'], '/o/': ['H15'], '/u/': [], '/ai/': [], '/ia/': ['H15'], '/au/': ['H15'], '/ua/': ['H15'], '/aw/': [], '/ee/': [], '/oo/': ['H15']},
    'g': {'/w/': ['H24'], '/ee/': ['H12']},
    '–': {'/i/': ['H12', 'H16']},
    'b': {'/w/': ['H23'], '/oo/': ['H23']}
  };

  const getHarmonicNumber = (harmonic) => {
    if (!harmonic) return 0;
    return parseInt(harmonic.replace('H', ''));
  };

  const getColor = (harmonics) => {
    if (!harmonics || harmonics.length === 0) return '#f8f9fa';
    const maxHarmonic = Math.max(...harmonics.map(getHarmonicNumber));
    const intensity = Math.min(maxHarmonic / 24, 1); // Normalize to max H24
    return `rgba(59, 130, 246, ${0.3 + intensity * 0.7})`;
  };

  const getCellContent = (tone, vowel) => {
    const primary = data[tone][vowel] || [];
    const secondary = secondaryData[tone]?.[vowel] || [];
    const allHarmonics = [...primary, ...secondary];
    return allHarmonics;
  };

  const analyzeTonePattern = (tone) => {
    const harmonicCounts = {};
    let totalCells = 0;
    let filledCells = 0;
    
    vowels.forEach(vowel => {
      const harmonics = getCellContent(tone, vowel);
      if (harmonics.length > 0) {
        filledCells++;
        harmonics.forEach(h => {
          harmonicCounts[h] = (harmonicCounts[h] || 0) + 1;
        });
      }
      totalCells++;
    });
    
    const dominantHarmonics = Object.entries(harmonicCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);
    
    const coverage = filledCells / totalCells;
    let pattern = '';
    
    if (filledCells === 0) {
      pattern = `No data available for this tone`;
    } else {
      // Calculate regularity metrics
      const totalHarmonicInstances = Object.values(harmonicCounts).reduce((a, b) => a + b, 0);
      const uniqueHarmonics = Object.keys(harmonicCounts).length;
      const topHarmonicFreq = dominantHarmonics[0] ? dominantHarmonics[0][1] / filledCells : 0;
      const secondHarmonicFreq = dominantHarmonics[1] ? dominantHarmonics[1][1] / filledCells : 0;
      
      // Determine regularity level
      if (uniqueHarmonics === 1) {
        // Single harmonic only
        pattern = `Perfectly regular: ${dominantHarmonics[0][0]} appears in all documented contexts`;
      } else if (uniqueHarmonics === 2 && topHarmonicFreq === 1.0 && secondHarmonicFreq === 1.0) {
        // Two harmonics that always co-occur (like s tone: H7 + H15)
        pattern = `Perfectly regular combination: ${dominantHarmonics[0][0]} + ${dominantHarmonics[1][0]} consistently co-occur in all contexts`;
      } else if (uniqueHarmonics === 2 && topHarmonicFreq >= 0.9) {
        // Primary harmonic with occasional secondary (like b tone: H9 with occasional H23)
        pattern = `Highly regular: ${dominantHarmonics[0][0]} is consistent (${dominantHarmonics[0][1]}/${filledCells}), with ${dominantHarmonics[1][0]} in specific contexts (${dominantHarmonics[1][1]})`;
      } else if (topHarmonicFreq >= 0.9) {
        // One harmonic dominates heavily
        pattern = `Highly regular: ${dominantHarmonics[0][0]} appears in ${dominantHarmonics[0][1]}/${filledCells} contexts with minimal variation`;
      } else if (topHarmonicFreq >= 0.7) {
        // Clear primary pattern with some variation
        pattern = `Regular with variation: ${dominantHarmonics[0][0]} is primary (${dominantHarmonics[0][1]}/${filledCells}), also ${dominantHarmonics.slice(1).map(([h, c]) => `${h} (${c})`).join(', ')}`;
      } else if (topHarmonicFreq >= 0.5) {
        // Moderate regularity
        pattern = `Moderately regular: ${dominantHarmonics[0][0]} is most common (${dominantHarmonics[0][1]}/${filledCells}) but with substantial variation`;
      } else if (uniqueHarmonics > 4) {
        // Many different harmonics
        pattern = `Highly variable: uses ${uniqueHarmonics} different harmonics with no clear dominant pattern`;
      } else {
        // Mixed but not too chaotic
        pattern = `Mixed pattern: ${dominantHarmonics.map(([h, c]) => `${h} (${c})`).join(', ')} with no clear primary harmonic`;
      }
    }
    
    return { pattern, coverage, dominantHarmonics, filledCells, totalCells };
  };

  const analyzeVowelPattern = (vowel) => {
    let filledTones = 0;
    
    tones.forEach(tone => {
      const harmonics = getCellContent(tone, vowel);
      if (harmonics.length > 0) {
        filledTones++;
      }
    });
    
    return { filledTones, totalTones: tones.length };
  };

  const renderHeatmap = () => (
    <div className="overflow-x-auto">
      <table className="border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 p-2 bg-gray-100 font-semibold">Tone</th>
            {vowels.map(vowel => (
              <th key={vowel} className="border border-gray-300 p-2 bg-gray-100 font-semibold text-sm">{vowel}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tones.map(tone => (
            <tr key={tone}>
              <td className="border border-gray-300 p-2 bg-gray-100 font-semibold text-center">{tone}</td>
              {vowels.map(vowel => {
                const harmonics = getCellContent(tone, vowel);
                return (
                  <td 
                    key={`${tone}-${vowel}`}
                    className={`border border-gray-300 p-2 text-xs text-center cursor-pointer transition-all duration-200 ${
                      selectedTone === tone || selectedVowel === vowel ? 'ring-2 ring-blue-500' : ''
                    }`}
                    style={{backgroundColor: getColor(harmonics)}}
                    onClick={() => {
                      setSelectedTone(selectedTone === tone ? null : tone);
                      setSelectedVowel(selectedVowel === vowel ? null : vowel);
                    }}
                  >
                    {harmonics.length > 0 ? harmonics.join(', ') : '–'}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderSpectralView = () => {
    const maxHarmonic = 24;
    const harmonicData = {};
    
    // Collect all harmonic occurrences
    tones.forEach(tone => {
      vowels.forEach(vowel => {
        const harmonics = getCellContent(tone, vowel);
        harmonics.forEach(h => {
          const num = getHarmonicNumber(h);
          if (!harmonicData[num]) harmonicData[num] = [];
          harmonicData[num].push({tone, vowel});
        });
      });
    });

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(harmonicData)
            .sort(([a], [b]) => parseInt(a) - parseInt(b))
            .map(([harmonic, occurrences]) => (
              <div key={harmonic} className="border rounded-lg p-4 bg-gray-50">
                <h3 className="font-semibold text-lg mb-2">H{harmonic}</h3>
                <div className="flex flex-wrap gap-1">
                  {occurrences.map(({tone, vowel}, idx) => (
                    <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                      {tone}{vowel}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {occurrences.length} occurrences
                </p>
              </div>
            ))}
        </div>
      </div>
    );
  };

  const renderToneProfiles = () => (
    <div className="space-y-6">
      {tones.map(tone => {
        const toneHarmonics = {};
        vowels.forEach(vowel => {
          const harmonics = getCellContent(tone, vowel);
          harmonics.forEach(h => {
            const num = getHarmonicNumber(h);
            if (!toneHarmonics[num]) toneHarmonics[num] = 0;
            toneHarmonics[num]++;
          });
        });

        return (
          <div key={tone} className="border rounded-lg p-4">
            <h3 className="font-semibold text-xl mb-4">Tone: {tone}</h3>
            <div className="grid grid-cols-12 gap-1 mb-4">
              {Array.from({length: 24}, (_, i) => i + 1).map(harmonic => (
                <div 
                  key={harmonic}
                  className="h-8 border border-gray-200 flex items-center justify-center text-xs"
                  style={{
                    backgroundColor: toneHarmonics[harmonic] 
                      ? `rgba(59, 130, 246, ${toneHarmonics[harmonic] / vowels.length})`
                      : '#f8f9fa'
                  }}
                >
                  {harmonic}
                </div>
              ))}
            </div>
            <div className="text-sm text-gray-600">
              Most common harmonics: {Object.entries(toneHarmonics)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 3)
                .map(([h, count]) => `H${h} (${count})`)
                .join(', ')}
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Harmonic amplification in Hmong ncas
      </h1>
      
      <div className="mb-6">
        <p className="text-gray-600 mb-4">
          Visualization of harmonic amplification patterns across Hmong tones and vowels. 
          Fundamental frequency (f0) ≈ 58Hz. Click cells to highlight patterns.
        </p>
        
        <div className="flex space-x-4 mb-4">
          <button 
            onClick={() => setViewMode('heatmap')}
            className={`px-4 py-2 rounded ${viewMode === 'heatmap' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Heatmap View
          </button>
          <button 
            onClick={() => setViewMode('spectral')}
            className={`px-4 py-2 rounded ${viewMode === 'spectral' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Harmonic Distribution
          </button>
          <button 
            onClick={() => setViewMode('profiles')}
            className={`px-4 py-2 rounded ${viewMode === 'profiles' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Tone Profiles
          </button>
        </div>
      </div>

      {viewMode === 'heatmap' && renderHeatmap()}
      {viewMode === 'spectral' && renderSpectralView()}
      {viewMode === 'profiles' && renderToneProfiles()}

      {(selectedTone || selectedVowel) && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold mb-2">Pattern Analysis:</h3>
          {selectedTone && (() => {
            const analysis = analyzeTonePattern(selectedTone);
            return (
              <div>
                <p><strong>Tone {selectedTone}:</strong> {analysis.pattern}</p>
                <p className="text-sm text-gray-600 mt-1">
                  Data coverage: {analysis.filledCells}/{analysis.totalCells} vowel contexts 
                  ({(analysis.coverage * 100).toFixed(0)}%)
                </p>
              </div>
            );
          })()}
          {selectedVowel && (() => {
            const analysis = analyzeVowelPattern(selectedVowel);
            return (
              <div>
                <p><strong>Vowel {selectedVowel}:</strong> Appears in {analysis.filledTones}/{analysis.totalTones} tonal contexts</p>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default HmongJawHarpViz;