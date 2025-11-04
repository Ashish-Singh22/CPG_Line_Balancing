import React, { useState } from 'react';
import { Calendar, Clock, BarChart3, Database, Download, ArrowLeft, Layers, Package, Users, Timer } from 'lucide-react';
import * as XLSX from 'xlsx';

const Dashboard = ({ data, onBackToInput, finalData }) => {
  const [selectedModel, setSelectedModel] = useState(null);

  console.log("Final_Data in Dashboard:", finalData);

  // Function to download Excel file
  const downloadExcel = () => {
    const wb = XLSX.utils.book_new();

    Object.entries(finalData).forEach(([modelName, stations]) => {
      // Prepare data for Excel - only selected columns
      const excelData = stations.map(station => ({
        'Station_Number': station.Station_Number,
        'crane_aval': station.crane_aval,
        'Final_Order': station.Final_Order.join(' | '),
        'Total_Manpower': station.Total_Manpower,
        'time_rem': parseFloat(station.time_rem.toFixed(2)),
        'Activity_Need_to_done_Before': station['Activity Need to done Before'].join(' | ')
      }));

      const ws = XLSX.utils.json_to_sheet(excelData);
      
      // Set column widths
      ws['!cols'] = [
        { wch: 15 },  // Station_Number
        { wch: 12 },  // crane_aval
        { wch: 60 },  // Final_Order
        { wch: 15 },  // Total_Manpower
        { wch: 12 },  // time_rem
        { wch: 60 }   // Activity_Need_to_done_Before
      ];

      XLSX.utils.book_append_sheet(wb, ws, modelName);
    });

    XLSX.writeFile(wb, 'Line_Balancing_Results.xlsx');
  };

  // Get models from input data
  const models = data?.models || [];

  // Get selected model's data
  const getModelData = (modelName) => {
    // Convert model name to match finalData keys (replace dots with underscores)
    const safeModelName = modelName.replace('.', '_');
    return finalData[safeModelName] || [];
  };

  const selectedModelData = selectedModel ? getModelData(selectedModel.name) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 text-white p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-gradient-to-r from-slate-800/80 to-gray-800/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-700/50 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={onBackToInput}
                  className="bg-white/20 p-3 rounded-xl hover:bg-white/30 transition-all"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <div>
                  <h1 className="text-3xl font-bold">Line Balancing Dashboard</h1>
                  <p className="text-blue-100 mt-1">Production analysis and station optimization</p>
                </div>
              </div>
              <button
                onClick={downloadExcel}
                className="bg-white/20 hover:bg-white/30 px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all"
              >
                <Download className="w-5 h-5" />
                Download Excel
              </button>
            </div>
          </div>

          {/* Input Summary */}
          <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-700/50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-blue-400 mb-2">
                <Calendar className="w-4 h-4" />
                <span className="text-sm font-medium">Date</span>
              </div>
              <p className="text-lg font-bold">{data?.date || 'N/A'}</p>
            </div>
            <div className="bg-slate-700/50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-green-400 mb-2">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">Shift</span>
              </div>
              <p className="text-lg font-bold">{data?.shift || 'N/A'}</p>
            </div>
            <div className="bg-slate-700/50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-purple-400 mb-2">
                <Layers className="w-4 h-4" />
                <span className="text-sm font-medium">Line</span>
              </div>
              <p className="text-lg font-bold">Line {data?.line || 'N/A'}</p>
            </div>
            <div className="bg-slate-700/50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-orange-400 mb-2">
                <Database className="w-4 h-4" />
                <span className="text-sm font-medium">Stations</span>
              </div>
              <p className="text-lg font-bold">{data?.noOfStations || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Model Selection Buttons */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Package className="w-6 h-6 text-orange-400" />
            Select Model to View Details
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
            {models.map((model) => (
              <button
                key={model.name}
                onClick={() => setSelectedModel(model)}
                className={`p-4 rounded-xl font-semibold transition-all duration-200 border-2 ${
                  selectedModel?.name === model.name
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 border-blue-400 shadow-lg scale-105'
                    : 'bg-slate-700/50 border-gray-600 hover:border-blue-400 hover:bg-slate-700'
                }`}
              >
                <div className="text-center">
                  <p className="text-lg font-bold">{model.name}</p>
                  <p className="text-sm text-gray-300 mt-1">Qty: {model.quantity}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Station Details */}
      {selectedModel && selectedModelData.length > 0 && (
        <div className="max-w-7xl mx-auto">
          <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <BarChart3 className="w-7 h-7 text-blue-400" />
                Station Details - {selectedModel.name}
              </h2>
              <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 px-4 py-2 rounded-xl border border-blue-500/30">
                <span className="text-blue-300 font-semibold">
                  {selectedModelData.length} Stations
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {selectedModelData.map((station, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-r from-slate-700/50 to-gray-800/50 rounded-xl border-2 border-gray-600/50 overflow-hidden hover:border-blue-500/50 transition-all duration-200"
                >
                  {/* Station Header */}
                  <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 px-6 py-4 border-b border-gray-600/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="bg-blue-600 text-white w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg">
                          {station.Station_Number}
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Station Number</p>
                          <p className="text-xl font-bold">{station.Station_Number}</p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="text-center bg-slate-700/50 px-4 py-2 rounded-lg">
                          <p className="text-xs text-gray-400">Crane</p>
                          <p className="text-lg font-bold">
                            {station.crane_aval === 1 ? (
                              <span className="text-green-400">Available</span>
                            ) : (
                              <span className="text-red-400">Not Available</span>
                            )}
                          </p>
                        </div>
                        <div className="text-center bg-slate-700/50 px-4 py-2 rounded-lg">
                          <Users className="w-4 h-4 text-orange-400 mx-auto mb-1" />
                          <p className="text-xs text-gray-400">Manpower</p>
                          <p className="text-lg font-bold text-orange-300">{station.Total_Manpower}</p>
                        </div>
                        <div className="text-center bg-slate-700/50 px-4 py-2 rounded-lg">
                          <Timer className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                          <p className="text-xs text-gray-400">Time Remaining</p>
                          <p className="text-lg font-bold text-blue-300">{station.time_rem.toFixed(2)} min</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Station Tasks */}
                  <div className="p-6">
                    <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase">Tasks / Final Order</h4>
                    <div className="space-y-2">
                      {station.Final_Order.map((task, taskIndex) => (
                        <div
                          key={taskIndex}
                          className="bg-slate-800/50 px-4 py-3 rounded-lg border border-gray-600/30 hover:border-blue-500/50 transition-all"
                        >
                          <div className="flex items-start gap-3">
                            <div className="bg-blue-600/20 text-blue-300 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                              {taskIndex + 1}
                            </div>
                            <p className="text-gray-200 flex-1">{task}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!selectedModel && (
        <div className="max-w-7xl mx-auto">
          <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-12 border border-gray-700/50 text-center">
            <Package className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No Model Selected</h3>
            <p className="text-gray-500">Please select a model from the options above to view station details</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;