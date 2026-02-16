import "./Products.css";
import { useState, useEffect } from "react";
import Pagination from "../../../components/Pagination/Pagination";
import api from "../../../utils/api";
import { handleApiError } from "../../../utils/errorHandler";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [validationError, setValidationError] = useState(null);
  const itemsPerPage = 8;

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: "",
    imageUrl: "",
    imageFile: null,
    stock: "",
    isNew: false,
    variants: [{ size: "", color: "", stock: 1 }],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        api.get("/products"),
        api.get("/products/categories"),
      ]);
      setProducts(
        productsRes.data.map((p) => ({
          ...p,
          stock: p.quantity || 0,
        }))
      );
      setCategories(categoriesRes.data);
      setLoading(false);
    } catch (err) {
      handleApiError(err, setError, "Fetch Products");
      setLoading(false);
    }
  };


  // Filter products
  const term = searchTerm.trim().toLowerCase();

  const filteredProducts = products.filter((product) => {
    const searchableText = [product.name]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const matchesSearch = !term || searchableText.includes(term);
    const matchesCategory =
      filterCategory === "all" || product.categoryId === filterCategory;
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "in-stock" && product.stock > 10) ||
      (filterStatus === "low-stock" &&
        product.stock > 0 &&
        product.stock <= 10) ||
      (filterStatus === "out-of-stock" && product.stock === 0);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getCategoryName = (categoryId) => {
    const cat = categories.find((c) => c.id === categoryId);
    return cat ? cat.name : "Uncategorized";
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return "out-of-stock";
    if (stock <= 10) return "low-stock";
    return "in-stock";
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleVariantChange = (index, field, value) => {
    const newVariants = [...formData.variants];
    newVariants[index][field] =
      field === "stock" ? parseInt(value) || 0 : value;

    // Recalculate total stock
    const totalStock = newVariants.reduce(
      (sum, v) => sum + (parseInt(v.stock) || 0),
      0
    );

    setFormData((prev) => ({
      ...prev,
      variants: newVariants,
      stock: totalStock,
    }));
    setValidationError(null);
  };

  const addVariant = () => {
    setFormData((prev) => ({
      ...prev,
      variants: [...prev.variants, { size: "", color: "", stock: 1 }],
    }));
  };

  const removeVariant = (index) => {
    const newVariants = formData.variants.filter((_, i) => i !== index);
    const totalStock = newVariants.reduce(
      (sum, v) => sum + (parseInt(v.stock) || 0),
      0
    );

    setFormData((prev) => ({
      ...prev,
      variants: newVariants,
      stock: totalStock,
    }));
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setValidationError(null);
    setFormData({
      name: "",
      description: "",
      price: "",
      categoryId: "",
      imageUrl: "",
      imageFile: null,
      stock: 1,
      isNew: false,
      variants: [{ size: "", color: "", stock: 1 }],
    });
    setShowModal(true);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setValidationError(null);
    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      categoryId: product.categoryId || "",
      imageUrl: product.imageUrl || product.image || "",
      imageFile: null,
      stock: product.stock.toString(),
      isNew: product.isNew || false,
      variants:
        product.variants && product.variants.length > 0
          ? product.variants.map((v) => ({
            size: v.size,
            color: v.color,
            stock: v.stock,
          }))
          : [{ size: "", color: "", stock: 1 }],
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setValidationError("Product Name is required");
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      setValidationError("Price must be greater than 0");
      return;
    }
    if (!formData.categoryId) {
      setValidationError("Please select a category");
      return;
    }
    if (formData.variants.some((v) => !v.size || !v.color)) {
      setValidationError("Please select both Size and Color for all variants.");
      return;
    }
    if (formData.variants.some((v) => v.stock <= 0)) {
      setValidationError(
        "All variants must have a stock quantity of at least 1."
      );
      return;
    }

    const productFormData = new FormData();
    productFormData.append("name", formData.name);
    productFormData.append("description", formData.description);
    productFormData.append("price", formData.price);
    productFormData.append("quantity", formData.stock);
    productFormData.append("categoryId", formData.categoryId);
    productFormData.append("isNew", formData.isNew);
    productFormData.append("variants", JSON.stringify(formData.variants));

    if (formData.imageFile) {
      productFormData.append("image", formData.imageFile);
    } else if (formData.imageUrl) {
      productFormData.append("imageUrl", formData.imageUrl);
    }

    try {
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };

      if (editingProduct) {
        const res = await api.put(
          `/products/${editingProduct.id}`,
          productFormData,
          config
        );
        setProducts((prev) =>
          prev.map((p) =>
            p.id === editingProduct.id
              ? { ...p, ...res.data, stock: res.data.quantity || 0 }
              : p
          )
        );
      } else {
        const res = await api.post("/products", productFormData, config);
        setProducts((prev) => [
          { ...res.data, stock: res.data.quantity || 0 },
          ...prev,
        ]);
      }
      setShowModal(false);
    } catch (err) {
      handleApiError(err, null, "Save Product");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/products/${deleteTarget.id}`);
      setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setShowDeleteModal(false);
      setDeleteTarget(null);
    } catch (err) {
      handleApiError(err, null, "Delete Product");
    }
  };

  const confirmDelete = (product) => {
    setDeleteTarget(product);
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
    <div className="products-page products-page-specific">
      <div className="page-header-admin">
        <h1 className="page-title-admin">Products</h1>
        <p className="page-subtitle-admin">
          Manage your store's product catalog
        </p>
      </div>

      {error && (
        <div className="admin-error-alert">
          <i className="fas fa-exclamation-circle"></i>
          {error}
        </div>
      )}

      <div className="products-toolbar">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input
            type="text"
            className="admin-input"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <select
            className="admin-select filter-select"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <select
            className="admin-select filter-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="in-stock">In Stock</option>
            <option value="low-stock">Low Stock</option>
            <option value="out-of-stock">Out of Stock</option>
          </select>
        </div>

        <button
          className="admin-btn admin-btn-primary add-product-btn"
          onClick={handleAdd}
        >
          <i className="fas fa-plus"></i>
          Add Product
        </button>
      </div>

      <div className="products-table-wrapper admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th style={{ width: "50px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedProducts.map((product) => (
              <tr key={product.id}>
                <td>
                  <div className="product-cell">
                    <div className="product-img-container">
                      <img
                        src={
                          product.imageUrl
                            ? product.imageUrl.startsWith("http")
                              ? product.imageUrl
                              : `http://glamora.up.railway.app${product.imageUrl.startsWith("/") ? "" : "/"
                              }${product.imageUrl}`
                            : "https://placehold.co/50x50"
                        }
                        alt={product.name}
                        className="product-img-table"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    </div>
                    <div className="product-details">
                      <div className="product-name product-name-table">
                        {product.name}
                      </div>
                      <div className="product-sku product-sku-table">
                        SKU-{product.id.substring(0, 8)}...
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="product-category">
                    {getCategoryName(product.categoryId)}
                  </span>
                </td>
                <td>
                  <span className="product-price">
                    {formatCurrency(product.price)}
                  </span>
                </td>
                <td>
                  <div className="product-stock">
                    <span
                      className={`stock-indicator ${getStockStatus(
                        product.stock
                      )}`}
                    ></span>
                    {product.stock} units
                  </div>
                </td>
                <td>
                  <span
                    className={`status-badge ${product.isNew ? "new" : "standard"
                      }`}
                  >
                    {product.isNew ? "New" : "Standard"}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="action-btn"
                      onClick={() => handleEdit(product)}
                      title="Edit"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button
                      className="action-btn danger"
                      onClick={() => confirmDelete(product)}
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

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div
            className="modal-content wide"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 className="modal-title">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h3>
              <button
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group full-width">
                  <label className="form-label">
                    Product Name <span className="required">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    className="admin-input"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter product name"
                  />
                </div>

                <div className="form-group full-width">
                  <label className="form-label">Description</label>
                  <textarea
                    className="admin-input textarea-vertical"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter product description"
                    rows="3"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Price <span className="required">*</span>
                  </label>
                  <input
                    required
                    type="number"
                    className="admin-input"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="admin-select"
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Variants Section */}
                <div className="form-group full-width">
                  <label className="form-label">
                    Product Variants (Size & Color)
                  </label>
                  <div className="variants-container">
                    {formData.variants.map((variant, index) => (
                      <div key={index} className="variant-row">
                        <select
                          className="admin-select"
                          value={variant.size}
                          onChange={(e) =>
                            handleVariantChange(index, "size", e.target.value)
                          }
                        >
                          <option value="" disabled>
                            Size
                          </option>
                          <option value="XS">XS</option>
                          <option value="S">S</option>
                          <option value="M">M</option>
                          <option value="L">L</option>
                          <option value="XL">XL</option>
                          <option value="XXL">XXL</option>
                        </select>

                        <div className="variant-color-wrapper">
                          <div
                            className="variant-color-preview"
                            style={{
                              backgroundColor: variant.color || "transparent",
                              border: variant.color ? "none" : "1px solid #444",
                            }}
                          ></div>
                          <select
                            className="admin-select variant-color-select"
                            value={variant.color}
                            onChange={(e) =>
                              handleVariantChange(
                                index,
                                "color",
                                e.target.value
                              )
                            }
                          >
                            <option value="" disabled>
                              Color
                            </option>
                            <option value="#000000">Black</option>
                            <option value="#FFFFFF">White</option>
                            <option value="#EF4444">Red</option>
                          </select>
                        </div>

                        <input
                          type="number"
                          min="1"
                          placeholder="Qty"
                          className="admin-input text-center"
                          value={variant.stock}
                          onChange={(e) =>
                            handleVariantChange(index, "stock", e.target.value)
                          }
                        />

                        <button
                          type="button"
                          className="variant-delete-btn"
                          onClick={() => removeVariant(index)}
                          title="Remove Variant"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="admin-btn admin-btn-secondary full-width-mt"
                      onClick={addVariant}
                    >
                      <i className="fas fa-plus"></i> Add Variant
                    </button>
                  </div>
                  <div className="total-stock-info mt-2">
                    <i className="fas fa-info-circle"></i>
                    Total Stock: <strong>{formData.stock}</strong> (Calculated
                    from {formData.variants.length} variants)
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Availability</label>
                  <div
                    className={`toggle-wrapper ${formData.isNew ? "active" : ""
                      }`}
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, isNew: !prev.isNew }))
                    }
                  >
                    <div className="toggle-switch"></div>
                    <span className="toggle-label">Mark as New Arrival</span>
                  </div>
                </div>

                <div className="form-group full-width">
                  <label className="form-label">Product Image</label>
                  <div className="image-upload-container">
                    <label className="custom-file-upload">
                      <input
                        type="file"
                        className="hidden-file-input"
                        name="imageFile"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setFormData((prev) => ({
                              ...prev,
                              imageFile: file,
                              imageUrl: URL.createObjectURL(file),
                            }));
                          }
                        }}
                        accept="image/*"
                      />
                      <div className="upload-content">
                        <i className="fas fa-cloud-upload-alt"></i>
                        <span>Click to upload image</span>
                        {formData.imageFile && (
                          <div className="selected-file-info">
                            <i className="fas fa-check-circle"></i>
                            {formData.imageFile.name}
                          </div>
                        )}
                      </div>
                    </label>
                  </div>
                </div>

                {formData.imageUrl && (
                  <div className="form-group full-width">
                    <hr className="preview-divider" />
                    <div className="preview-label">
                      Uploaded / Preview Image
                    </div>
                    <div className="image-preview-wrapper">
                      <img src={formData.imageUrl} alt="Preview" />
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer column-layout">
              {validationError && (
                <div className="validation-error-msg">
                  {validationError}
                </div>
              )}
              <div className="modal-footer-buttons">
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
                  {editingProduct ? "Save Changes" : "Add Product"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div
          className="modal-overlay delete-modal"
          onClick={() => setShowDeleteModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-body padding-top-2">
              <div className="delete-icon">
                <i className="fas fa-trash-alt"></i>
              </div>
              <h3 className="modal-title text-center-mb-2">
                Delete Product?
              </h3>
              <p className="delete-message">
                Are you sure you want to delete
                <span className="delete-item-name">"{deleteTarget?.name}"</span>
                ?
              </p>
              <p className="delete-message text-sm-opacity">
                This action cannot be undone.
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
