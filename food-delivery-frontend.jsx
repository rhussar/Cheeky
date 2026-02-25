import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, MapPin, Clock, Star, Plus, Minus, X, CheckCircle } from 'lucide-react';

// API Configuration
const API_URL = 'http://localhost:3001/api';

export default function FoodDeliveryApp() {
  const [view, setView] = useState('home'); // home, menu, cart, checkout, confirmation
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [menuData, setMenuData] = useState(null);
  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  // Form state
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');

  // Fetch restaurants on mount
  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const response = await fetch(`${API_URL}/restaurants`);
      const data = await response.json();
      setRestaurants(data);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    }
  };

  const fetchMenu = async (restaurantId) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/restaurants/${restaurantId}/menu`);
      const data = await response.json();
      setMenuData(data);
      setSelectedRestaurant(data.restaurant);
      setView('menu');
    } catch (error) {
      console.error('Error fetching menu:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (item) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    if (existingItem) {
      setCart(cart.map(cartItem =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1, restaurantId: selectedRestaurant.id }]);
    }
  };

  const removeFromCart = (itemId) => {
    const existingItem = cart.find(item => item.id === itemId);
    if (existingItem && existingItem.quantity > 1) {
      setCart(cart.map(item =>
        item.id === itemId
          ? { ...item, quantity: item.quantity - 1 }
          : item
      ));
    } else {
      setCart(cart.filter(item => item.id !== itemId));
    }
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const deliveryFee = selectedRestaurant?.deliveryFee || 0;
    return subtotal + deliveryFee;
  };

  const placeOrder = async () => {
    if (!customerName || !customerPhone || !deliveryAddress) {
      alert('Please fill in all delivery details');
      return;
    }

    setLoading(true);
    try {
      const orderPayload = {
        restaurantId: selectedRestaurant.id,
        items: cart,
        deliveryAddress,
        customerName,
        customerPhone,
        subtotal: calculateSubtotal(),
        deliveryFee: selectedRestaurant.deliveryFee,
        total: calculateTotal()
      };

      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      const order = await response.json();
      setOrderDetails(order);
      setView('confirmation');
      setCart([]);
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredRestaurants = restaurants.filter(r =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.cuisine.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedMenu = menuData?.menu.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {}) || {};

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Work+Sans:wght@300;400;600;800&display=swap');
        
        * {
          font-family: 'Work Sans', sans-serif;
        }
        
        .title-font {
          font-family: 'Bebas Neue', sans-serif;
          letter-spacing: 0.05em;
        }
        
        .brutalist-card {
          border: 3px solid #fff;
          box-shadow: 8px 8px 0 #ff6b35;
          transition: all 0.2s ease;
        }
        
        .brutalist-card:hover {
          transform: translate(-4px, -4px);
          box-shadow: 12px 12px 0 #ff6b35;
        }
        
        .accent-shadow {
          box-shadow: 4px 4px 0 #00d9ff;
        }
        
        .btn-primary {
          background: #ff6b35;
          border: 3px solid #fff;
          box-shadow: 4px 4px 0 #fff;
          transition: all 0.15s ease;
        }
        
        .btn-primary:hover {
          transform: translate(-2px, -2px);
          box-shadow: 6px 6px 0 #fff;
        }
        
        .btn-primary:active {
          transform: translate(1px, 1px);
          box-shadow: 2px 2px 0 #fff;
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slide-up {
          animation: slideUp 0.4s ease-out forwards;
        }
        
        .grid-pattern {
          background-image: 
            linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
          background-size: 30px 30px;
        }
      `}</style>

      {/* Header */}
      <header className="bg-black border-b-4 border-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <h1 
            className="title-font text-5xl text-white cursor-pointer"
            onClick={() => {
              setView('home');
              setSearchQuery('');
            }}
          >
            QUICKBITE
          </h1>
          <button
            onClick={() => setView('cart')}
            className="relative bg-[#ff6b35] text-white px-6 py-3 font-bold text-lg border-3 border-white accent-shadow hover:translate-x-[-2px] hover:translate-y-[-2px] transition-transform"
          >
            <ShoppingCart className="inline mr-2" size={24} />
            CART
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#00d9ff] text-black w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm border-2 border-white">
                {cartItemCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="grid-pattern min-h-screen">
        {/* HOME VIEW */}
        {view === 'home' && (
          <div className="max-w-7xl mx-auto px-6 py-12 animate-slide-up">
            {/* Hero Section */}
            <div className="text-center mb-16">
              <h2 className="title-font text-8xl mb-4 text-white">
                FOOD <span className="text-[#ff6b35]">DELIVERED</span>
              </h2>
              <p className="text-2xl text-gray-400 mb-8">Order from the best restaurants in your city</p>
              
              {/* Search Bar */}
              <div className="max-w-2xl mx-auto relative">
                <input
                  type="text"
                  placeholder="Search restaurants or cuisines..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-6 py-5 text-xl bg-[#1a1a1a] border-3 border-white text-white placeholder-gray-500 accent-shadow focus:outline-none focus:border-[#00d9ff]"
                />
                <Search className="absolute right-6 top-1/2 transform -translate-y-1/2 text-gray-500" size={28} />
              </div>
            </div>

            {/* Restaurant Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredRestaurants.map((restaurant, index) => (
                <div
                  key={restaurant.id}
                  className="brutalist-card bg-[#1a1a1a] p-6 cursor-pointer animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => fetchMenu(restaurant.id)}
                >
                  <div className="text-6xl mb-4">{restaurant.image}</div>
                  <h3 className="title-font text-3xl mb-2">{restaurant.name}</h3>
                  <p className="text-gray-400 text-lg mb-4">{restaurant.cuisine}</p>
                  
                  <div className="flex items-center justify-between text-sm border-t-2 border-gray-700 pt-4">
                    <div className="flex items-center">
                      <Star className="text-[#00d9ff] fill-[#00d9ff] mr-1" size={18} />
                      <span className="font-bold text-lg">{restaurant.rating}</span>
                    </div>
                    <div className="flex items-center text-gray-400">
                      <Clock size={18} className="mr-1" />
                      {restaurant.deliveryTime}
                    </div>
                    <div className="font-bold text-[#ff6b35] text-lg">
                      ${restaurant.deliveryFee.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredRestaurants.length === 0 && (
              <div className="text-center py-20">
                <p className="text-3xl text-gray-500">No restaurants found</p>
              </div>
            )}
          </div>
        )}

        {/* MENU VIEW */}
        {view === 'menu' && menuData && (
          <div className="max-w-7xl mx-auto px-6 py-12 animate-slide-up">
            {/* Restaurant Header */}
            <button
              onClick={() => setView('home')}
              className="mb-8 text-gray-400 hover:text-white text-lg transition-colors"
            >
              ← Back to restaurants
            </button>

            <div className="bg-[#1a1a1a] border-3 border-white p-8 mb-12 accent-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-6">
                  <div className="text-7xl">{selectedRestaurant.image}</div>
                  <div>
                    <h2 className="title-font text-5xl mb-2">{selectedRestaurant.name}</h2>
                    <p className="text-xl text-gray-400 mb-4">{selectedRestaurant.cuisine}</p>
                    <div className="flex items-center gap-6 text-lg">
                      <div className="flex items-center">
                        <Star className="text-[#00d9ff] fill-[#00d9ff] mr-2" size={20} />
                        <span className="font-bold">{selectedRestaurant.rating}</span>
                      </div>
                      <div className="flex items-center text-gray-400">
                        <Clock size={20} className="mr-2" />
                        {selectedRestaurant.deliveryTime}
                      </div>
                      <div className="text-[#ff6b35] font-bold">
                        ${selectedRestaurant.deliveryFee.toFixed(2)} delivery
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            {Object.entries(groupedMenu).map(([category, items]) => (
              <div key={category} className="mb-12">
                <h3 className="title-font text-4xl mb-6 text-[#00d9ff]">{category}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {items.map((item) => {
                    const cartItem = cart.find(c => c.id === item.id);
                    const quantity = cartItem ? cartItem.quantity : 0;

                    return (
                      <div key={item.id} className="bg-[#1a1a1a] border-3 border-gray-700 p-6 hover:border-white transition-colors">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h4 className="text-2xl font-bold mb-2">{item.name}</h4>
                            <p className="text-gray-400 mb-3">{item.description}</p>
                            <p className="text-[#ff6b35] font-bold text-2xl">${item.price.toFixed(2)}</p>
                          </div>
                        </div>

                        {quantity === 0 ? (
                          <button
                            onClick={() => addToCart(item)}
                            className="w-full btn-primary text-white font-bold py-3 text-lg"
                          >
                            <Plus className="inline mr-2" size={20} />
                            ADD TO CART
                          </button>
                        ) : (
                          <div className="flex items-center justify-between bg-[#ff6b35] border-3 border-white p-2">
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="bg-white text-black p-2 font-bold hover:bg-gray-200"
                            >
                              <Minus size={20} />
                            </button>
                            <span className="text-2xl font-bold text-white">{quantity}</span>
                            <button
                              onClick={() => addToCart(item)}
                              className="bg-white text-black p-2 font-bold hover:bg-gray-200"
                            >
                              <Plus size={20} />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CART VIEW */}
        {view === 'cart' && (
          <div className="max-w-4xl mx-auto px-6 py-12 animate-slide-up">
            <button
              onClick={() => setView(selectedRestaurant ? 'menu' : 'home')}
              className="mb-8 text-gray-400 hover:text-white text-lg transition-colors"
            >
              ← Continue shopping
            </button>

            <h2 className="title-font text-6xl mb-8">YOUR CART</h2>

            {cart.length === 0 ? (
              <div className="text-center py-20 bg-[#1a1a1a] border-3 border-gray-700">
                <ShoppingCart size={80} className="mx-auto mb-6 text-gray-600" />
                <p className="text-3xl text-gray-500 mb-4">Your cart is empty</p>
                <button
                  onClick={() => setView('home')}
                  className="btn-primary text-white px-8 py-4 font-bold text-xl"
                >
                  BROWSE RESTAURANTS
                </button>
              </div>
            ) : (
              <>
                {/* Cart Items */}
                <div className="space-y-4 mb-8">
                  {cart.map((item) => (
                    <div key={item.id} className="bg-[#1a1a1a] border-3 border-white p-6 flex justify-between items-center">
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold mb-1">{item.name}</h3>
                        <p className="text-gray-400">${item.price.toFixed(2)} each</p>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="flex items-center bg-[#ff6b35] border-2 border-white">
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-2 hover:bg-white hover:text-black transition-colors"
                          >
                            <Minus size={20} />
                          </button>
                          <span className="px-6 text-xl font-bold">{item.quantity}</span>
                          <button
                            onClick={() => addToCart(item)}
                            className="p-2 hover:bg-white hover:text-black transition-colors"
                          >
                            <Plus size={20} />
                          </button>
                        </div>
                        <p className="text-2xl font-bold text-[#00d9ff] w-24 text-right">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                        <button
                          onClick={() => setCart(cart.filter(c => c.id !== item.id))}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X size={24} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Summary */}
                <div className="bg-[#1a1a1a] border-3 border-white p-8 accent-shadow">
                  <h3 className="title-font text-3xl mb-6">ORDER SUMMARY</h3>
                  <div className="space-y-3 text-xl mb-6">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Subtotal</span>
                      <span className="font-bold">${calculateSubtotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Delivery Fee</span>
                      <span className="font-bold">${selectedRestaurant?.deliveryFee.toFixed(2)}</span>
                    </div>
                    <div className="border-t-2 border-gray-700 pt-3 flex justify-between text-2xl">
                      <span className="font-bold">Total</span>
                      <span className="font-bold text-[#ff6b35]">${calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setView('checkout')}
                    className="w-full btn-primary text-white font-bold py-5 text-xl"
                  >
                    PROCEED TO CHECKOUT
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* CHECKOUT VIEW */}
        {view === 'checkout' && (
          <div className="max-w-3xl mx-auto px-6 py-12 animate-slide-up">
            <button
              onClick={() => setView('cart')}
              className="mb-8 text-gray-400 hover:text-white text-lg transition-colors"
            >
              ← Back to cart
            </button>

            <h2 className="title-font text-6xl mb-8">CHECKOUT</h2>

            <div className="bg-[#1a1a1a] border-3 border-white p-8 accent-shadow mb-8">
              <h3 className="title-font text-3xl mb-6">DELIVERY DETAILS</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-lg font-bold mb-2">Full Name</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-4 py-4 bg-black border-2 border-gray-600 text-white text-lg focus:outline-none focus:border-[#00d9ff]"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-lg font-bold mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-4 py-4 bg-black border-2 border-gray-600 text-white text-lg focus:outline-none focus:border-[#00d9ff]"
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div>
                  <label className="block text-lg font-bold mb-2">Delivery Address</label>
                  <textarea
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="w-full px-4 py-4 bg-black border-2 border-gray-600 text-white text-lg focus:outline-none focus:border-[#00d9ff] resize-none"
                    rows="3"
                    placeholder="123 Main St, Apt 4B, New York, NY 10001"
                  />
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-[#1a1a1a] border-3 border-white p-8 mb-8">
              <h3 className="title-font text-3xl mb-6">ORDER SUMMARY</h3>
              <div className="space-y-2 mb-6">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between text-lg">
                    <span className="text-gray-400">{item.quantity}× {item.name}</span>
                    <span className="font-bold">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t-2 border-gray-700 pt-4 space-y-2 text-xl">
                <div className="flex justify-between">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="font-bold">${calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Delivery Fee</span>
                  <span className="font-bold">${selectedRestaurant?.deliveryFee.toFixed(2)}</span>
                </div>
                <div className="border-t-2 border-gray-700 pt-3 flex justify-between text-2xl">
                  <span className="font-bold">Total</span>
                  <span className="font-bold text-[#ff6b35]">${calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={placeOrder}
              disabled={loading}
              className="w-full btn-primary text-white font-bold py-6 text-2xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'PLACING ORDER...' : 'PLACE ORDER'}
            </button>
          </div>
        )}

        {/* CONFIRMATION VIEW */}
        {view === 'confirmation' && orderDetails && (
          <div className="max-w-3xl mx-auto px-6 py-12 animate-slide-up">
            <div className="text-center mb-12">
              <CheckCircle size={100} className="mx-auto mb-6 text-[#00d9ff]" />
              <h2 className="title-font text-7xl mb-4 text-[#00d9ff]">ORDER CONFIRMED!</h2>
              <p className="text-2xl text-gray-400">Your food is on its way</p>
            </div>

            <div className="bg-[#1a1a1a] border-3 border-white p-8 accent-shadow mb-8">
              <div className="grid grid-cols-2 gap-6 text-lg mb-8">
                <div>
                  <p className="text-gray-400 mb-2">Order Number</p>
                  <p className="font-bold text-2xl text-[#ff6b35]">#{orderDetails.id}</p>
                </div>
                <div>
                  <p className="text-gray-400 mb-2">Estimated Delivery</p>
                  <p className="font-bold text-2xl">{selectedRestaurant?.deliveryTime}</p>
                </div>
              </div>

              <div className="border-t-2 border-gray-700 pt-6 mb-6">
                <h3 className="title-font text-2xl mb-4">DELIVERY TO:</h3>
                <p className="text-lg text-gray-300 mb-2">{orderDetails.customerName}</p>
                <p className="text-lg text-gray-300 mb-2">{orderDetails.customerPhone}</p>
                <p className="text-lg text-gray-400">{orderDetails.deliveryAddress}</p>
              </div>

              <div className="border-t-2 border-gray-700 pt-6">
                <h3 className="title-font text-2xl mb-4">ORDER ITEMS:</h3>
                <div className="space-y-2">
                  {orderDetails.items.map(item => (
                    <div key={item.id} className="flex justify-between text-lg">
                      <span className="text-gray-300">{item.quantity}× {item.name}</span>
                      <span className="font-bold">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t-2 border-gray-700 mt-4 pt-4 flex justify-between text-2xl">
                  <span className="font-bold">Total Paid</span>
                  <span className="font-bold text-[#00d9ff]">${orderDetails.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setView('home');
                setSelectedRestaurant(null);
                setMenuData(null);
                setOrderDetails(null);
              }}
              className="w-full btn-primary text-white font-bold py-5 text-xl"
            >
              ORDER MORE FOOD
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-black border-t-4 border-white py-8 mt-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-gray-500 text-lg">© 2026 QUICKBITE. Fast food, faster delivery.</p>
        </div>
      </footer>
    </div>
  );
}