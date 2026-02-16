import { createContext, useState, useContext, useEffect } from "react";

const CartContext = createContext(); //This creates the cart context object ,It will hold: cart items / cart actions (add, remove, update)

export function CartProvider({ children }) {
  //This component wraps the app ,Any component inside it can access the cart
  // Initialize cart from localStorage  / when it first mounts
  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem("cartItem"); //Reads cart data from localStorage
      return savedCart ? JSON.parse(savedCart) : []; //Converts JSON string → JavaScript array
    } catch (error) {
      console.error("Error loading cart from localStorage:", error);
      return [];
    }
  });

  // Every time cartItems changes: React re-renders, useEffect runs , Cart is saved to localStorage
  useEffect(() => {
    //Its job is to keep localStorage in sync with the React state. // every page gets the latest cart from localStorage
    localStorage.setItem("cartItem", JSON.stringify(cartItems)); //convert JavaScript array to JSON String , because localStorage can only store strings ❗
  }, [cartItems]);

  const addToCart = (product) => {
    setCartItems((prevItems) => {
      //prevItems = the previous/current state of cartItems.
      // Create a unique key for the variant: ID + Size + Color
      const variantKey = `${product.id}-${product.size || "NA"}-${product.color || "NA"}`;
      const existingItem = prevItems.find((item) => item.key === variantKey);

      if (existingItem) {
        //If the same product variant exists → increase quantity
        return prevItems.map((item) =>
          item.key === variantKey
            ? { ...item, quantity: item.quantity + product.quantity }
            : item,
        );
      }
      return [...prevItems, { ...product, key: variantKey }]; //Adds a product to the cart
    });
  };

  const removeFromCart = (variantKey) => {
    //Removes an item completely from the cart , Uses filter to remove by key
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.key !== variantKey),
    );
  };

  const updateQuantity = (variantKey, quantity) => {
    if (quantity < 1) {
      //If quantity < 1 → removes item
      removeFromCart(variantKey);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map(
        (
          item, //Otherwise → updates quantity
        ) => (item.key === variantKey ? { ...item, quantity } : item),
      ),
    );
  };

  const clearCart = () => {
    setCartItems([]); //Empties the entire cart
  };

  const getCartTotal = () => {
    //Calculates total cart price
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );
  };

  const getCartCount = () => {
    //Calculates total number of items
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };
  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount,
  };
  return (
    //This makes values available:
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
}

export function useCart() {
  //This is a custom React hook , Simplifies accessing the cart context
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

export default CartContext;
