import React from "react";
import {
  BarChart3,
  PieChart,
  TrendingUp,
  Database,
  Calendar,
  Users,
  Shield,
  Target,
  Zap,
  Award,
  CheckCircle,
  Settings,
} from "lucide-react";
import { Link } from "react-router-dom";

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 text-white py-12 px-6">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl shadow-2xl p-10 text-center">
          <div className="flex items-center justify-center gap-4 mb-6">
            <Settings className="w-10 h-10 text-white" />
            <h1 className="text-4xl font-bold">About Production Line Balancing Tool</h1>
          </div>
          <p className="text-blue-100 text-lg max-w-3xl mx-auto">
            This interactive tool helps you configure, visualize, and optimize production line operations
            for multiple models, shifts, and lines — ensuring efficiency, reduced idle time, and balanced workloads.
          </p>
        </div>

        {/* Core Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon={<BarChart3 className="w-8 h-8 text-orange-400" />}
            title="Production Insights"
            desc="Visualize and analyze model quantities, line setup, and total workload instantly."
          />
          <FeatureCard
            icon={<Database className="w-8 h-8 text-green-400" />}
            title="Smart Configuration"
            desc="Easily define shift timings, crane positions, and work content files for each setup."
          />
          <FeatureCard
            icon={<PieChart className="w-8 h-8 text-blue-400" />}
            title="Data-Driven Balancing"
            desc="Automated validation and structured data processing for accurate balancing."
          />
          <FeatureCard
            icon={<Target className="w-8 h-8 text-yellow-400" />}
            title="Optimized Line Allocation"
            desc="Ensure cranes and stations are utilized efficiently to achieve balanced performance."
          />
          <FeatureCard
            icon={<Users className="w-8 h-8 text-pink-400" />}
            title="Collaborative Setup"
            desc="Simplify coordination among production planners, engineers, and supervisors."
          />
          <FeatureCard
            icon={<Award className="w-8 h-8 text-purple-400" />}
            title="Reliable & Scalable"
            desc="Designed for real-world manufacturing environments with scalability in mind."
          />
        </div>

        {/* Why Choose Section */}
        <div className="bg-slate-800/60 rounded-3xl border border-gray-700/50 p-10 backdrop-blur-sm">
          <h2 className="text-3xl font-bold text-center mb-8 flex items-center justify-center gap-3">
            <TrendingUp className="w-8 h-8 text-green-400" />
            Why Choose This Tool?
          </h2>
          <ul className="space-y-4 text-gray-300 max-w-3xl mx-auto">
            <li className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
              <span>Ensures optimal station utilization across varying workloads and shifts.</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
              <span>Reduces bottlenecks by intelligently analyzing crane and station dependencies.</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
              <span>Supports flexible configuration for multiple product models and file inputs.</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
              <span>Integrates seamlessly with future analytics dashboards for deeper insights.</span>
            </li>
          </ul>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <Link
            to="/"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg font-semibold py-4 px-8 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.03]"
          >
            <Zap className="w-6 h-6" />
            Back to Production Setup
          </Link>
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }) => (
  <div className="bg-slate-800/60 rounded-2xl p-6 border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300 backdrop-blur-sm hover:scale-[1.02]">
    <div className="flex items-center justify-center mb-4">{icon}</div>
    <h3 className="text-xl font-bold text-center mb-2">{title}</h3>
    <p className="text-gray-400 text-center">{desc}</p>
  </div>
);

export default About;
