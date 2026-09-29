import { useState, useEffect } from "react";
import api from "../api/axios";

function Budgets() {
    const [budgets, setBudgets] = useState([]);
    const [categoryId, setCategoryId] = useState("");
    const [limitAmount, setLimitAmount] = useState("");
    const [month, setMonth] = useState("");
    const [year, setYear] = useState("");
    const [editingId, setEditingId] = useState(null);

    const token = localStorage.getItem("token");

    const fetchBudgets = async () => {
        try {
            const response = await api.get("/budgets", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBudgets(response.data);
        } catch (err) {
            console.log("Error fetching budgets:", err);
        }
    };

    useEffect(() => {
        fetchBudgets();
    }, []);

    const resetForm = () => {
        setCategoryId("");
        setLimitAmount("");
        setMonth("");
        setYear("");
        setEditingId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = {
            category_id: parseInt(categoryId),
            limit_amount: parseFloat(limitAmount),
            month: parseInt(month),
            year: parseInt(year)
        };

        try {
            if (editingId) {
                await api.put(`/budgets/${editingId}`, data, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await api.post("/budgets", data, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            resetForm();
            fetchBudgets();
        } catch (err) {
            console.log("Error saving budget:", err);
        }
    };

    const handleEdit = (b) => {
        setCategoryId(b.category_id);
        setLimitAmount(b.limit_amount);
        setMonth(b.month);
        setYear(b.year);
        setEditingId(b.id);
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/budgets/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchBudgets();
        } catch (err) {
            console.log("Error deleting budget:", err);
        }
    };

    return (
        <div>
            <h2 style={{marginTop:"50px"}} className="dash">Budgets</h2>

            <div className="budget-layout">

                {/* LEFT SIDE - FORM */}
                <form className="Budgets" onSubmit={handleSubmit}>

                    <input
                        type="number"
                        placeholder="Category ID"
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                    />

                    <input
                        type="number"
                        placeholder="Limit Amount"
                        value={limitAmount}
                        onChange={(e) => setLimitAmount(e.target.value)}
                    />

                    <input
                        type="number"
                        placeholder="Month (1-12)"
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                    />

                    <input
                        type="number"
                        placeholder="Year"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                    />

                    <button type="submit">
                        {editingId ? "Update Budget" : "Add Budget"}
                    </button>

                    {editingId && (
                        <button
                            className="cancle"
                            type="button"
                            onClick={resetForm}
                        >
                            Cancel
                        </button>
                    )}

                </form>


                {/* RIGHT SIDE - BUDGET LIST */}
                <ul className="budget-list">

                    {budgets.map((b) => (
                        <li key={b.id}>

                            <span>
                                Category #{b.category_id} -
                                ₹{b.limit_amount} -
                                {b.month}/{b.year}
                            </span>

                            <div className="list-actions">

                                <button
                                    className="Edit"
                                    onClick={() => handleEdit(b)}
                                >
                                    Edit
                                </button>

                                <button
                                    className="Edit"
                                    onClick={() => handleDelete(b.id)}
                                >
                                    Delete
                                </button>

                            </div>

                        </li>
                    ))}

                </ul>

            </div>
        </div>
    );
}

export default Budgets;