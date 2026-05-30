/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { bkkApi } from './api';
import { 
  BusinessConfig, 
  Category, 
  FoodItem, 
  Order, 
  HeroBanner, 
  OrderItem 
} from './types';
import { ThreeDotMenu } from './components/ThreeDotMenu';
import { AdminLeftBar } from './components/AdminLeftBar';
import { ReceiptPrinter } from './components/ReceiptPrinter';
import { BottomBar } from './components/BottomBar';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  User, 
  Phone, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Utensils, 
  X, 
  LogIn, 
  Info,
  Lock,
  ArrowRight,
  Sparkles,
  RefreshCw,
  ShoppingBag as CartIcon
} from 'lucide-react';

export default function App() {
  // Page routing state: 'shop' | 'checkout' | 'success' | 'admin'
  const [currentView, setCurrentView] = useState<'shop' | 'checkout' | 'success' | 'admin'>('shop');
  
  // Data State
  const [business, setBusiness] = useState<BusinessConfig | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<FoodItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [heroBanners, setHeroBanners] = useState<HeroBanner[]>([]);
  
  // Active states
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Hero Slider State
  const [activeSlide, setActiveSlide] = useState(0);

  // Cart State (stored locally)
  const [cart, setCart] = useState<{ item: FoodItem; quantity: number }[]>([]);
  const [showCartPopover, setShowCartPopover] = useState(false);
  const popoverTimer = useRef<NodeJS.Timeout | null>(null);

  // Sign In / Admin state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminToken, setAdminToken] = useState<string | null>(localStorage.getItem('bkk_admin_token'));
  const [authError, setAuthError] = useState<string | null>(null);

  // Customer Checkout Checkout state
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [lastPlacedOrder, setLastPlacedOrder] = useState<Order | null>(null);

  // Printing state
  const [activePrintingOrder, setActivePrintingOrder] = useState<Order | null>(null);

  // Load all server side databases initially
  useEffect(() => {
    fetchInitialData();
  }, []);

  // Scroll to top on view change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [currentView]);

  const fetchInitialData = async () => {
    try {
      const biz = await bkkApi.getBusiness();
      const cats = await bkkApi.getCategories();
      const foodItems = await bkkApi.getItems();
      const heroSlides = await bkkApi.getHeroBanners();
      
      setBusiness(biz);
      setCategories(cats);
      setItems(foodItems);
      setHeroBanners(heroSlides);

      // Fetch admin order files if logged in
      if (adminToken) {
        const orderLogs = await bkkApi.getOrders(adminToken);
        setOrders(orderLogs);
      }
    } catch (err) {
      console.error("Failed fetching database", err);
    }
  };

  // Hero Carousel Slides Autoplay
  useEffect(() => {
    if (heroBanners.length === 0) return;
    const interval = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % heroBanners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroBanners]);

  const handleNextSlide = () => {
    setActiveSlide(prev => (prev + 1) % heroBanners.length);
  };

  const handlePrevSlide = () => {
    setActiveSlide(prev => (prev - 1 + heroBanners.length) % heroBanners.length);
  };

  // Cart Handlers
  const addToCart = (food: FoodItem) => {
    if (food.stock <= 0) {
      alert("This delicious item is currently out of stock!");
      return;
    }
    
    setCart(prevCart => {
      const index = prevCart.findIndex(c => c.item.id === food.id);
      let updated = [...prevCart];
      if (index !== -1) {
        if (updated[index].quantity >= food.stock) {
          alert(`We only have ${food.stock} portions in stock right now.`);
          return prevCart;
        }
        updated[index] = { ...updated[index], quantity: updated[index].quantity + 1 };
      } else {
        updated.push({ item: food, quantity: 1 });
      }
      return updated;
    });

    // Alert / Pop up trigger on "Add to Cart" Hover
    setShowCartPopover(true);
    if (popoverTimer.current) clearTimeout(popoverTimer.current);
    popoverTimer.current = setTimeout(() => {
      setShowCartPopover(false);
    }, 4000);
  };

  const updateCartQuantity = (foodId: string, delta: number) => {
    setCart(prev => {
      const idx = prev.findIndex(c => c.item.id === foodId);
      if (idx === -1) return prev;
      
      const updated = [...prev];
      const newQty = updated[idx].quantity + delta;
      
      if (newQty <= 0) {
        updated.splice(idx, 1);
      } else {
        const stockLimit = updated[idx].item.stock;
        if (newQty > stockLimit) {
          alert(`The remaining stock limit for this item is ${stockLimit}.`);
          return prev;
        }
        updated[idx] = { ...updated[idx], quantity: newQty };
      }
      return updated;
    });
  };

  const removeFromCart = (foodId: string) => {
    setCart(prev => prev.filter(c => c.item.id !== foodId));
  };

  // Cart Metrics
  const cartTotalAmount = cart.reduce((acc, c) => acc + (c.item.price * c.quantity), 0);
  const cartTotalItemsCount = cart.reduce((acc, c) => acc + c.quantity, 0);

  // Administrative sign-in handlers
  const handleAdminSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    try {
      const result = await bkkApi.adminLogin(adminUsername, adminPassword);
      if (result.success && result.token) {
        setAdminToken(result.token);
        localStorage.setItem('bkk_admin_token', result.token);
        setShowAuthModal(false);
        setAdminUsername('');
        setAdminPassword('');
        // Sync orders
        const orderLogs = await bkkApi.getOrders(result.token);
        setOrders(orderLogs);
        setCurrentView('admin');
      }
    } catch (err: any) {
      setAuthError(err.message || "Invalid Admin username or password credential key.");
    }
  };

  const handleAdminLogout = () => {
    setAdminToken(null);
    localStorage.removeItem('bkk_admin_token');
    if (currentView === 'admin') {
      setCurrentView('shop');
    }
  };

  // Client checkout placer
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    if (!customerName || !customerPhone) {
      alert("Please supply your name and mobile phone number to place the order.");
      return;
    }

    setPlacingOrder(true);
    try {
      const orderItemsList: OrderItem[] = cart.map(c => ({
        id: c.item.id,
        name: c.item.name,
        price: c.item.price,
        quantity: c.quantity
      }));

      const res = await bkkApi.submitOrder(
        customerName.trim(), 
        customerPhone.trim(), 
        orderItemsList, 
        cartTotalAmount
      );

      if (res.success) {
        setLastPlacedOrder(res.order);
        setCart([]); // Reset Cart
        setCustomerName('');
        setCustomerPhone('');
        setCurrentView('success');
        fetchInitialData(); // Refresh stock levels
      }
    } catch (err: any) {
      alert("Failed submitting culinary order: " + err.message);
    } finally {
      setPlacingOrder(false);
    }
  };

  // Web cart items filter
  const filteredFoodItems = items.filter(it => {
    const matchesCategory = selectedCategory ? (it.category === selectedCategory) : true;
    const matchesSearch = it.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          it.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          it.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Construct printable WhatsApp token link URL
  const getWhatsAppInvoiceUrl = (order: Order) => {
    const orderLines = order.items.map(it => `• ${it.name} (${it.quantity}x) = ₹${it.price * it.quantity}`).join('%0A');
    const invoiceText = `*ORDER PLACED SUCCESSFULLY* %0A` +
                        `*Token Code:* ${order.token} %0A` +
                        `*Customer Name:* ${order.customerName} %0A` +
                        `*Contact Phone:* ${order.phone} %0A` +
                        `*Items Detail:*%0A${orderLines}%0A` +
                        `*Grand Bill:* ₹${order.totalAmount}%0A` +
                        `Please verify my order for cooking setup! Спасибо. %0A` +
                        `_Basak Khana Khajana Food Treasury_`;
    
    // Delivery to business phone: +919800416889 as requested
    return `https://api.whatsapp.com/send?phone=919800416889&text=${invoiceText}`;
  };

  // Redirect client to item list page when clicking categories
  const handleCategorySelectionDirect = (catName: string) => {
    setSelectedCategory(catName);
    setCurrentView('shop');
    setTimeout(() => {
      const grid = document.getElementById('food-grid-display');
      if (grid) grid.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  if (!business) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-8 text-center text-stone-600 no-print">
        <RefreshCw className="w-12 h-12 text-amber-900 animate-spin mb-4" />
        <h3 className="font-extrabold text-stone-850 font-display">Basak Khana Khajana</h3>
        <p className="text-xs text-stone-400 mt-2">Opening the local food treasury kitchen... Please wait.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-stone-50/50 font-sans text-stone-800 antialiased relative overflow-x-clip">
      
      {/* Dynamic colorful decorative bar at top of screen */}
      <div className="h-1.5 w-full bg-gradient-to-r from-red-500 via-orange-500 via-yellow-400 via-emerald-500 via-blue-500 to-fuchsia-600 no-print shrink-0" />

      {/* Decorative colorful background gradients for a festive, vibrant culinary theme */}
      <div className="absolute top-[8%] left-[-15%] w-[50vw] h-[50vw] max-w-[500px] bg-gradient-to-tr from-amber-400/15 via-orange-400/8 to-transparent rounded-full blur-3xl pointer-events-none no-print" />
      <div className="absolute top-[35%] right-[-15%] w-[40vw] h-[40vw] max-w-[420px] bg-gradient-to-bl from-rose-500/10 via-pink-400/5 to-transparent rounded-full blur-3xl pointer-events-none no-print" />
      <div className="absolute bottom-[25%] left-[-10%] w-[45vw] h-[45vw] max-w-[480px] bg-gradient-to-tr from-emerald-400/10 via-teal-400/5 to-transparent rounded-full blur-3xl pointer-events-none no-print" />
      <div className="absolute bottom-[5%] right-[-5%] w-[35vw] h-[35vw] max-w-[380px] bg-gradient-to-br from-violet-400/10 to-transparent rounded-full blur-3xl pointer-events-none no-print" />

      {/* 1. TOP BAR NAVBAR */}
      <header className="bg-amber-950 text-stone-100 py-3 md:py-3.5 px-2.5 sm:px-3 md:px-8 sticky top-0 z-40 shadow-md border-b-4 border-amber-900 no-print">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 md:gap-4">
          
          {/* Logo Brand Title (Stylish adjustments) */}
          <div 
            onClick={() => setCurrentView('shop')} 
            className="flex items-center gap-1.5 md:gap-3 cursor-pointer select-none group min-w-0 flex-1 sm:flex-initial"
            id="brand-header-logo-container"
          >
            <div className="bg-amber-900 p-1 md:p-1.5 rounded-xl border border-amber-800 shadow shadow-amber-990 shrink-0">
              <img 
                src={business.logoUrl} 
                alt="Logo" 
                className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 object-cover rounded-lg md:rounded-xl"
                onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=80&auto=format&fit=crop'; }}
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1 md:gap-1.5 leading-none whitespace-nowrap">
                <span className="font-sans font-black text-stone-100 text-[11px] min-[360px]:text-xs min-[390px]:text-sm sm:text-base md:text-xl uppercase tracking-wide md:tracking-wider">
                  Basak Khana Khajana
                </span>
              </div>
              <p className="text-[8px] md:text-[9px] text-amber-500/80 font-bold uppercase tracking-widest mt-0.5 leading-none hidden sm:block">
                Dulur chhat, Darjeeling
              </p>
            </div>
          </div>

          {/* Quick Menu Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs uppercase font-extrabold tracking-wider text-stone-200">
            <button 
              onClick={() => { setSelectedCategory(null); setCurrentView('shop'); }} 
              className={`hover:text-amber-300 transition-colors cursor-pointer ${currentView === 'shop' ? 'text-amber-400 font-black decoration-2 underline underline-offset-4' : ''}`}
            >
              Menu List
            </button>
            <a href="#bkk-bottom-info" className="hover:text-amber-300 transition-colors">Contact</a>
            <a href="#bkk-bottom-info" className="hover:text-amber-300 transition-colors">About</a>
            {adminToken ? (
              <button 
                onClick={() => setCurrentView('admin')} 
                className="text-amber-400 hover:text-amber-300 transition-colors cursor-pointer flex items-center gap-1 font-extrabold"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Admin Board</span>
              </button>
            ) : (
              <button 
                onClick={() => setShowAuthModal(true)} 
                className="hover:text-amber-300 transition-colors cursor-pointer flex items-center gap-1 font-bold"
              >
                <LogIn className="w-3.5 h-3.5 text-stone-400" />
                <span>Login Panel</span>
              </button>
            )}
          </nav>

          {/* Cart Icon + Rupees Display & Three-dot settings */}
          <div className="flex items-center gap-2">
            
            {/* Interactive Cart Button holding INR Total */}
            <div className="relative shrink-0" onMouseEnter={() => setShowCartPopover(true)} onMouseLeave={() => setShowCartPopover(false)}>
              <button
                onClick={() => setCurrentView('checkout')}
                className="bg-amber-900 border border-amber-800/80 hover:bg-amber-900/60 p-2 px-3 rounded-xl sm:rounded-2xl flex items-center gap-2 transition-all text-white shadow-md active:scale-95 cursor-pointer min-w-0"
                id="cart-topbar-button"
              >
                <div className="relative">
                  <ShoppingBag className="w-5 h-5 text-amber-300" />
                  {cartTotalItemsCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-amber-400 text-stone-900 font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                      {cartTotalItemsCount}
                    </span>
                  )}
                </div>
                <div className="text-left font-black leading-none font-display text-xs sm:text-sm">
                  ₹{cartTotalAmount}
                </div>
              </button>

              {/* Hovering / Floating Cart Popover */}
              {showCartPopover && cart.length > 0 && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-stone-200 p-4 z-50 text-stone-800 animate-slide-in">
                  <h4 className="font-bold text-stone-850 text-xs border-b border-stone-100 pb-2 flex items-center justify-between">
                    <span>Active Cart list</span>
                    <span className="text-[10px] bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded-full">{cartTotalItemsCount} items</span>
                  </h4>
                  <ul className="space-y-2.5 max-h-48 overflow-y-auto pt-2 scrollbar-thin">
                    {cart.map((c) => (
                      <li key={c.item.id} className="flex justify-between items-center gap-2 text-xs">
                        <div className="truncate flex-1">
                          <p className="font-extrabold text-stone-800 truncate">{c.item.name}</p>
                          <p className="text-[10px] text-stone-400">{c.quantity}x @ ₹{c.item.price}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-black text-stone-900">₹{c.quantity * c.item.price}</span>
                          <button
                            onClick={() => removeFromCart(c.item.id)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div className="border-t border-stone-100 mt-2 pt-2.5 flex items-center justify-between">
                    <div>
                      <p className="text-[9px] text-stone-400 uppercase font-black leading-none">Total Amt</p>
                      <p className="text-sm font-extrabold text-amber-970 font-display mt-0.5">₹{cartTotalAmount}</p>
                    </div>
                    <button
                      onClick={() => { setShowCartPopover(false); setCurrentView('checkout'); }}
                      className="px-3.5 py-1.5 bg-amber-950 text-white font-bold rounded-xl text-[10px] uppercase hover:bg-stone-900 transition-colors shadow-xs"
                    >
                      Checkout Now
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Three Dot Configuration Dropdown menu */}
            <ThreeDotMenu
              onSignInClick={() => setShowAuthModal(true)}
              isAdminLoggedIn={!!adminToken}
              onAdminPanelClick={() => setCurrentView('admin')}
              onLogout={handleAdminLogout}
              contactPhones={business.contactPhones}
            />

          </div>
        </div>
      </header>

      {/* 2. ADMIN BOARD SECTION BAR */}
      {currentView === 'admin' && adminToken ? (
        <main className="flex-1 max-w-7xl w-full mx-auto no-print">
          <AdminLeftBar
            business={business}
            categories={categories}
            items={items}
            orders={orders}
            heroBanners={heroBanners}
            adminToken={adminToken}
            onRefreshData={fetchInitialData}
            onExitAdmin={() => setCurrentView('shop')}
            onPrintOrderClick={(ord) => setActivePrintingOrder(ord)}
          />
        </main>
      ) : (
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 space-y-8 no-print">

          {/* VIEW: SHOP PORTAL */}
          {currentView === 'shop' && (
            <div className="space-y-8 animate-fade-in">
              
              {/* HERO PICTURES SLIDER SECTION */}
              {heroBanners.length > 0 && (
                <div className="relative h-[320px] md:h-[420px] w-full rounded-3xl overflow-hidden shadow-xl border border-stone-200">
                  
                  {/* Active Slide Image */}
                  <div className="absolute inset-0 bg-stone-900">
                    <img 
                      src={heroBanners[activeSlide]?.imageUrl} 
                      alt="Banner slide" 
                      className="w-full h-full object-cover opacity-80" 
                    />
                    
                    {/* Shadow overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-900/10 to-transparent"></div>
                  </div>

                  {/* Active Slide Caption Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 text-stone-100 flex flex-col justify-end pointer-events-none max-w-2xl space-y-2">
                    <span className="inline-flex items-center gap-1.5 self-start px-3 py-1 bg-amber-400 text-stone-900 tracking-wider text-[9px] font-black uppercase rounded-full">
                      <Sparkles className="w-3 h-3" /> Basak Treasury Premium Foods
                    </span>
                    <h2 className="text-2xl md:text-4xl font-black font-display tracking-tight leading-tight uppercase">
                      {heroBanners[activeSlide]?.title}
                    </h2>
                    <p className="text-xs md:text-sm text-stone-300 font-medium leading-relaxed">
                      Cooking authentic recipes, fastfoods and finest Darjeeling tea leaves. Order now for safe counter collection and local delivery.
                    </p>
                  </div>

                  {/* Carousel Button Controls */}
                  <div className="absolute top-1/2 -translate-y-1/2 left-4 right-4 flex justify-between select-none p-1 pointer-events-none">
                    <button 
                      onClick={handlePrevSlide} 
                      className="p-1 px-1 bg-white/20 hover:bg-white/40 active:scale-95 text-stone-100 rounded-full cursor-pointer backdrop-blur-md pointer-events-auto border border-white/20 transition-all"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button 
                      onClick={handleNextSlide} 
                      className="p-1 px-1 bg-white/20 hover:bg-white/40 active:scale-95 text-stone-100 rounded-full cursor-pointer backdrop-blur-md pointer-events-auto border border-white/20 transition-all"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Indicators dots */}
                  <div className="absolute bottom-4 right-6 flex gap-1.5">
                    {heroBanners.map((_, i) => (
                      <span 
                        key={i} 
                        onClick={() => setActiveSlide(i)} 
                        className={`w-2.5 h-2.5 rounded-full cursor-pointer transition-all
                          ${activeSlide === i ? 'bg-amber-400 w-6' : 'bg-white/40 hover:bg-white/70'}`}
                      ></span>
                    ))}
                  </div>

                </div>
              )}

              {/* CATEGORY SECTION BLOCK - Breakfast, Lunch, Fastfood, Dinner inside 3rd Row */}
              <div className="space-y-4 pt-4" id="category-browser">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-stone-200 pb-3">
                  <div>
                    <h2 className="font-black text-xl md:text-2xl tracking-tight text-stone-800 font-display flex items-center gap-2">
                      <Utensils className="w-6 h-6 text-amber-900" />
                      Our Culinary Specialties
                    </h2>
                    <p className="text-xs text-stone-500">Pick from our premium GMB listing classifications</p>
                  </div>

                  {/* Search query field */}
                  <div className="relative w-full md:w-80">
                    <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search dish (momo, tea, biryani etc)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white pl-9 pr-4 py-2 border border-stone-200 rounded-2xl text-xs shadow-xs focus:ring-2 focus:ring-amber-200"
                    />
                    {searchQuery && (
                      <button 
                        onClick={() => setSearchQuery('')}
                        className="p-1 absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Category Pill Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-2.5">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`px-4 py-3 rounded-2xl font-bold uppercase tracking-wider text-xs border transition-all cursor-pointer flex flex-col justify-center items-center gap-1.5 shadow-xs
                      ${selectedCategory === null 
                        ? 'bg-gradient-to-r from-amber-900 to-stone-900 border-amber-950 text-stone-50 shadow-md shadow-stone-850/20 scale-102' 
                        : 'bg-white border-stone-200 text-stone-650 hover:bg-stone-50 hover:border-orange-200'
                      }`}
                  >
                    <Utensils className="w-4 h-4 text-orange-500" />
                    <span>View All Menu</span>
                  </button>

                  {categories.map((cat, idx) => {
                    const count = items.filter(it => it.category === cat.name).length;
                    
                    // Dynamic cyclic colourful culinary gradients
                    const colorGradients = [
                      'bg-gradient-to-r from-orange-500 to-amber-600 border-orange-650 shadow-md shadow-orange-500/20 text-white scale-102',
                      'bg-gradient-to-r from-red-500 to-rose-600 border-red-650 shadow-md shadow-rose-500/20 text-white scale-102',
                      'bg-gradient-to-r from-emerald-500 to-teal-600 border-emerald-650 shadow-md shadow-emerald-500/20 text-white scale-102',
                      'bg-gradient-to-r from-blue-500 to-indigo-600 border-blue-650 shadow-md shadow-blue-500/20 text-white scale-102',
                      'bg-gradient-to-r from-fuchsia-500 to-purple-600 border-fuchsia-650 shadow-md shadow-fuchsia-500/20 text-white scale-102',
                      'bg-gradient-to-r from-cyan-500 to-blue-500 border-cyan-650 shadow-md shadow-cyan-500/20 text-white scale-102',
                    ];
                    const activeGradient = colorGradients[idx % colorGradients.length];

                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedCategory(cat.name)}
                        className={`px-4 py-3 rounded-2xl font-bold uppercase tracking-wider text-xs border transition-all cursor-pointer flex flex-col justify-center items-center gap-1.5 shadow-xs
                          ${selectedCategory === cat.name 
                            ? activeGradient 
                            : 'bg-white border-stone-200 text-stone-650 hover:bg-stone-50 hover:border-orange-200'
                          }`}
                      >
                        <span className={`text-[9px] font-mono leading-none tracking-widest ${selectedCategory === cat.name ? 'text-white/80' : 'text-stone-400'}`}>Category</span>
                        <span className="font-extrabold truncate max-w-full">{cat.name} ({count})</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* FOOD ITEM GRID SECTION with Add to Cart and Price */}
              <div className="space-y-4 pt-2" id="food-grid-display">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-stone-800 text-sm uppercase tracking-widest text-stone-550">
                    {selectedCategory ? `Active Selection: ${selectedCategory}` : "Full Treasury Catalog list"} 
                    <span className="text-stone-400 text-xs normal-case font-medium ml-1">({filteredFoodItems.length} delicacies found)</span>
                  </h3>
                </div>

                {filteredFoodItems.length === 0 ? (
                  <div className="text-center py-20 bg-white border rounded-3xl text-stone-400 shadow-xs">
                    <Utensils className="w-12 h-12 mx-auto text-stone-200 mb-2" />
                    <p className="font-extrabold text-stone-700">No items available under this category</p>
                    <p className="text-xs text-stone-500 mt-1">Try another filter button or clear search queries.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
                    {filteredFoodItems.map((food) => {
                      const cartQty = cart.find(c => c.item.id === food.id)?.quantity || 0;
                      return (
                        <div 
                          key={food.id} 
                          className="bg-white border border-stone-200 rounded-2xl md:rounded-3xl overflow-hidden shadow-xs hover:shadow-md hover:border-amber-900/15 transition-all flex flex-col justify-between group"
                        >
                          {/* Image Box - smaller on mobile to keep proportions sleek */}
                          <div className="relative h-28 sm:h-36 md:h-44 lg:h-48 w-full bg-stone-100 overflow-hidden shrink-0">
                            <img 
                              src={food.photoUrl} 
                              alt={food.name} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop'; }}
                            />
                            
                            {/* Stock Badge */}
                            {food.stock <= 0 ? (
                              <span className="absolute top-2 left-2 bg-red-600 text-white text-[7px] sm:text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-sm sm:rounded-md">
                                Sold Out
                              </span>
                            ) : food.stock < 10 ? (
                              <span className="absolute top-2 left-2 bg-amber-500 text-stone-950 text-[7px] sm:text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-sm sm:rounded-md animate-pulse">
                                Only {food.stock} Left
                              </span>
                            ) : null}

                            {/* Category Pill Tag */}
                            <span className={`absolute bottom-2 right-2 backdrop-blur-md text-[8px] sm:text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border-1.5 shadow-sm transition-all
                              ${food.category?.toLowerCase() === 'breakfast' ? 'bg-amber-50/95 border-amber-400 text-amber-900 shadow-amber-200/20' :
                                food.category?.toLowerCase().includes('lunch') ? 'bg-orange-50/95 border-orange-400 text-orange-900 shadow-orange-200/20' :
                                food.category?.toLowerCase().includes('snack') ? 'bg-rose-50/95 border-rose-400 text-rose-900 shadow-rose-200/20' :
                                food.category?.toLowerCase().includes('drink') || food.category?.toLowerCase().includes('beverage') ? 'bg-cyan-50/95 border-cyan-400 text-cyan-900 shadow-cyan-200/20' :
                                food.category?.toLowerCase().includes('dinner') ? 'bg-indigo-50/95 border-indigo-400 text-indigo-900 shadow-indigo-200/20' :
                                'bg-emerald-50/95 border-emerald-400 text-emerald-900 shadow-emerald-200/20'
                              }`}
                            >
                              {food.category}
                            </span>
                          </div>

                          {/* Info Fields */}
                          <div className="p-3 sm:p-5 flex-1 flex flex-col justify-between space-y-2 sm:space-y-4">
                            <div className="space-y-1 sm:space-y-1.5 flex-1">
                              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                                <h4 className="font-extrabold text-stone-850 text-xs sm:text-sm md:text-base leading-tight group-hover:text-amber-950 transition-colors line-clamp-1 sm:line-clamp-2">
                                  {food.name}
                                </h4>
                                <span className="font-black text-amber-970 text-xs sm:text-base md:text-lg font-display shrink-0">
                                  ₹{food.price}
                                </span>
                              </div>
                              <p className="text-[10px] sm:text-xs text-stone-450 leading-snug sm:leading-relaxed line-clamp-2 sm:line-clamp-3">
                                {food.description || "Fresh and prepared on custom order with hygienic and delicious local ingredients. Authentic recipes for food lovers."}
                              </p>
                            </div>

                            {/* Stock Indicator - Always shown directly above the Cart bottom bar */}
                            <div className="flex items-center justify-between text-[10px] sm:text-xs bg-stone-50 p-1.5 px-2 rounded-xl border border-stone-100 text-stone-600">
                              <span className="font-medium text-stone-400">Available Stock:</span>
                              {food.stock <= 0 ? (
                                <span className="text-red-500 font-black text-[11px]">Out of Stock</span>
                              ) : (
                                <span className="text-emerald-700 font-extrabold text-[11px]">{food.stock} portions</span>
                              )}
                            </div>

                            {/* Add to Cart button or Quantity adjuster */}
                            <div className="pt-2 border-t border-stone-100">
                              {cartQty > 0 ? (
                                <div className="flex items-center justify-between bg-amber-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl sm:rounded-2xl border border-amber-250">
                                  <button
                                    onClick={() => updateCartQuantity(food.id, -1)}
                                    className="p-0.5 sm:p-1 bg-white hover:bg-amber-100 rounded-md sm:rounded-lg text-amber-900 transition-colors shadow-xs hover:border hover:border-amber-900/20 active:scale-90 cursor-pointer"
                                  >
                                    <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                  </button>
                                  <span className="font-mono font-extrabold text-stone-850 text-[10px] sm:text-xs">
                                    {cartQty} in Cart
                                  </span>
                                  <button
                                    onClick={() => updateCartQuantity(food.id, 1)}
                                    className="p-0.5 sm:p-1 bg-white hover:bg-amber-100 rounded-md sm:rounded-lg text-amber-900 transition-colors shadow-xs hover:border hover:border-amber-900/20 active:scale-90 cursor-pointer"
                                  >
                                    <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => addToCart(food)}
                                  disabled={food.stock <= 0}
                                  className={`w-full py-1.5 sm:py-2.5 px-2.5 sm:px-4 rounded-xl sm:rounded-2xl font-black text-[11px] sm:text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer
                                    ${food.stock <= 0 
                                      ? 'bg-stone-100 text-stone-400 border border-stone-200 cursor-not-allowed shadow-none'
                                      : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 hover:text-stone-900 border border-amber-400/20 active:scale-97'
                                    }`}
                                >
                                  <CartIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-stone-950" />
                                  <span>{food.stock <= 0 ? "Stock Out" : "Add to Cart"}</span>
                                </button>
                              )}
                            </div>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* VIEW: CHECKOUT PAGE */}
          {currentView === 'checkout' && (
            <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
              <button
                onClick={() => setCurrentView('shop')}
                className="inline-flex items-center gap-1.5 py-1.5 px-3.5 border border-stone-250 hover:bg-stone-50 rounded-xl text-stone-650 hover:text-stone-900 text-xs font-bold transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Return to Menu Grid</span>
              </button>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                
                {/* Selected Basket items */}
                <div className="md:col-span-7 bg-white border rounded-3xl p-5 md:p-6 shadow-xs space-y-4">
                  <h2 className="font-black font-display text-lg text-stone-850 border-b border-stone-100 pb-3 flex justify-between items-center">
                    <span>Chosen Delicacies</span>
                    <span className="text-xs font-medium text-stone-400">({cartTotalItemsCount} portions)</span>
                  </h2>

                  {cart.length === 0 ? (
                    <div className="text-center py-16 space-y-3">
                      <ShoppingBag className="w-12 h-12 mx-auto text-stone-200" />
                      <p className="font-extrabold text-stone-700">Your basket is empty</p>
                      <button
                        onClick={() => setCurrentView('shop')}
                        className="py-2 px-5 bg-amber-970 text-white text-xs font-bold rounded-xl custom-pointer"
                      >
                        See Tasty Delicacies
                      </button>
                    </div>
                  ) : (
                    <div className="divide-y divide-stone-150 space-y-4">
                      {cart.map((c) => (
                        <div key={c.item.id} className="pt-4 flex justify-between items-center gap-4 text-xs">
                          <img 
                            src={c.item.photoUrl} 
                            alt={c.item.name} 
                            className="w-14 h-14 object-cover rounded-xl border shrink-0 bg-stone-100" 
                          />
                          <div className="flex-1 space-y-0.5 truncate">
                            <h4 className="font-extrabold text-stone-850 text-sm truncate">{c.item.name}</h4>
                            <p className="text-[10px] text-stone-400">{c.item.category} | unit price: ₹{c.item.price}</p>
                            <span className="text-[10px] text-amber-750 font-bold bg-amber-50 px-2 py-0.5 rounded-md">
                              Stock level: {c.item.stock} left
                            </span>
                          </div>

                          <div className="flex flex-col items-end gap-2 shrink-0 select-none">
                            <span className="font-black text-amber-970 text-sm">₹{c.item.price * c.quantity}</span>
                            
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateCartQuantity(c.item.id, -1)}
                                className="p-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg shrink-0"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="font-mono font-extrabold border bg-stone-50 text-stone-800 rounded-md px-2 py-0.5 text-[11px]">
                                {c.quantity}
                              </span>
                              <button
                                onClick={() => updateCartQuantity(c.item.id, 1)}
                                className="p-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg shrink-0"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {cart.length > 0 && (
                    <div className="border-t border-dashed border-stone-200 pt-4 mt-6 text-sm text-stone-700 space-y-1.5 font-medium">
                      <div className="flex justify-between">
                        <span>Culinary Subtotal:</span>
                        <span>₹{cartTotalAmount}</span>
                      </div>
                      <div className="flex justify-between text-xs text-stone-400">
                        <span>Local In-restaurant service taxes:</span>
                        <span>₹0.00 (Zero GST Promo)</span>
                      </div>
                      <div className="flex justify-between border-t border-stone-105 pt-2 text-base font-extrabold text-stone-900">
                        <span>Invoice Grand Total:</span>
                        <span className="font-display text-amber-970">₹{cartTotalAmount}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Placer Form (Name and Phone) */}
                <div className="md:col-span-5 bg-white text-stone-800 border border-stone-200 rounded-3xl p-5 md:p-6 shadow-sm space-y-4">
                  <h2 className="font-extrabold font-display text-lg text-amber-950 border-b border-stone-100 pb-3 flex items-center gap-2">
                    Submit Customer Address
                  </h2>

                  <form onSubmit={handlePlaceOrder} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-stone-550 uppercase tracking-wider block">Customer Name</label>
                      <div className="relative">
                        <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          placeholder="e.g. Sujan Basak"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          className="w-full bg-stone-50 border border-stone-200 text-stone-800 pl-10 pr-4 py-2.5 rounded-xl text-xs focus:ring-2 focus:ring-amber-200 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-stone-550 uppercase tracking-wider block">Mobile Number (WhatsApp Sendout)</label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          required
                          pattern="^\+?[0-9\s-]{10,15}$"
                          placeholder="e.g. 9800416889"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          className="w-full bg-stone-50 border border-stone-200 text-stone-800 pl-10 pr-4 py-2.5 rounded-xl text-xs focus:ring-2 focus:ring-amber-200 focus:outline-none"
                        />
                      </div>
                      <p className="text-[10px] text-stone-400 leading-snug pt-0.5">We will generate your BKK local serial food token upon submissions.</p>
                    </div>

                    <button
                      type="submit"
                      disabled={cart.length === 0 || placingOrder}
                      className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-black rounded-xl text-xs uppercase tracking-widest transition-all mt-4 flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-[0.99] disabled:bg-stone-100 disabled:text-stone-400 disabled:from-stone-100 disabled:to-stone-100 disabled:shadow-none"
                    >
                      {placingOrder ? (
                        <span>Submitting Ticket...</span>
                      ) : (
                        <>
                          <span>Submit & Spool Token</span>
                          <ArrowRight className="w-4 h-4 shrink-0" />
                        </>
                      )}
                    </button>
                  </form>
                </div>

              </div>
            </div>
          )}

          {/* VIEW: ORDER SUCCESS */}
          {currentView === 'success' && lastPlacedOrder && (
            <div className="max-w-md mx-auto bg-white border border-stone-250 rounded-3xl p-6 text-center shadow-lg space-y-6 animate-fade-in">
              <div className="p-3 bg-emerald-50 rounded-full inline-flex text-emerald-600 animate-bounce">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              
              <div className="space-y-1">
                <h2 className="font-black font-display text-xl text-stone-850">Ticket Placed Successfully!</h2>
                <p className="text-xs text-stone-500">Your delicious food cooking pipeline has been initialized.</p>
              </div>

              {/* Serial number / Token Badge */}
              <div className="bg-stone-50 p-4 border border-stone-150 rounded-2xl">
                <p className="text-[10px] text-stone-400 uppercase font-black tracking-widest">Awaiting Kitchen Dispatch Serial Token</p>
                <p className="text-2xl font-black font-mono tracking-widest text-stone-900 mt-1">{lastPlacedOrder.token}</p>
              </div>

              {/* Order Summarized details */}
              <div className="text-xs text-stone-600 border border-stone-150 rounded-2xl p-4 text-left divide-y divide-stone-100 leading-normal bg-stone-50/50">
                <p className="pb-2 text-stone-500"><span className="font-bold text-stone-700">Client Name:</span> {lastPlacedOrder.customerName}</p>
                <div className="py-2.5">
                  <p className="font-bold text-stone-750 uppercase text-[10px] tracking-wider mb-1">Portions Ordered</p>
                  {lastPlacedOrder.items.map((it, i) => (
                    <p key={i} className="text-[11px]">• {it.name} ({it.quantity}x) = ₹{it.price * it.quantity}</p>
                  ))}
                </div>
                <p className="pt-2 flex justify-between font-extrabold text-stone-900 text-sm">
                  <span>Grand Bill Amount:</span>
                  <span className="font-display">₹{lastPlacedOrder.totalAmount}</span>
                </p>
              </div>

              {/* Send receipt via dynamic WhatsApp button */}
              <div className="space-y-2 pt-2">
                <a
                  href={getWhatsAppInvoiceUrl(lastPlacedOrder)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  Confirm Order via WhatsApp
                </a>
                <p className="text-[10px] text-stone-400 text-center px-4 leading-relaxed">
                  Clicking the button above automatically redirects you to WhatsApp to send item listings directly to +91 9800416889.
                </p>
              </div>

              <div className="pt-4 border-t border-stone-100">
                <button
                  onClick={() => setCurrentView('shop')}
                  className="px-6 py-2 border border-stone-250 hover:bg-stone-50 text-xs font-bold rounded-xl text-stone-650 hover:text-stone-950 transition-colors cursor-pointer"
                >
                  Return to Store Feed
                </button>
              </div>
            </div>
          )}

        </main>
      )}

      {/* 4. DETAILS BOTTOM BAR ROWS (Google Map / Info / Products Grouped) */}
      <div id="bkk-bottom-info">
        <BottomBar 
          business={business}
          categories={categories}
          items={items}
          onCategoryClick={handleCategorySelectionDirect}
        />
      </div>

      {/* 5. ADMIN AUTH SIGN IN MODAL */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 no-print">
          <div className="bg-stone-900 text-stone-100 rounded-3xl max-w-sm w-full p-6 shadow-2xl relative border border-stone-800">
            <button 
              onClick={() => setShowAuthModal(false)}
              className="absolute right-4 top-4 p-1 rounded-full text-stone-500 hover:bg-stone-800"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center space-y-2 mb-6">
              <div className="p-3 bg-amber-900/40 text-amber-500 rounded-2xl inline-flex mb-1">
                <Lock className="w-6 h-6 animate-pulse" />
              </div>
              <h3 className="font-extrabold font-display text-lg uppercase tracking-wider text-stone-100">Portal Security Key</h3>
              <p className="text-xs text-stone-400">Login username/credentials for Sujan Basak Khana Khajana business admin.</p>
            </div>

            <form onSubmit={handleAdminSignIn} className="space-y-4">
              {authError && (
                <div className="bg-red-950 border border-red-900 p-2.5 rounded-xl text-[11px] font-semibold text-red-400">
                  {authError}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-400 uppercase">Username / Email</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. sujanbasakbkk@gmail.com"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 text-stone-100 px-3 py-2.5 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-400 uppercase">Password Key</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 text-stone-100 px-3 py-2.5 rounded-xl text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-black rounded-xl text-xs uppercase tracking-widest transition-colors mt-4 cursor-pointer"
              >
                Unlock Dashboard Controls
              </button>
            </form>

            <div className="mt-4 pt-3 border-t border-stone-800 text-[10px] text-stone-500 text-center">
              <span>Defaults: sujanbasakbkk@gmail.com / 9800416889 or admin / admin123</span>
            </div>
          </div>
        </div>
      )}

      {/* 6. DYNAMIC OVERLAY RECEIPT PRINTER */}
      {activePrintingOrder && (
        <ReceiptPrinter
          order={activePrintingOrder}
          business={business}
          onClose={() => setActivePrintingOrder(null)}
        />
      )}

    </div>
  );
}
