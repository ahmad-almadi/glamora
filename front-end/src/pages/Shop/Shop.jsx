import "./Shop.css";
import "../../styles/global.css";
import ProductCard from "../../components/ProductCard";
import Pagination from "../../components/Pagination/Pagination";
import { useState, useEffect } from "react";
import { getProducts, getCategories } from "../../data/productsData"; //Functions to fetch products and categories from API
export default function Shop() {
  const [categories, setCategories] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [sortBy, setSortBy] = useState("featured");
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false); //toggles sidebar category dropdown.
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);

  useEffect(() => {
    //Fetches categories once when component mounts.
    async function fetchCategories() {
      try {
        const data = await getCategories();
        // Ensure data is an array before setting state
        if (Array.isArray(data)) {
          setCategories(data);
        } else {
          console.error("Categories data is not an array:", data);
          setCategories([]);
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        setCategories([]); // Set empty array on error
      }
    }

    fetchCategories();
  }, []);

  useEffect(() => {
    //Fetches products whenever selectedCategory changes.
    async function fetchProducts() {
      try {
        const data = await getProducts(selectedCategory);
        // Ensure data is an array before setting state
        if (Array.isArray(data)) {
          setAllProducts(data);
        } else {
          console.error("Products data is not an array:", data);
          setAllProducts([]);
        }
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setAllProducts([]); // Set empty array on error
      }
    }

    fetchProducts();
  }, [selectedCategory]);

  ////////////////////////////////////////////////////////////////////////////////////////////////////
  //new Set = removes duplicates automatically ,It is iterable, but not an array its object of type Set
  //...It spreads out all elements of iterable(array,Set,string) individually and because it’s inside square brackets[],all those individual items get collected into a new array
  //[...new Set(...)] = converts the Set back into an array----------------------------------2
  //.flatMap flattens all those arrays into one single array [p.sizes return array]----------1
  //.filter(s => s && s.trim() !== "") Removes any null, undefined, or empty strings---------3
  //.sort() SORT compare based on that order.-------------------------------------------------------------4
  ////////////////////////////////////////////////////////////////////////////////////////////////////

  // Derive unique sizes and colors from products for the sidebar
  const sizeOrder = ["XS", "S", "M", "L", "XL", "XXL"]; //custom order aRRAY

  // Ensure allProducts is an array before using flatMap
  const productsArray = Array.isArray(allProducts) ? allProducts : [];

  const uniqueSizes = [...new Set(productsArray.flatMap((p) => p.sizes || []))]
    .filter((s) => s && s.trim() !== "")
    .sort((a, b) => sizeOrder.indexOf(a) - sizeOrder.indexOf(b));
  const uniqueColors = [
    ...new Set(productsArray.flatMap((p) => p.colors || [])),
  ].filter((c) => c);

  // Fallback if no sizes/colors found (or while loading)
  const sizesToDisplay =
    uniqueSizes.length > 0 ? uniqueSizes : ["XS", "S", "M", "L", "XL", "XXL"];
  const colorsToDisplay =
    uniqueColors.length > 0 ? uniqueColors : ["#000000", "#FFFFFF", "#EF4444"];

  const filteredProducts = productsArray.filter((product) => {
    if (
      //If the product name does not include the search term → return false → exclude product
      searchTerm &&
      !product.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }
    if (selectedCategory !== "all" && product.categoryId !== selectedCategory) {
      //If the product’s category does not match → exclude it
      return false;
    }
    if (product.price < priceRange[0] || product.price > priceRange[1]) {
      //Checks the product’s price against a min/max range If outside the range → exclude
      return false;
    }
    if (
      selectedSize &&
      (!product.sizes || !product.sizes.includes(selectedSize))
    ) {
      //If the user selected a size, check if the product has that size available If not → exclude
      return false;
    }
    if (
      //If the user selected a color, check if the product has that color available If not → exclude
      selectedColor &&
      (!product.colors || !product.colors.includes(selectedColor))
    ) {
      return false;
    }
    return true; ////Returns only products that match all filters.
  });

  //timesort algorithm (hybrid of mergesort + insertion sort) best case O(n) // worst case O(nlog n)
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    // 1. Priority: Stock Status (In-stock first)
    // If a is in stock and b is out of stock, a comes first
    if ((a.quantity > 0) && (!b.quantity || b.quantity === 0)) return -1;
    // If a is out of stock and b is in stock, b comes first
    if ((!a.quantity || a.quantity === 0) && (b.quantity > 0)) return 1;

    // 2. Secondary: User selection
    switch (sortBy) {
      case "price-low":
        return a.price - b.price; //ascending
      case "price-high":
        return b.price - a.price; //descending
      default:
        return 0; //All elements are treated as equal
    }
  });

  // Pagination Logic
  const itemsPerPage = 8; //8 products per page.
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage); //Calculates totalPages.

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    selectedCategory,
    priceRange,
    sortBy,
    searchTerm,
    selectedSize,
    selectedColor,
  ]);

  const paginatedProducts = sortedProducts.slice(
    //Shows only products for the current page.
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="shop-page page-wrapper">
      {/* Page Header */}
      <div className="shop-header">
        <h1>Shop All</h1>
        <p>Discover our complete collection of premium fashion</p>
      </div>

      <div className="shop-container">
        {/* Sidebar Filters */}
        <aside className="shop-sidebar">
          <div className="filter-section">
            {/*A button to toggle categories dropdown. */}
            <button
              className="filter-title-btn"
              onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
            >
              <span>Categories</span>
              <i
                className={`fas fa-chevron-down ${isCategoriesOpen ? "rotate" : ""}`} //The chevron icon rotates when isCategoriesOpen is true.
              ></i>
            </button>

            {isCategoriesOpen && ( //If isCategoriesOpen is true, show the list of categories.
              <ul className="category-list fade-in-slide-down">
                <li key="all">
                  <button
                    className={`category-btn ${selectedCategory === "all" ? "active" : ""}`} //The "active" class highlights the selected category.
                    onClick={() => setSelectedCategory("all")} //Each category button sets the selectedCategory state.
                  >
                    All
                  </button>
                </li>
                {categories.map(
                  (
                    cat, //.map() loops over each category and returns JSX for each one.
                  ) => (
                    <li key={cat.id}>
                      <button
                        className={`category-btn ${selectedCategory === cat.id ? "active" : ""}`}
                        onClick={() => setSelectedCategory(cat.id)}
                      >
                        {cat.name}
                      </button>
                    </li>
                  ),
                )}
              </ul>
            )}
          </div>

          <div className="filter-section">
            <h3 className="filter-title">Price Range</h3>
            <div className="price-filter">
              <div className="price-inputs">
                <input
                  type="number" //all input value stores as strings no matter the type
                  value={priceRange[0]}
                  onChange={
                    (e) =>
                      setPriceRange([Number(e.target.value), priceRange[1]]) //Always returns a string, even if <input type="number"> convert string to number
                  }
                  placeholder="Min"
                  className="price-input"
                />
                <span>-</span>
                <input
                  type="number"
                  value={priceRange[1]}
                  onChange={(e) =>
                    setPriceRange([priceRange[0], Number(e.target.value)])
                  }
                  placeholder="Max"
                  className="price-input"
                />
              </div>
              <input
                type="range"
                min={priceRange[0]}
                max="2000"
                value={priceRange[1]}
                onChange={(e) =>
                  setPriceRange([priceRange[0], Number(e.target.value)])
                }
                className="price-slider"
              />
            </div>
          </div>

          <div className="filter-section">
            <div className="filter-header">
              <h3 className="filter-title">Size</h3>
              {selectedSize && (
                <button
                  className="clear-filter-btn"
                  onClick={() => setSelectedSize(null)} //clear the selected color
                >
                  Clear
                </button>
              )}
            </div>
            <div className="size-options">
              {sizesToDisplay.map((size) => (
                <button
                  key={size}
                  className={`size-btn ${selectedSize === size ? "active" : ""}`}
                  onClick={
                    () => setSelectedSize(selectedSize === size ? null : size) //toggle logic for the size filter button.
                  }
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <div className="filter-header">
              <h3 className="filter-title">Color</h3>
              {selectedColor && (
                <button
                  className="clear-filter-btn"
                  onClick={() => setSelectedColor(null)} //clear the selected color
                >
                  Clear
                </button>
              )}
            </div>
            <div className="color-options">
              {colorsToDisplay.map((color) => (
                <button
                  key={color}
                  className={`color-btn ${selectedColor === color ? "active" : ""}`}
                  style={{
                    backgroundColor: color,
                  }}
                  onClick={
                    () =>
                      setSelectedColor(selectedColor === color ? null : color) //toggle logic for the color filter button.
                  }
                  aria-label={`Color ${color}`} //screen reader cannot see colors. with aria-laber Now the screen reader says: color $color
                ></button>
              ))}
            </div>
          </div>
        </aside>

        {/* Products Grid */}
        <main className="shop-main">
          <div className="shop-toolbar">
            <div className="shop-search">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)} //when state change reach calls shop() again and re-render and recalculated any thing depend on it
              />
            </div>
            <div className="shop-controls">
              <span className="product-count">
                {sortedProducts.length} Products
              </span>
              <select
                className="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)} //Each value tells your sorting logic how to sort the products.
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

          <div className="product-grid">
            {paginatedProducts.map(
              (
                product, //products for the current page only / renders one <ProductCard /> per product
              ) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  image={product.imageUrl}
                  name={product.name}
                  price={product.price}
                  isNew={product.isNew}
                  quantity={product.quantity}
                  variants={product.variants}
                />
              ),
            )}
          </div>

          {sortedProducts.length === 0 && ( //Shows only when no products match the filters
            <div className="no-products">
              <i className="fas fa-search"></i>
              <p>No products found matching your filters</p>
            </div>
          )}

          {/* Pagination Controls */}
          {/*we pass the state setter function to the pagination and inside it when we use onPageChange and change current page its acually setCurrentPage so the state 
           changed in the parent React re-renders EVERYTHING that depends on that state, Parent component re-runs, Pagination re-runs (because it uses currentPage)*/}
          <Pagination // Component props
            currentPage={currentPage} //active page
            totalPages={totalPages} //total number of pages
            onPageChange={setCurrentPage} //updates page state
          />
        </main>
      </div>
    </div>
  );
}
