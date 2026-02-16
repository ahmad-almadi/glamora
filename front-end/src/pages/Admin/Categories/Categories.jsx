import { useState, useEffect } from "react";
import Pagination from "../../../components/Pagination/Pagination";
import api from "../../../utils/api";
import { handleApiError } from "../../../utils/errorHandler";
import "../Products/Products.css";
import "./Categories.css";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [productCounts, setProductCounts] = useState({});

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [formData, setFormData] = useState({
    name: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [categoriesRes, productsRes] = await Promise.all([
        api.get("/products/categories"),
        api.get("/products"),
      ]);

      setCategories(categoriesRes.data);

      // Count products per category
      const counts = {};
      productsRes.data.forEach((product) => {
        const catId = product.categoryId;
        counts[catId] = (counts[catId] || 0) + 1; // how many products belong to each category in one go.
      });
      setProductCounts(counts);

      setLoading(false);
    } catch (err) {
      handleApiError(err, setError, "Fetch Categories");
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAdd = () => {
    setEditingCategory(null);
    setFormData({ name: "" });
    setShowModal(true);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (editingCategory) {
        await api.put(`/products/categories/${editingCategory.id}`, formData);
        setCategories((prev) =>
          //{ ...c } → copies all old properties of this category. { ...c, ...formData } → overwrites the old properties with whatever is in formData.
          prev.map((c) =>
            c.id === editingCategory.id ? { ...c, ...formData } : c,
          ),
        );
      } else {
        const res = await api.post("/products/categories", formData);
        setCategories((prev) => [
          ...prev,
          { ...formData, id: res.data.id || Date.now() }, //If for some reason the backend didn’t return an ID, it uses Date.now() to generate a temporary unique ID.
        ]);
      }
    } catch (err) {
      handleApiError(err, null, "Save Category");
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/products/categories/${deleteTarget.id}`);
    } catch (err) {
      handleApiError(err, null, "Delete Category");
    }
    setCategories((prev) => prev.filter((c) => c.id !== deleteTarget.id));
    setShowDeleteModal(false);
    setDeleteTarget(null);
  };

  // Pagination Logic
  const totalPages = Math.ceil(categories.length / itemsPerPage);
  const paginatedCategories = categories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const confirmDelete = (category) => {
    setDeleteTarget(category);
    setShowDeleteModal(true);
  };

  if (loading) {
    return (
      <div className="products-page">
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="products-page categories-page-specific">
      <div className="page-header-admin">
        <h1 className="page-title-admin">Categories</h1>
        <p className="page-subtitle-admin">
          Organize your products into categories
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="admin-error-alert">
          <i className="fas fa-exclamation-circle"></i>
          {error}
        </div>
      )}

      <div className="products-toolbar">
        <div className="toolbar-spacer"></div>
        <button className="admin-btn admin-btn-primary" onClick={handleAdd}>
          <i className="fas fa-plus"></i>
          Add Category
        </button>
      </div>

      <div className="products-table-wrapper admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Category</th>

              <th>Products</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedCategories.map((category) => (
              <tr key={category.id}>
                <td>
                  <div className="product-cell">
                    <div className="product-details">
                      <div className="product-name">{category.name}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="status-badge info">
                    {productCounts[category.id] || 0} products
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="action-btn"
                      onClick={() => handleEdit(category)}
                      title="Edit"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button
                      className="action-btn danger"
                      onClick={() => confirmDelete(category)}
                      title="Delete"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingCategory ? "Edit Category" : "Add New Category"}
              </h3>
              <button
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group form-group-mb">
                <label className="form-label">
                  Category Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className="admin-input"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter category name"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="admin-btn admin-btn-secondary"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="admin-btn admin-btn-primary"
                onClick={handleSave}
              >
                {editingCategory ? "Save Changes" : "Add Category"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div
          className="modal-overlay delete-modal"
          onClick={() => setShowDeleteModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-body" style={{ paddingTop: "2rem" }}>
              <div className="delete-icon">
                <i className="fas fa-trash-alt"></i>
              </div>
              <h3
                className="modal-title text-center-mb-2"
              >
                Delete Category?
              </h3>
              <p className="delete-message">
                Are you sure you want to delete{" "}
                <span className="delete-item-name">"{deleteTarget?.name}"</span>
                ?
              </p>
              <p
                className="delete-message text-sm-opacity"
              >
                Products in this category will become uncategorized.
              </p>
            </div>
            <div className="modal-footer modal-footer-center">
              <button
                className="admin-btn admin-btn-secondary"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                className="admin-btn admin-btn-danger"
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
