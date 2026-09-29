import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
// Recharts components import kar rahe hain
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

function Dashboard() {
    const navigate = useNavigate();
    const [summary, setSummary] = useState(null);
    const [budgetStatus, setBudgetStatus] = useState([]);
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const summaryRes = await api.get("/summary", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setSummary(summaryRes.data);

                const budgetRes = await api.get("/budget-status", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setBudgetStatus(budgetRes.data);
            } catch (err) {
                console.log("Error fetching dashboard data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <p>Loading...</p>;

    // Chart ke liye data prepare kar rahe hain (agar summary available hai)
    const chartData = summary ? [
        { name: 'Income', amount: summary.total_income, color: '#4caf50' }, // Green
        { name: 'Expense', amount: summary.total_expense, color: '#f44336' }, // Red
        { name: 'Saving', amount: summary.total_savings, color: '#2196f3' }  // Blue
    ] : [];

    return (
        <div style={{ padding: "20px" }}>
            <h2 className="dash">Your Dashboard</h2>

            {/* Flex container: Left mein Chart, Right mein Details */}
            <div className="dashboard-chart" style={{ display: "flex", gap: "40px", flexWrap: "wrap", marginTop: "30px" }}>

                {/* Left Side: Chart Section */}
                {summary && (
                    <div style={{ flex: 1, minWidth: "300px", height: "532px" }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                {/* XAxis un teeno bar ke niche naam dikhayega (Income, Expense, Saving) */}
                                <XAxis dataKey="name" />
                                {/* YAxis amount ke hisaab se automatically range set karega */}
                                <YAxis />
                                <Tooltip formatter={(value) => `₹${value}`} />
                                <Bar  dataKey="amount">
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* Right Side: List and Budget Alerts Section */}
                <div style={{ flex: 1, minWidth: "300px" }}>

                    {/* Summary List */}
                    {summary && (
                        <div className="summary" style={{ marginBottom: "30px", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }}>
                            <h3 className="summary-text" style={{ color: "white" }}>
                                <div className="text-images">
                                    <img src="https://i.pinimg.com/736x/1b/e1/60/1be160b644f25b22dcdbd3234d70202e.jpg"></img> 
                                    Total Income: ₹{summary.total_income}
                                </div>
                            </h3>
                            <h3 className="summary-text" style={{color:"white"}}>
                              <div className="text-images">  
                                    <img src="https://i.pinimg.com/736x/a9/52/49/a95249e879f2489bdcadb5ff07dcf212.jpg"></img>
                                Total Expense: ₹{summary.total_expense}
                              </div>
                            </h3>
                            <h3 className="summary-text" style={{ color: "white" }}>
                                <div className="text-images">
                                    <img src="https://i.pinimg.com/736x/9d/53/50/9d53502449ad1f3833ae14a7943525b1.jpg"></img>
                                    Total Savings: ₹{summary.total_savings}
                                </div>
                            </h3>
                        </div>
                    )}

                    {/* Budget Alerts List */}
                    <div className="buget-alert" style={{ padding: "20px", borderRadius: "8px" }}>
                        <h3>Budget Alerts</h3>
                        {budgetStatus.length === 0 && <p className="paragraph1">No budgets set for this month.</p>}
                        <ul style={{ paddingLeft: "20px", margin: 0, lineHeight: "1.8"}}>
                            {budgetStatus.map((b) => (
                                <li
                                    key={b.budget_id}
                                    style={{
                                        color: b.status === "exceeded" ? "red" : b.status === "warning" ? "orange" : "green",
                                        fontWeight: "bold",
                                        background:"white",
                                        padding: "10px"
                                    }}
                                >
                                    {b.category_name}: ₹{b.spent} / ₹{b.limit_amount} ({b.percentage}%)
                                    {b.status === "exceeded" && " ⚠️ Budget Exceeded!"}
                                    {b.status === "warning" && " ⚠️ Approaching Limit!"}
                                </li>
                            ))}
                        </ul>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default Dashboard;