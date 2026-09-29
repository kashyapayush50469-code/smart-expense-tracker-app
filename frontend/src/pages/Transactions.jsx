import { useState, useEffect } from "react";
import api from "../api/axios";

function Transactions() {
    const [transactions, setTransactions] = useState([]);
    const [categoryId, setCategoryId] = useState("");
    const [amount, setAmount] = useState("");
    const [type, setType] = useState("expense");
    const [description, setDescription] = useState("");
    const [editingId, setEditingId] = useState(null);   // naya state - kaunsa transaction edit ho raha hai
    const [nlpText, setNlpText] = useState("");
    const [nlpMessage, setNlpMessage] = useState("");


    const token = localStorage.getItem("token");

    const fetchTransactions = async () => {
        try {
            const response = await api.get("/transactions", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTransactions(response.data);
        } catch (err) {
            console.log("Error fetching transactions:", err);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    const resetForm = () => {
        setCategoryId("");
        setAmount("");
        setType("expense");
        setDescription("");
        setEditingId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = { category_id: parseInt(categoryId), amount: parseFloat(amount), type, description };

        try {
            if (editingId) {
                // Update mode
                await api.put(`/transactions/${editingId}`, data, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                // Create mode
                await api.post("/transactions", data, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            resetForm();
            fetchTransactions();
        } catch (err) {
            console.log("Error saving transaction:", err);
        }
    };

    const handleEdit = (t) => {
        setCategoryId(t.category_id);
        setAmount(t.amount);
        setType(t.type);
        setDescription(t.description || "");
        setEditingId(t.id);
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/transactions/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchTransactions();
        } catch (err) {
            console.log("Error deleting transaction:", err);
        }
    };

    const handleNlpSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post(
                `/parse-expense?text=${encodeURIComponent(nlpText)}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setNlpMessage(`✅ Added: ₹${response.data.parsed_data.amount} under ${response.data.parsed_data.category}`);
            setNlpText("");
            fetchTransactions();
        } catch (err) {
            setNlpMessage(`❌ ${err.response?.data?.detail || "Could not parse expense"}`);
        }
      };

    return (
        <>
            <div className="auto-fit" style={{display:"block"}}>
                <h2 style={{marginTop:"50px"}} className="dash">Your Transactions</h2>                                      
                <div className="transaction-layout">
                 <div className="transanction-left">
                    <form className="Transactions-form-field" onSubmit={handleSubmit}>
                        <input className="Tran-input" type="number" placeholder="Category ID" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} />
                        <input className="Tran-input" type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
                        <select className="Tran-input" value={type} onChange={(e) => setType(e.target.value)}>
                            <option className="drop" value="expense">Expense</option>
                            <option className="drop" value="income">Income</option>
                        </select>
                        <input className="Tran-input" type="text" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
                        <button className="Tran-button" type="submit">{editingId ? "Update Transaction" : "Add Transaction"}</button>
                        {editingId && <button className="cancle" type="button" onClick={resetForm}>Cancel</button>}
                    </form>

                    {/* NLP FORM */}
                    <div>
                            <form className="natural-lang"
                            onSubmit={handleNlpSubmit}
                        >
                            <h3>Quick Add (Natural Language)</h3>

                            <input
                                type="text"
                                placeholder='e.g. "spent 200 on chai"'
                                value={nlpText}
                                onChange={(e) => setNlpText(e.target.value)}
                                className="nat-lang-input"
                            />

                            <button type="submit">
                                Add via Text
                            </button>

                            {nlpMessage && <p>{nlpMessage}</p>}
                        </form>
                    </div>
                  </div>
            

                    {/* RIGHT SIDE */}
                    <ul className="list-items">
                        {transactions.map((t) => (
                            <li key={t.id}>

                                <span>
                                    {t.type} - ₹{t.amount} - {t.description}
                                </span>

                                <div className="list-actions">
                                    <button
                                        className="Edit"
                                        onClick={() => handleEdit(t)}
                                    >
                                        Edit
                                    </button>

                                    <button
                                        className="Edit"
                                        onClick={() => handleDelete(t.id)}
                                    >
                                        Delete
                                    </button>
                                </div>

                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </>
    );
}

export default Transactions;