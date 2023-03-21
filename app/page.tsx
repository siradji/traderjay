"use client"; // this is a client component

import { useState, useEffect } from "react";

const styles = {
  container: {
    margin: "auto",
    paddingTop: "6rem",
    maxWidth: "90%",
    color: "#6b7280"
  },
  title: {
    fontSize: "2rem",
    fontWeight: "bold",
    marginBottom: "1.5rem",
  },
  loader: {
    textAlign: "center",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "0.5rem",
    padding: "1.5rem",
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
    marginBottom: "1rem",
  },
  cardTitle: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    marginBottom: "1rem",
  },
  cardSubtitle: {
    fontSize: "1.25rem",
    fontWeight: "bold",
  },
  cardValue: {
    fontSize: "1.5rem",
    fontWeight: "bold",
  },
  greenText: {
    color: "#00c853",
    fontWeight: "bold",
  },
  redText: {
    color: "#d50000",
    fontWeight: "bold",
  },
  button: {
    padding: "0.75rem 1.5rem",
    fontSize: "1.25rem",
    fontWeight: "bold",
    backgroundColor: "#1a202c",
    color: "#ffffff",
    borderRadius: "0.25rem",
    cursor: "pointer",
  },
};

export default function Arbitrage() {
  const [loading, setLoading] = useState(true);
  const [opportunities, setOpportunities] = useState([]);

  const fetchData = async () => {
    try {
      const response = await fetch("/api/trade");
      const data = await response.json();
      setOpportunities(data.data);
      setLoading(false);
      console.log(data.data);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  function handleRefreshClick() {
    fetchData();
  }

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Crypto Arbitrage Opportunities</h2>
      {loading ? (
        <div style={{ textAlign: "center" }}>Loading...</div>
      ) : opportunities.length > 0 ? (
        opportunities.map((opportunity: any, index: number) => (
          <div key={index} style={styles.card}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <h3 style={styles.cardTitle}>{opportunity.ticker}</h3>
              <div
                style={
                  opportunity.profitability > 0 ? styles.greenText : styles.redText
                }
              >
                {opportunity.profitability > 0 ? "+" : ""}
                {opportunity.profitability.toFixed(2)}%
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem", marginTop: "1.5rem" }}>
              <div>
                <h4 style={styles.cardSubtitle}>Buy on {opportunity.highest.exchange}</h4>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                  <span style={{ ...styles.cardSubtitle, color: "#6b7280" }}>Price</span>
                  <span style={styles.cardValue}>{opportunity.highest.price.toFixed(8)}</span>
                  </div>
                  <div style={{ marginTop: "1em" }}>
                <h4 style={styles.cardSubtitle}>Sell on {opportunity.lowest.exchange}</h4>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                  <span style={{ ...styles.cardSubtitle, color: "#6b7280" }}>Price</span>
                  <span style={styles.cardValue}>{opportunity.lowest.price.toFixed(8)}</span>
                  </div>
                  </div>
                 
            </div>
          </div>
        </div>
        
        ))
      ) : (
        <div>No opportunities found</div>
      )}
      <button onClick={handleRefreshClick}>Refresh</button>
    </div>
  );
}
