import { useState, useEffect } from "react";
import api from "../api/axios";

function Categories() {
    const [categories, setCategories] = useState([]);
    const [name, setName] = useState("");
    const [type, setType] = useState("expense");
    const [editingId, setEditingId] = useState(null);

    const token = localStorage.getItem("token");

    const fetchCategories = async () => {
        try {
            const response = await api.get("/categories", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCategories(response.data);
        } catch (err) {
            console.log("Error fetching categories:", err);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const resetForm = () => {
        setName("");
        setType("expense");
        setEditingId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = { name, type };

        try {
            if (editingId) {
                await api.put(`/categories/${editingId}`, data, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await api.post("/categories", data, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            resetForm();
            fetchCategories();
        } catch (err) {
            console.log("Error saving category:", err);
        }
    };

    const handleEdit = (c) => {
        setName(c.name);
        setType(c.type);
        setEditingId(c.id);
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/categories/${id}`, { 
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchCategories();
        } catch (err) {
            console.log("Error deleting category:", err);
            alert("Cannot delete this category - it may have existing transactions.");
        }
    };

    return (
        <>
          <h2 style={{ marginTop: "50px" }} className="dash">Categories</h2>
          <div className = "categories-page">
            <div className="category-form-section">

                <form className="Categories"  onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Category Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="cate-input"
                        style={{display:"block"}}
                    />
                    <select className="cate-input" value={type} onChange={(e) => setType(e.target.value)}>
                        <option value="expense">Expense</option>
                        <option value="income">Income</option>
                    </select>
                    <button className="category-button" type="submit">{editingId ? "Update Category" : "Add Category"}</button>
                    {editingId && <button className="cancle" type="button" onClick={resetForm}>Cancel</button>}
                </form>
            </div>

                <div className="category-list-section">
                        <ul className="list-items1">

                            {categories.map((c) => (
                                <li key={c.id}>

                                    <span>
                                        {c.name} ({c.type})
                                        {c.user_id === null && " - Default"}
                                    </span>

                                    <div className="list-actions">
                                        <button
                                            className="Edit"
                                            onClick={() => handleEdit(c)}
                                        >
                                            Edit
                                        </button>

                                        <button
                                            className="Edit"
                                            onClick={() => handleDelete(c.id)}
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

export default Categories;