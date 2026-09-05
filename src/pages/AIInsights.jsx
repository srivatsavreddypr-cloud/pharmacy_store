import React, { useEffect, useState } from "react";
import "./AIInsights.css";
import { fetchAdminInsights } from "../lib/store";

export default function AIInsights() {
  const [insights, setInsights] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    async function load() {
      setLoading(true);
      try {
        const response = await fetchAdminInsights();
        if (!ignore) {
          setInsights(response.insights || []);
          setPredictions(response.predictions || []);
          setRecommendations(response.recommendations || []);
        }
      } catch (error) {
        console.error("Insights load failed:", error);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, []);

  const getImpactColor = (impact) => {
    switch (impact) {
      case "high": return "#ef4444";
      case "medium": return "#f59e0b";
      case "low": return "#10b981";
      default: return "#3b82f6";
    }
  };

  if (loading) {
    return (
      <div className="ai-loading">
        <div className="loader"></div>
        <p>Analyzing live pharmacy data...</p>
      </div>
    );
  }

  return (
    <div className="ai-insights-container">
      <div className="ai-header">
        <h1>AI-Powered Insights</h1>
        <p>Recommendations derived from your current database records</p>
      </div>

      <div className="predictions-section">
        <h2>Sales Predictions</h2>
        <div className="predictions-grid">
          {predictions.map((prediction) => (
            <div key={prediction.id} className="prediction-card">
              <h3>{prediction.title}</h3>
              <div className="prediction-value">{prediction.value}</div>
              <div className="prediction-meta">
                <span className="confidence">Confidence: {prediction.confidence}</span>
                <span className={`trend ${prediction.trend}`}>{prediction.trend === "up" ? "Rising" : "Falling"}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="insights-section">
        <h2>Key Insights</h2>
        <div className="insights-grid">
          {insights.map((insight) => (
            <div key={insight.id} className="insight-card">
              <div className="insight-category">{insight.category}</div>
              <h3>{insight.title}</h3>
              <p>{insight.description}</p>
              <div className="insight-impact" style={{ color: getImpactColor(insight.impact) }}>
                Impact: {insight.impact}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="recommendations-section">
        <h2>Recommendations</h2>
        <div className="recommendations-list">
          {recommendations.map((recommendation) => (
            <div key={recommendation.id} className="recommendation-card">
              <div className="recommendation-header">
                <h3>{recommendation.title}</h3>
                <span className={`priority-${recommendation.priority}`}>{recommendation.priority}</span>
              </div>
              <p className="recommendation-action">{recommendation.action}</p>
              <div className="recommendation-roi">Expected ROI: {recommendation.roi}</div>
              <button className="apply-recommendation">Review Recommendation</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
