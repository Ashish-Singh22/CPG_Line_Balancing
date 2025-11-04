import React, { useState, useCallback } from 'react';
import UserInput from "../components/userInput";
import Dashboard from "../components/Dashboard";
import { Settings, Home as HomeIcon, ArrowLeft } from 'lucide-react';
import SummaryApiPython from '../common/index_python';

const Home = () => {
  const [inputData, setInputData] = useState({
    date: '',
    shift: 'First',
    line: '1',
    noOfStations: 0,
    crane_pos: [],
    models: [],
    workContent: null
  });
  const [finalData, setFinalData] = useState({});

  const [currentView, setCurrentView] = useState('input');

  const handleDataChange = useCallback((data) => {
    setInputData(data);
  }, []);

  const handleBalanceLine = useCallback(async (data) => {
    setInputData(data);

    try {
      const formData = new FormData();
      formData.append("date", data.date);
      formData.append("shift", data.shift);
      formData.append("line", data.line);
      formData.append("noOfStations", data.noOfStations);
      formData.append("crane_pos", JSON.stringify(data.crane_pos)); // Add crane positions
      formData.append("models", JSON.stringify(data.models));
      formData.append("workContent", data.workContent); // File object
      
      console.log("Form Data:");
      console.log("- Date:", data.date);
      console.log("- Shift:", data.shift);
      console.log("- Line:", data.line);
      console.log("- Number of Stations:", data.noOfStations);
      console.log("- Crane Positions:", data.crane_pos);
      console.log("- Models:", data.models);
      console.log("- Work Content:", data.workContent?.name);

      const response = await fetch(SummaryApiPython.lb_uploadController.url, {
        method: "POST",
        body: formData,
        credentials: "include"
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to upload data:", errorText);
        alert(`Failed to process data: ${errorText}`);
        return;
      }
      
      const result = await response.json();
      console.log("Response from backend:", result);
      
      if (result.success) {
        setFinalData(result.data);
        setCurrentView('dashboard');
      } else {
        console.error("Backend returned error:", result.message);
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error("Error during fetch:", error);
      alert(`Network error: ${error.message}`);
    }
  }, []);

  const handleBackToInput = useCallback(() => {
    setCurrentView('input');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900">
      {/* Navigation - Only show when on dashboard */}
      {currentView === 'dashboard' && (
        <div className="fixed top-6 left-6 z-50">
          <div className="bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-700/50 p-2">
            <div className="flex gap-2">
              <button
                onClick={handleBackToInput}
                className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 bg-blue-600 text-white shadow-md hover:bg-blue-700 flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Setup
              </button>
              <button
                onClick={() => setCurrentView('input')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  currentView === 'input'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-gray-300 hover:bg-slate-700'
                }`}
              >
                <Settings className="w-4 h-4 inline mr-2" />
                Setup
              </button>
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  currentView === 'dashboard'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-300 hover:bg-slate-700'
                }`}
              >
                <HomeIcon className="w-4 h-4 inline mr-2" />
                Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {currentView === 'input' ? (
        <UserInput 
          onDataChange={handleDataChange} 
          onBalanceLine={handleBalanceLine}
        />
      ) : (
        <Dashboard 
          data={inputData} 
          onBackToInput={handleBackToInput}
          finalData={finalData}
        />
      )}
    </div>
  );
};

export default Home;