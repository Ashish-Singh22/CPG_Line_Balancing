import React, { useState, useCallback } from 'react';
import { Calendar, Clock, Settings, Database, FileSpreadsheet, BarChart3, Layers, Zap, ArrowRight, Wrench } from 'lucide-react';

const UserInput = ({ onDataChange, onBalanceLine }) => {
  const [formData, setFormData] = useState({
    date: '',
    shift: 'First',
    line: '1',
    noOfStations: 0,
    crane_pos: '',
    models: {
      'X2.5': 0,
      'X3.3': 0,
      'B3.3': 0,
      'PHASE_1': 0,
      'PHASE_2': 0,
      'QSB7': 0,
      'QSL9': 0
    },
    workContent: null
  });

  const shiftOptions = ['First', 'Second', 'Third', 'General'];
  const lineOptions = ['1', '2', '3'];
  const modelOptions = ['X2.5', 'X3.3', 'B3.3', 'PHASE_1', 'PHASE_2', 'QSB7', 'QSL9'];

  const handleInputChange = useCallback((field, value) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onDataChange(newData);
  }, [formData, onDataChange]);

  const handleModelQuantityChange = useCallback((modelName, quantity) => {
    const updatedModels = { ...formData.models, [modelName]: parseInt(quantity) || 0 };
    handleInputChange('models', updatedModels);
  }, [formData.models, handleInputChange]);

  const handleFileUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (file) {
      handleInputChange('workContent', file);
    }
  }, [handleInputChange]);

  const handleBalanceLine = useCallback(() => {
    if (!formData.date) {
      alert('Please select a production date');
      return;
    }
    if (formData.noOfStations === 0) {
      alert('Please enter number of stations');
      return;
    }
    
    const totalQuantity = Object.values(formData.models).reduce((sum, qty) => sum + qty, 0);
    if (totalQuantity === 0) {
      alert('Please enter quantity for at least one model');
      return;
    }

    if (!formData.workContent) {
      alert('Please upload work content file');
      return;
    }
    
    let cranePositions = [];
    if (formData.crane_pos && formData.crane_pos.trim() !== '') {
      try {
        cranePositions = formData.crane_pos
          .split(',')
          .map(pos => parseInt(pos.trim()))
          .filter(pos => !isNaN(pos) && pos > 0);
        
        const invalidPositions = cranePositions.filter(pos => pos > formData.noOfStations);
        if (invalidPositions.length > 0) {
          alert(`Invalid crane positions: ${invalidPositions.join(', ')}. Positions must be between 1 and ${formData.noOfStations}`);
          return;
        }
      } catch (error) {
        alert('Invalid crane positions format. Please enter comma-separated numbers (e.g., 1, 5, 10)');
        return;
      }
    } else {
      cranePositions = Array.from({ length: formData.noOfStations }, (_, i) => i + 1);
    }
    
    const modelsArray = Object.entries(formData.models)
      .filter(([_, quantity]) => quantity > 0)
      .map(([name, quantity]) => ({ name, quantity }));
    
    const dataToSend = {
      ...formData,
      models: modelsArray,
      crane_pos: cranePositions
    };
    
    onBalanceLine(dataToSend);
  }, [formData, onBalanceLine]);

  const getTotalQuantity = () => {
    return Object.values(formData.models).reduce((sum, qty) => sum + qty, 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 text-white">
      <div className="w-full max-w-none px-8 py-6">
        <div className="bg-gradient-to-r from-slate-800/80 to-gray-800/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-700/50 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-4 rounded-2xl">
                  <Settings className="w-10 h-10" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold">Production Line Balancing Setup</h1>
                  <p className="text-blue-100 mt-2 text-lg">Configure your production parameters for optimal line balancing</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-blue-100 text-sm">Total Models Quantity</p>
                <p className="text-3xl font-bold">{getTotalQuantity()}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-1 space-y-6">
            <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Clock className="w-6 h-6 text-blue-400" />
                Schedule Information
              </h2>
              
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-gray-300 font-semibold">
                    <Calendar className="w-5 h-5 text-blue-400" />
                    Production Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700/50 border-2 border-gray-600 rounded-xl focus:border-blue-500 focus:outline-none transition-all duration-200 text-white placeholder-gray-400"
                  />
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-gray-300 font-semibold">
                    <Clock className="w-5 h-5 text-blue-400" />
                    Shift
                  </label>
                  <select
                    value={formData.shift}
                    onChange={(e) => handleInputChange('shift', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700/50 border-2 border-gray-600 rounded-xl focus:border-blue-500 focus:outline-none transition-all duration-200 text-white"
                  >
                    {shiftOptions.map(shift => (
                      <option key={shift} value={shift} className="bg-slate-700">{shift}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Layers className="w-6 h-6 text-green-400" />
                Production Configuration
              </h2>
              
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-gray-300 font-semibold">
                    <Layers className="w-5 h-5 text-green-400" />
                    Production Line
                  </label>
                  <select
                    value={formData.line}
                    onChange={(e) => handleInputChange('line', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700/50 border-2 border-gray-600 rounded-xl focus:border-green-500 focus:outline-none transition-all duration-200 text-white"
                  >
                    {lineOptions.map(line => (
                      <option key={line} value={line} className="bg-slate-700">Line {line}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-gray-300 font-semibold">
                    <Database className="w-5 h-5 text-green-400" />
                    Number of Stations
                  </label>
                  <input
                    type="number"
                    value={formData.noOfStations}
                    onChange={(e) => handleInputChange('noOfStations', parseInt(e.target.value) || 0)}
                    min="0"
                    className="w-full px-4 py-3 bg-slate-700/50 border-2 border-gray-600 rounded-xl focus:border-green-500 focus:outline-none transition-all duration-200 text-white placeholder-gray-400"
                    placeholder="Enter number of stations"
                  />
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-gray-300 font-semibold">
                    <Wrench className="w-5 h-5 text-yellow-400" />
                    Crane Positions
                  </label>
                  <input
                    type="text"
                    value={formData.crane_pos}
                    onChange={(e) => handleInputChange('crane_pos', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700/50 border-2 border-gray-600 rounded-xl focus:border-yellow-500 focus:outline-none transition-all duration-200 text-white placeholder-gray-400"
                    placeholder="e.g., 1, 5, 10, 15"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Enter station numbers where cranes are available (comma-separated). Leave empty for all stations.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <FileSpreadsheet className="w-6 h-6 text-purple-400" />
                Work Content
              </h2>
              
              <div className="border-2 border-dashed border-gray-600 rounded-2xl p-6 text-center hover:border-purple-400 transition-all duration-200 bg-slate-700/30 hover:bg-purple-900/20">
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <FileSpreadsheet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-300 font-medium">
                    {formData.workContent ? formData.workContent.name : 'Click to upload Excel file'}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Supports .xlsx, .xls, .csv files</p>
                </label>
              </div>
            </div>
          </div>

          <div className="xl:col-span-2">
            <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <BarChart3 className="w-8 h-8 text-orange-400" />
                  Product Models & Quantities
                </h2>
                <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 px-4 py-2 rounded-xl border border-orange-500/30">
                  <span className="text-orange-300 text-sm font-semibold">Total: {getTotalQuantity()} units</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {modelOptions.map((model) => (
                  <div key={model} className="bg-gradient-to-br from-slate-700/50 to-gray-800/50 rounded-xl p-4 border border-gray-600/50 hover:border-orange-500/50 transition-all duration-200">
                    <div className="text-center mb-4">
                      <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-300 px-3 py-2 rounded-xl font-bold text-lg border border-orange-500/30">
                        {model}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm text-gray-400 font-medium">Quantity</label>
                      <div className="relative">
                        <input
                          type="number"
                          value={formData.models[model]}
                          onChange={(e) => handleModelQuantityChange(model, e.target.value)}
                          min="0"
                          className="w-full px-4 py-3 bg-slate-600/50 border-2 border-gray-600 rounded-lg focus:border-orange-500 focus:outline-none transition-all duration-200 text-white text-center text-xl font-bold placeholder-gray-400"
                          placeholder="0"
                        />
                        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                          <span className="text-gray-400 text-sm">units</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-gray-700/50">
                <button
                  onClick={handleBalanceLine}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-200 flex items-center justify-center gap-3 text-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                >
                  <Zap className="w-6 h-6" />
                  Balance Production Line
                  <ArrowRight className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserInput;