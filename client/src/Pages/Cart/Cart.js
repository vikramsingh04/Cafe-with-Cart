import React, { useState, useEffect } from "react";
import { getCartItems, deleteCartItem } from "../../Services/Apis"; // Import the deleteCartItem function
import Spinner from "react-bootstrap/Spinner";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPrice, setTotalPrice] = useState(0); // State for total price
  const userToken = sessionStorage.getItem("userdbtoken");
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const decodeToken = () => {
      if (userToken) {
        const [, payloadBase64] = userToken.split('.');
        if (payloadBase64) {
          const payloadJson = atob(payloadBase64);
          const payload = JSON.parse(payloadJson);
          setUserId(payload._id);
        }
      }
    };

    decodeToken();
  }, [userToken]);

  useEffect(() => {
    const fetchCartItems = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        const response = await getCartItems({ userId });
        if (response && response.status === 200 && response.data) {
          setCartItems(response.data);
          // console.log(response.data);
        } else {
          console.error("Error fetching cart items:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching cart items:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCartItems();
  }, [userId]);

  useEffect(() => {
    // Calculate total price whenever cart items change
    const calculateTotalPrice = () => {
      let total = 0;
      cartItems.forEach(item => {
        total += item.price;
      });
      setTotalPrice(total);
    };

    calculateTotalPrice();
  }, [cartItems]);

  // Function to handle item deletion
  const handleDeleteItem = async (itemId) => {
    try {
      setLoading(true);
      const response = await deleteCartItem({ userId, itemId });
      if (response && response.status === 200) {
        // If item is deleted successfully, fetch updated cart items
        const updatedResponse = await getCartItems({ userId });
        if (updatedResponse && updatedResponse.status === 200 && updatedResponse.data) {
          setCartItems(updatedResponse.data);
          console.log("Item deleted successfully");
        }
      } else {
        console.error("Error deleting item:", response.statusText);
      }
    } catch (error) {
      console.error("Error deleting item:", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container my-5">
      <h1 style={{ textDecoration: 'underline', textAlign: 'center', fontWeight: 'bold' }}>YOUR CART</h1>
      <p>Total Items: {cartItems.length}</p> {/* Display length of cartItems */}
      <p>Total Price: {totalPrice}</p> {/* Display total price */}
      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" /> Loading...
        </div>
      ) : (
        <div>
          {cartItems.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th>Price</th>
                  <th>Delete</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item, index) => (
                  <tr key={index}>
                    <td>{item.dishName}</td>
                    <td>{item.price}</td>
                    <td>
                      <button
                        className="btn btn-outline-danger py-1 px-2"
                        onClick={() => handleDeleteItem(item._id)} /* Pass itemId to handleDeleteItem */
                      >
                        Delete Item
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div>No items in the cart.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default Cart;
