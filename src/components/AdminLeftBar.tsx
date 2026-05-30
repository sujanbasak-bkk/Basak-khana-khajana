/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  BusinessConfig, 
  Category, 
  FoodItem, 
  Order, 
  HeroBanner 
} from '../types';
import { bkkApi } from '../api';
import { 
  Building, 
  Layers, 
  PlusCircle, 
  FileText, 
  Image, 
  Printer, 
  ArrowLeft, 
  Check, 
  Save, 
  Trash2, 
  Upload, 
  Package, 
  Edit,
  DollarSign,
  User,
  Phone,
  Clock,
  CheckCircle,
  Plus,
  Minus
} from 'lucide-react';

interface AdminLeftBarProps {
  business: BusinessConfig;
  categories: Category[];
  items: FoodItem[];
  orders: Order[];
  heroBanners: HeroBanner[];
  adminToken: string;
  onRefreshData: () => void;
  onExitAdmin: () => void;
  onPrintOrderClick: (order: Order) => void;
}

type TabType = 'business' | 'categories' | 'items' | 'orders' | 'hero' | 'printer';

interface QuickPriceInputProps {
  item: FoodItem;
  onUpdate: (item: FoodItem, newPrice: number) => Promise<void>;
}

const QuickPriceInput: React.FC<QuickPriceInputProps> = ({ item, onUpdate }) => {
  const [localVal, setLocalVal] = useState<string>(item.price.toString());
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      setLocalVal(item.price.toString());
    }
  }, [item.price, isFocused]);

  const handleSave = async (stringValue: string) => {
    const parsed = parseFloat(stringValue);
    if (isNaN(parsed) || parsed < 0) {
      setLocalVal(item.price.toString());
      return;
    }
    if (parsed !== item.price) {
      await onUpdate(item, parsed);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    }
  };

  const adjustPrice = async (amount: number) => {
    const current = parseFloat(localVal);
    const base = isNaN(current) ? item.price : current;
    const nextVal = Math.max(0, base + amount);
    setLocalVal(nextVal.toString());
    await onUpdate(item, nextVal);
  };

  return (
    <div className="flex items-center gap-1 bg-stone-100 p-0.5 rounded-lg border border-stone-300/80 w-28 shadow-xs">
      <span className="text-stone-500 font-extrabold pl-1 text-[11px] select-none">₹</span>
      <input
        type="number"
        value={localVal}
        onChange={(e) => setLocalVal(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          setIsFocused(false);
          handleSave(localVal);
        }}
        onKeyDown={handleKeyDown}
        className="w-full bg-transparent text-left font-black text-stone-900 text-xs focus:outline-none border-none p-0 pr-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      <div className="flex flex-col border-l border-stone-250 py-0.5">
        <button
          type="button"
          onClick={() => adjustPrice(5)}
          className="px-1.5 hover:text-emerald-500 font-bold text-[9px] cursor-pointer"
          title="Add ₹5"
        >
          ▲
        </button>
        <button
          type="button"
          onClick={() => adjustPrice(-5)}
          className="px-1.5 hover:text-red-500 font-bold text-[9px] cursor-pointer"
          title="Subtract ₹5"
        >
          ▼
        </button>
      </div>
    </div>
  );
};

interface QuickStockInputProps {
  item: FoodItem;
  onUpdate: (item: FoodItem, newStock: number) => Promise<void>;
  slimLayout?: boolean;
}

const QuickStockInput: React.FC<QuickStockInputProps> = ({ item, onUpdate, slimLayout = false }) => {
  const [localVal, setLocalVal] = useState<string>(item.stock.toString());
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      setLocalVal(item.stock.toString());
    }
  }, [item.stock, isFocused]);

  const handleSave = async (stringValue: string) => {
    const parsed = parseInt(stringValue, 10);
    if (isNaN(parsed) || parsed < 0) {
      setLocalVal(item.stock.toString());
      return;
    }
    if (parsed !== item.stock) {
      await onUpdate(item, parsed);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    }
  };

  const adjustStock = async (amount: number) => {
    const current = parseInt(localVal, 10);
    const base = isNaN(current) ? item.stock : current;
    const nextVal = Math.max(0, base + amount);
    setLocalVal(nextVal.toString());
    await onUpdate(item, nextVal);
  };

  if (slimLayout) {
    return (
      <div className="flex items-center gap-0.5 bg-stone-150/80 p-0.5 rounded-md border border-stone-250 w-28">
        <button
          type="button"
          onClick={() => adjustStock(-1)}
          className="w-6 h-6 bg-white text-stone-800 rounded font-bold transition-all flex items-center justify-center shadow-3xs"
        >
          <Minus className="w-3 h-3" />
        </button>
        <input
          type="number"
          value={localVal}
          onChange={(e) => setLocalVal(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            handleSave(localVal);
          }}
          onKeyDown={handleKeyDown}
          className="w-10 bg-transparent text-center font-bold text-stone-800 text-xs focus:outline-none border-none p-0"
        />
        <button
          type="button"
          onClick={() => adjustStock(1)}
          className="w-6 h-6 bg-white text-stone-800 rounded font-bold transition-all flex items-center justify-center shadow-3xs"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 bg-stone-100 p-0.5 rounded-lg border border-stone-300/80 w-32 shadow-xs">
      <button
        type="button"
        onClick={() => adjustStock(-1)}
        className="w-7 h-7 bg-white hover:bg-red-50 text-stone-800 hover:text-red-500 rounded-md font-bold transition-all flex items-center justify-center border border-stone-205 shadow-2xs active:scale-90 cursor-pointer select-none"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>

      <input
        type="number"
        value={localVal}
        onChange={(e) => setLocalVal(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          setIsFocused(false);
          handleSave(localVal);
        }}
        onKeyDown={handleKeyDown}
        className="w-12 bg-transparent text-center font-bold text-stone-800 text-xs focus:outline-none border-none p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />

      <button
        type="button"
        onClick={() => adjustStock(1)}
        className="w-7 h-7 bg-white hover:bg-emerald-50 text-stone-800 hover:text-emerald-500 rounded-md font-bold transition-all flex items-center justify-center border border-stone-205 shadow-2xs active:scale-90 cursor-pointer select-none"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export const AdminLeftBar: React.FC<AdminLeftBarProps> = ({
  business,
  categories,
  items,
  orders,
  heroBanners,
  adminToken,
  onRefreshData,
  onExitAdmin,
  onPrintOrderClick
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('orders');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Business state
  const [bizForm, setBizForm] = useState<BusinessConfig>({ ...business });
  
  // New category state
  const [newCatName, setNewCatName] = useState('');
  
  // Item Form State (for adding / editing)
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);
  const [showItemForm, setShowItemForm] = useState(false);
  const [itemForm, setItemForm] = useState({
    name: '',
    category: categories[0]?.name || 'Breakfast',
    price: '',
    stock: '',
    description: '',
    photoUrl: ''
  });

  // Hero Banners State
  const [newHeroTitle, setNewHeroTitle] = useState('');
  const [newHeroUrl, setNewHeroUrl] = useState('');

  // Bluetooth configuration state
  const [bluetoothDevice, setBluetoothDevice] = useState<string | null>(
    localStorage.getItem('bkk_bluetooth_paired_printer')
  );
  const [customPrinterName, setCustomPrinterName] = useState('');

  const showStatus = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  // 1. Upload base64 helper
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, target: 'logo' | 'item' | 'hero') => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        const base64Data = reader.result as string;
        const uploadResult = await bkkApi.uploadImage(base64Data, file.name);
        
        if (uploadResult.success) {
          if (target === 'logo') {
            setBizForm(prev => ({ ...prev, logoUrl: uploadResult.imageUrl }));
            showStatus("Logo photo uploaded dynamically to storage!");
          } else if (target === 'item') {
            setItemForm(prev => ({ ...prev, photoUrl: uploadResult.imageUrl }));
            if (editingItem) {
              setEditingItem(prev => prev ? { ...prev, photoUrl: uploadResult.imageUrl } : null);
            }
            showStatus("Food photo uploaded dynamically to storage!");
          } else if (target === 'hero') {
            setNewHeroUrl(uploadResult.imageUrl);
            showStatus("Hero photo uploaded dynamically to storage!");
          }
        }
      } catch (err: any) {
        alert("Upload failed: " + err.message);
      } finally {
        setLoading(false);
      }
    };
  };

  // 2. Save Business profile changes
  const saveBusinessConfig = async () => {
    setLoading(true);
    try {
      const res = await bkkApi.updateBusiness(bizForm, adminToken);
      if (res.success) {
        showStatus("Business profile saved successfully!");
        onRefreshData();
      }
    } catch (err: any) {
      alert("Failed saving configuration: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 3. Add Custom category
  const addCategory = async () => {
    if (!newCatName.trim()) return;
    setLoading(true);
    try {
      const updatedCats = [...categories, { id: newCatName.toLowerCase().replace(/\s+/g, '_'), name: newCatName }];
      const res = await bkkApi.saveCategories(updatedCats, adminToken);
      if (res.success) {
        setNewCatName('');
        showStatus(`Category "${newCatName}" added!`);
        onRefreshData();
      }
    } catch (err: any) {
      alert("Error writing categories: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete category helper
  const deleteCategory = async (catId: string) => {
    if (!confirm("Are you sure you want to delete this category? Corresponding foods on frontend must be updated.")) return;
    setLoading(true);
    try {
      const remaining = categories.filter(c => c.id !== catId);
      const res = await bkkApi.saveCategories(remaining, adminToken);
      if (res.success) {
        showStatus("Category removed.");
        onRefreshData();
      }
    } catch (err: any) {
      alert("Error removing category: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 4. Save food item
  const saveFoodItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemForm.name || !itemForm.price) {
      alert("Please enter a name and price");
      return;
    }

    setLoading(true);
    try {
      if (editingItem) {
        // Update existing item
        const res = await bkkApi.updateItem(editingItem.id, {
          name: itemForm.name,
          category: itemForm.category,
          price: Number(itemForm.price),
          stock: Number(itemForm.stock),
          description: itemForm.description,
          photoUrl: itemForm.photoUrl
        }, adminToken);

        if (res.success) {
          showStatus(`Item "${itemForm.name}" updated!`);
          resetItemForm();
          onRefreshData();
        }
      } else {
        // Create new item
        const res = await bkkApi.createItem({
          name: itemForm.name,
          category: itemForm.category,
          price: Number(itemForm.price),
          stock: Number(itemForm.stock) || 0,
          description: itemForm.description,
          photoUrl: itemForm.photoUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop'
        }, adminToken);

        if (res.success) {
          showStatus(`Added new item "${itemForm.name}" to menu!`);
          resetItemForm();
          onRefreshData();
        }
      }
    } catch (err: any) {
      alert("Failed saving item: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const startEditItem = (item: FoodItem) => {
    setEditingItem(item);
    setShowItemForm(true);
    setItemForm({
      name: item.name,
      category: item.category,
      price: String(item.price),
      stock: String(item.stock),
      description: item.description,
      photoUrl: item.photoUrl
    });
  };

  const deleteFoodItem = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove "${name}" from the menu?`)) return;
    setLoading(true);
    try {
      await bkkApi.deleteItem(id, adminToken);
      showStatus("Item deleted from server disk database.");
      onRefreshData();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetItemForm = () => {
    setEditingItem(null);
    setShowItemForm(false);
    setItemForm({
      name: '',
      category: categories[0]?.name || 'Breakfast',
      price: '',
      stock: '',
      description: '',
      photoUrl: ''
    });
  };

  const handleQuickStockUpdate = async (item: FoodItem, newStock: number) => {
    if (newStock < 0) return;
    try {
      const res = await bkkApi.updateItem(item.id, {
        name: item.name,
        category: item.category,
        price: item.price,
        stock: newStock,
        description: item.description,
        photoUrl: item.photoUrl
      }, adminToken);

      if (res.success) {
        onRefreshData();
      }
    } catch (err: any) {
      alert("Failed to update stock quick: " + err.message);
    }
  };

  const handleQuickPriceUpdate = async (item: FoodItem, newPrice: number) => {
    if (newPrice < 0 || isNaN(newPrice)) return;
    try {
      const res = await bkkApi.updateItem(item.id, {
        name: item.name,
        category: item.category,
        price: newPrice,
        stock: item.stock,
        description: item.description,
        photoUrl: item.photoUrl
      }, adminToken);

      if (res.success) {
        onRefreshData();
      }
    } catch (err: any) {
      alert("Failed to update price quick: " + err.message);
    }
  };

  // 5. Hero slider add
  const addHeroBanner = async () => {
    if (!newHeroUrl) {
      alert("Please upload a hero banner image or input URL");
      return;
    }
    setLoading(true);
    try {
      const updatedHero = [...heroBanners, {
        id: `hero_${Date.now()}`,
        imageUrl: newHeroUrl,
        title: newHeroTitle || "Premium Quality Meals Served Raw"
      }];
      const res = await bkkApi.saveHeroBanners(updatedHero, adminToken);
      if (res.success) {
        setNewHeroTitle('');
        setNewHeroUrl('');
        showStatus("Hero banner slide registered!");
        onRefreshData();
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const removeHeroBanner = async (id: string) => {
    if (!confirm("Remove this hero banner from slider list?")) return;
    setLoading(true);
    try {
      const remaining = heroBanners.filter(b => b.id !== id);
      const res = await bkkApi.saveHeroBanners(remaining, adminToken);
      if (res.success) {
        showStatus("Slide removed.");
        onRefreshData();
      }
    } catch (err: any) {
      alert("Error removing banner: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 6. Update order state from panel
  const updateStatusAndRefresh = async (orderId: string, status: 'completed' | 'cancelled' | 'pending') => {
    setLoading(true);
    try {
      await bkkApi.updateOrderStatus(orderId, status, adminToken);
      showStatus("Order state updated successfully!");
      onRefreshData();
    } catch (err: any) {
      alert("Error updating order: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Bluetooth mock activation
  const connectBluetoothController = () => {
    const nav = navigator as any;
    try {
      if (nav && nav.bluetooth && typeof nav.bluetooth.requestDevice === 'function') {
        // Connect real BLE
        nav.bluetooth.requestDevice({
          acceptAllDevices: true,
          optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb']
        })
        .then((device: any) => {
          const name = device.name || "85mm BLE Bill Printer";
          setBluetoothDevice(name);
          localStorage.setItem('bkk_bluetooth_paired_printer', name);
          showStatus(`Bound real Bluetooth device "${name}"!`);
        })
        .catch((e: any) => {
          console.warn(e);
          // Emulate
          const devName = "BKK-Thermal-V2 (Mock)";
          setBluetoothDevice(devName);
          localStorage.setItem('bkk_bluetooth_paired_printer', devName);
          showStatus("Bypassed Bluetooth blockage. Connected simulated Thermal-V2!");
        });
      } else {
        const devName = "BKK-Thermal-XP80 (Emulated)";
        setBluetoothDevice(devName);
        localStorage.setItem('bkk_bluetooth_paired_printer', devName);
        showStatus("Emulated thermal printer connected successfully!");
      }
    } catch (err: any) {
      console.error("Bluetooth API Exception:", err);
      const devName = "BKK-Thermal-XP80 (Emulated)";
      setBluetoothDevice(devName);
      localStorage.setItem('bkk_bluetooth_paired_printer', devName);
      showStatus("Connected emulated high-speed thermal XP80!");
    }
  };

  const connectManualPrinterName = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) {
      alert("Please enter a valid printer name");
      return;
    }
    setBluetoothDevice(trimmed);
    localStorage.setItem('bkk_bluetooth_paired_printer', trimmed);
    setCustomPrinterName('');
    showStatus(`Bound customized printer: "${trimmed}"`);
  };

  const removeBluetoothPrinter = () => {
    setBluetoothDevice(null);
    localStorage.removeItem('bkk_bluetooth_paired_printer');
    showStatus("Printer unbound.");
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-screen bg-stone-50 p-3 sm:p-4 md:p-8">
      
      {/* LEFT NAVIGATION BAR (sticky top horizontal bar on mobile/tablet, vertical sidebar on desktop) */}
      <div className="w-full lg:w-72 bg-white border border-stone-200 rounded-2xl lg:rounded-3xl p-3 sm:p-4 lg:p-5 shadow-sm flex flex-col justify-between shrink-0 sticky top-[60px] sm:top-[68px] lg:top-24 z-30 no-print">
        <div className="w-full">
          {/* Logo Shop Badge: Shown only on desktop/large screens */}
          <div className="hidden lg:flex items-center gap-3 border-b border-stone-100 pb-4 mb-5">
            <img 
              src={bizForm.logoUrl} 
              alt="Logo" 
              className="w-12 h-12 object-cover rounded-xl border border-stone-200 shadow-xs" 
            />
            <div>
              <h3 className="font-extrabold font-display leading-tight text-stone-800 text-sm">{bizForm.name}</h3>
              <p className="text-[10px] uppercase font-bold tracking-widest text-amber-600">Admin Board</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 sm:items-center lg:items-stretch justify-between w-full">
            {/* Scrollable Horizontal Sub Header tabs on mobile/tablets, Stacked buttons on Desktop */}
            <nav className="flex flex-row lg:flex-col gap-1.5 overflow-x-auto pb-1.5 sm:pb-0 lg:pb-0 scrollbar-none snap-x whitespace-nowrap lg:space-y-1 w-full flex-1 min-w-0">
              <button
                type="button"
                onClick={() => { setActiveTab('orders'); resetItemForm(); }}
                className={`text-left px-3.5 py-2 sm:px-4 sm:py-2.5 lg:px-4 lg:py-3 rounded-xl hover:bg-stone-50 text-xs font-semibold flex items-center gap-1.5 lg:gap-3 transition-all cursor-pointer snap-start shrink-0 select-none
                  ${activeTab === 'orders' ? 'bg-amber-100/60 text-amber-900 border-b-2 lg:border-b-0 lg:border-l-4 border-amber-900 font-extrabold' : 'text-stone-600'}`}
              >
                <FileText className="w-4 h-4 shrink-0 text-amber-800" />
                <span>Orders ({orders.length})</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('items'); resetItemForm(); }}
                className={`text-left px-3.5 py-2 sm:px-4 sm:py-2.5 lg:px-4 lg:py-3 rounded-xl hover:bg-stone-50 text-xs font-semibold flex items-center gap-1.5 lg:gap-3 transition-all cursor-pointer snap-start shrink-0 select-none
                  ${activeTab === 'items' ? 'bg-amber-100/60 text-amber-900 border-b-2 lg:border-b-0 lg:border-l-4 border-amber-900 font-extrabold' : 'text-stone-600'}`}
              >
                <Package className="w-4 h-4 shrink-0 text-amber-800" />
                <span>Menu Items ({items.length})</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('categories'); resetItemForm(); }}
                className={`text-left px-3.5 py-2 sm:px-4 sm:py-2.5 lg:px-4 lg:py-3 rounded-xl hover:bg-stone-50 text-xs font-semibold flex items-center gap-1.5 lg:gap-3 transition-all cursor-pointer snap-start shrink-0 select-none
                  ${activeTab === 'categories' ? 'bg-amber-100/60 text-amber-900 border-b-2 lg:border-b-0 lg:border-l-4 border-amber-900 font-extrabold' : 'text-stone-600'}`}
              >
                <Layers className="w-4 h-4 shrink-0 text-amber-800" />
                <span>Categories ({categories.length})</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('business'); resetItemForm(); }}
                className={`text-left px-3.5 py-2 sm:px-4 sm:py-2.5 lg:px-4 lg:py-3 rounded-xl hover:bg-stone-50 text-xs font-semibold flex items-center gap-1.5 lg:gap-3 transition-all cursor-pointer snap-start shrink-0 select-none
                  ${activeTab === 'business' ? 'bg-amber-100/60 text-amber-900 border-b-2 lg:border-b-0 lg:border-l-4 border-amber-900 font-extrabold' : 'text-stone-600'}`}
              >
                <Building className="w-4 h-4 shrink-0 text-amber-800" />
                <span>Business Settings</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('hero'); resetItemForm(); }}
                className={`text-left px-3.5 py-2 sm:px-4 sm:py-2.5 lg:px-4 lg:py-3 rounded-xl hover:bg-stone-50 text-xs font-semibold flex items-center gap-1.5 lg:gap-3 transition-all cursor-pointer snap-start shrink-0 select-none
                  ${activeTab === 'hero' ? 'bg-amber-100/60 text-amber-900 border-b-2 lg:border-b-0 lg:border-l-4 border-amber-900 font-extrabold' : 'text-stone-600'}`}
              >
                <Image className="w-4 h-4 shrink-0 text-amber-800" />
                <span>Slider ({heroBanners.length})</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('printer'); resetItemForm(); }}
                className={`text-left px-3.5 py-2 sm:px-4 sm:py-2.5 lg:px-4 lg:py-3 rounded-xl hover:bg-stone-50 text-xs font-semibold flex items-center gap-1.5 lg:gap-3 transition-all cursor-pointer snap-start shrink-0 select-none
                  ${activeTab === 'printer' ? 'bg-amber-100/60 text-amber-900 border-b-2 lg:border-b-0 lg:border-l-4 border-amber-900 font-extrabold' : 'text-stone-600'}`}
              >
                <Printer className="w-4 h-4 shrink-0 text-amber-800" />
                <span>Printer Settings</span>
              </button>
            </nav>

            {/* Quick Exit and bluetooth indicator strip */}
            <div className="flex items-center gap-2 sm:shrink-0 lg:pt-6 lg:border-t lg:border-stone-100 lg:mt-6 lg:flex-col lg:w-full">
              {bluetoothDevice && (
                <div className="px-2 py-1 bg-emerald-50 border border-emerald-200 rounded-lg text-[9px] text-emerald-800 flex items-center gap-1 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  <span className="font-semibold truncate max-w-[70px] sm:max-w-none">Live Printer</span>
                </div>
              )}

              <button
                type="button"
                onClick={onExitAdmin}
                className="py-1.5 px-3 sm:py-2.5 sm:px-3 text-xs text-stone-600 hover:text-amber-950 font-bold border border-stone-200 hover:border-amber-950/25 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer hover:bg-stone-50 lg:w-full shrink-0 select-none"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Exit</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* DYNAMIC EDITOR PAGE */}
      <div className="flex-1 bg-white border border-stone-200 rounded-3xl p-6 shadow-sm overflow-hidden min-h-[500px]">
        {loading && (
          <div className="bg-amber-900/5 px-4 py-2 text-xs font-semibold text-amber-950 mb-4 animate-pulse rounded-xl flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-800 animate-bounce"></span>
            <span>Storing updates and sync files...</span>
          </div>
        )}

        {statusMessage && (
          <div className="bg-emerald-50 border border-emerald-200 px-4 py-2.5 text-xs font-semibold text-emerald-800 mb-4 rounded-xl flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* -------------------- TAB: ORDERS -------------------- */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <div>
                <h2 className="font-bold text-lg font-display text-stone-800">Customer Orders Timeline</h2>
                <p className="text-xs text-stone-500">View live table orders and print 80mm billing slips</p>
              </div>
              <button 
                onClick={onRefreshData} 
                className="px-3 py-1.5 border border-stone-200 text-xs font-semibold rounded-lg hover:bg-stone-50 cursor-pointer"
              >
                Sync Data
              </button>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-16 text-stone-400">
                <FileText className="w-12 h-12 mx-auto text-stone-300 mb-2 animate-pulse" />
                <p className="font-bold text-sm">No orders received yet today</p>
                <p className="text-xs text-stone-500 mt-1">Orders placed on the frontend will trigger instantly here.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
                {[...orders].reverse().map((order) => {
                  const dateShort = new Date(order.date).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                  });
                  return (
                    <div 
                      key={order.id} 
                      className={`p-4 border rounded-2xl flex flex-col md:flex-row gap-4 justify-between md:items-center shadow-xs transition-all
                        ${order.status === 'pending' ? 'bg-amber-50/40 border-amber-200' : 'border-stone-150 bg-white'}`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2.5 py-1 bg-stone-800 text-stone-100 text-[10px] font-extrabold font-mono tracking-wider rounded-md">
                            {order.token}
                          </span>
                          <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full
                            ${order.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : ''}
                            ${order.status === 'cancelled' ? 'bg-red-105 text-red-700' : ''}
                            ${order.status === 'pending' ? 'bg-amber-100 text-amber-900 animate-pulse' : ''}
                          `}>
                            {order.status}
                          </span>
                          <span className="text-xs text-stone-400 font-medium">{dateShort}</span>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs font-bold text-stone-800">
                            <User className="w-3.5 h-3.5 text-stone-400" />
                            <span>{order.customerName}</span>
                            <span className="text-stone-300 font-normal">|</span>
                            <Phone className="w-3.5 h-3.5 text-stone-400" />
                            <a href={`tel:${order.phone}`} className="hover:underline">{order.phone}</a>
                          </div>
                          
                          {/* Items summarized */}
                          <div className="text-xs text-stone-600 pl-5 leading-normal space-y-0.5">
                            {order.items.map((it, i) => (
                              <p key={i}>
                                • <span className="font-semibold text-stone-850">{it.name}</span> ({it.quantity}x) - ₹{it.price * it.quantity}
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-stretch sm:items-center gap-2 justify-end">
                        <div className="text-right sm:text-left md:text-right pr-2">
                          <p className="text-[10px] text-stone-400 uppercase font-bold tracking-wide">Grand Total</p>
                          <p className="text-base font-extrabold font-display text-amber-950">₹{order.totalAmount}</p>
                        </div>
                        
                        <div className="flex flex-wrap gap-1.5">
                          <button
                            onClick={() => onPrintOrderClick(order)}
                            className="p-2 bg-stone-100 hover:bg-stone-200 text-stone-850 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 text-xs font-bold"
                            title="Print 80mm Receipt"
                          >
                            <Printer className="w-4 h-4 text-stone-700" />
                            <span>Bill</span>
                          </button>

                          {order.status === 'pending' && (
                            <>
                              <button
                                onClick={() => updateStatusAndRefresh(order.id, 'completed')}
                                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Complete</span>
                              </button>
                              <button
                                onClick={() => updateStatusAndRefresh(order.id, 'cancelled')}
                                className="px-3 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-xs font-bold transition-all"
                              >
                                Cancel
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* -------------------- TAB: ITEMS -------------------- */}
        {activeTab === 'items' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
              <div>
                <h2 className="font-extrabold text-lg sm:text-xl font-display text-stone-800 flex items-center gap-2">
                  <Package className="w-5 h-5 text-amber-900" />
                  <span>Menu Items Directory</span>
                </h2>
                <p className="text-xs text-stone-400">View, adjust stock levels, or delete active dishes</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (showItemForm) {
                      resetItemForm();
                    } else {
                      setShowItemForm(true);
                    }
                  }}
                  className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md select-none
                    ${showItemForm 
                      ? 'bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200' 
                      : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 hover:shadow-lg active:scale-97'
                    }`}
                >
                  <PlusCircle className="w-4 h-4 shrink-0" />
                  <span>{showItemForm ? "Close Form" : "Add / Upload Item"}</span>
                </button>
                {editingItem && (
                  <button 
                    type="button"
                    onClick={resetItemForm}
                    className="px-3 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300 text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </div>

            {/* Form */}
            {(showItemForm || editingItem) && (
              <form onSubmit={saveFoodItem} className="bg-stone-50 border border-stone-200 rounded-2xl p-4 md:p-5 space-y-4 animate-in fade-in slide-in-from-top-3 duration-250">
              <h3 className="text-xs uppercase font-extrabold text-stone-400 tracking-wider">
                {editingItem ? `Modify Item Details: ${editingItem.name}` : "Create/Add New Food Item"}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-4 space-y-1">
                  <label className="text-[11px] font-bold text-stone-500 uppercase">Item Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Darjeeling Chicken Momo"
                    value={itemForm.name}
                    onChange={(e) => setItemForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-white px-3 py-2 border border-stone-200 rounded-xl text-xs"
                  />
                </div>

                <div className="md:col-span-3 space-y-1">
                  <label className="text-[11px] font-bold text-stone-500 uppercase">Menu Category</label>
                  <select
                    value={itemForm.category}
                    onChange={(e) => setItemForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full bg-white px-3 py-2 border border-stone-200 rounded-xl text-xs"
                  >
                    {categories.map((c, i) => (
                      <option key={i} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2 space-y-1">
                  <label className="text-[11px] font-bold text-stone-500 uppercase">Price (INR ₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="Price"
                    value={itemForm.price}
                    onChange={(e) => setItemForm(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full bg-white px-3 py-2 border border-stone-200 rounded-xl text-xs"
                  />
                </div>

                <div className="md:col-span-3 space-y-1">
                  <label className="text-[11px] font-bold text-stone-500 uppercase">In Stock (Qty)</label>
                  <input
                    type="number"
                    placeholder="Stock count"
                    value={itemForm.stock}
                    onChange={(e) => setItemForm(prev => ({ ...prev, stock: e.target.value }))}
                    className="w-full bg-white px-3 py-2 border border-stone-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-7 space-y-1">
                  <label className="text-[11px] font-bold text-stone-500 uppercase">Short Description (Appears on client)</label>
                  <textarea
                    placeholder="Spiced savory mixture encased in premium dough steam wraps..."
                    rows={2}
                    value={itemForm.description}
                    onChange={(e) => setItemForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full bg-white px-3 py-2 border border-stone-200 rounded-xl text-xs resize-none"
                  />
                </div>

                <div className="md:col-span-5 space-y-1">
                  <label className="text-[11px] font-bold text-stone-500 uppercase block">Local Image Storage Upload</label>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <label className="px-3 py-2.5 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl cursor-pointer text-xs font-semibold flex items-center justify-center gap-1 shrink-0 select-none">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Choose File</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => handleFileUpload(e, 'item')}
                        className="hidden" 
                      />
                    </label>
                    <input
                      type="text"
                      placeholder="Photo Link or path"
                      value={itemForm.photoUrl}
                      onChange={(e) => setItemForm(prev => ({ ...prev, photoUrl: e.target.value }))}
                      className="w-full sm:flex-1 bg-white px-3 py-2.5 border border-stone-200 rounded-xl text-xs min-w-0 focus:ring-2 focus:ring-amber-200 focus:outline-none"
                    />
                  </div>
                  <p className="text-[10px] text-stone-400">Upload a dish photo or paste an online image link.</p>
                </div>
              </div>

              {/* Complete Actions Row directly below elements */}
              <div className="border-t border-stone-200 pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                {/* Left: Preview Indicator */}
                <div className="flex items-center gap-3 bg-white p-2 border border-stone-150 rounded-xl">
                  <img 
                    src={itemForm.photoUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&auto=format&fit=crop'} 
                    alt="Preview" 
                    className="w-12 h-12 object-cover rounded-lg border border-stone-100"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&auto=format&fit=crop'; }}
                  />
                  <div>
                    <span className="text-[10px] font-black text-amber-900 uppercase tracking-widest block leading-none">Photo Status</span>
                    <span className="text-[11px] text-stone-500 font-medium mt-1 block max-w-[180px] xs:max-w-xs truncate">
                      {itemForm.photoUrl ? "Image Loaded Successfully" : "Using Default Stock Image"}
                    </span>
                  </div>
                </div>

                {/* Right: STANDOUT COMPLETE BUTTON */}
                <div className="shrink-0 flex items-center gap-2">
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 active:scale-[0.98] text-stone-950 font-black rounded-xl text-xs uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer select-none"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>{editingItem ? "Complete & Update Item" : "Complete & Add Item"}</span>
                  </button>
                </div>
              </div>
            </form>
            )}

            {/* List Table: Desktop & Tabley Only */}
            <div className="hidden md:block border border-stone-200 rounded-2xl overflow-hidden shadow-xs bg-white">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-left text-xs text-stone-600 font-black uppercase tracking-wider">
                    <th className="px-4 py-3.5 w-14">Photo</th>
                    <th className="px-4 py-3.5">Dish Details</th>
                    <th className="px-4 py-3.5 w-24">Price</th>
                    <th className="px-4 py-3.5 w-32">Category</th>
                    <th className="px-4 py-3.5 w-[160px]">Stock Level (Modify Instant)</th>
                    <th className="px-4 py-3.5 text-right w-28">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-150 text-xs text-stone-700">
                  {items.map((it) => {
                    const isOutOfStock = it.stock === 0;
                    const isLowStock = it.stock > 0 && it.stock < 10;
                    
                    // Simple category coloring helper
                    const getCatBadgeClass = (category: string) => {
                      const c = category?.toLowerCase() || '';
                      if (c.includes('breakfast')) return 'bg-amber-100 text-amber-955 border-amber-300';
                      if (c.includes('lunch') || c.includes('meal')) return 'bg-orange-100 text-orange-955 border-orange-300';
                      if (c.includes('snack') || c.includes('starter')) return 'bg-rose-100 text-rose-955 border-rose-300';
                      if (c.includes('drink') || c.includes('beverage') || c.includes('juice')) return 'bg-sky-100 text-sky-955 border-sky-300';
                      if (c.includes('dinner')) return 'bg-indigo-100 text-indigo-955 border-indigo-300';
                      return 'bg-emerald-100 text-emerald-955 border-emerald-300';
                    };

                    return (
                      <tr key={it.id} className="hover:bg-amber-50/25 transition-all">
                        <td className="px-4 py-2.5">
                          <img 
                            src={it.photoUrl} 
                            alt={it.name} 
                            className="w-12 h-12 object-cover rounded-xl border border-stone-200 shadow-xs"
                            onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&auto=format&fit=crop'; }}
                          />
                        </td>
                        <td className="px-4 py-2.5">
                          <p className="font-extrabold text-stone-900 text-sm">{it.name}</p>
                          <p className="text-[11px] text-stone-400 mt-0.5 line-clamp-1 max-w-xs">{it.description || 'No description added yet'}</p>
                        </td>
                        <td className="px-4 py-2.5">
                          <QuickPriceInput item={it} onUpdate={handleQuickPriceUpdate} />
                        </td>
                        <td className="px-4 py-2.5">
                          <span className={`px-2.5 py-1 border rounded-lg font-black text-[10px] uppercase tracking-wider ${getCatBadgeClass(it.category)}`}>
                            {it.category}
                          </span>
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="flex flex-col gap-1.5">
                            {/* Fast increment decrement input */}
                            <QuickStockInput item={it} onUpdate={handleQuickStockUpdate} />

                            {/* Status label under stock */}
                            {isOutOfStock ? (
                              <span className="text-[9px] font-black uppercase text-red-600 bg-red-50 px-1.5 py-0.5 rounded inline-block w-fit tracking-wider border border-red-200">Out of Stock!</span>
                            ) : isLowStock ? (
                              <span className="text-[9px] font-black uppercase text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded inline-block w-fit tracking-wider border border-amber-200">Low Stock ({it.stock})</span>
                            ) : (
                              <span className="text-[9px] font-bold uppercase text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded inline-block w-fit tracking-wider border border-emerald-200">Stock OK</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-right space-x-1 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => startEditItem(it)}
                            className="p-1 px-2.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-black rounded-lg transition-all cursor-pointer inline-flex items-center gap-1 shadow-sm hover:shadow hover:scale-102"
                          >
                            <Edit className="w-3 h-3 text-stone-900" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteFoodItem(it.id, it.name)}
                            className="p-2 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-all cursor-pointer inline-flex items-center"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile List View: Compressed list for incredible mobile stock handling */}
            <div className="block md:hidden space-y-2">
              {items.map((it) => {
                const isOutOfStock = it.stock === 0;
                const isLowStock = it.stock > 0 && it.stock < 10;

                const getCatBadgeClass = (category: string) => {
                  const c = category?.toLowerCase() || '';
                  if (c.includes('breakfast')) return 'bg-amber-100 text-amber-955 border-amber-250';
                  if (c.includes('lunch') || c.includes('meal')) return 'bg-orange-100 text-orange-955 border-orange-250';
                  if (c.includes('snack') || c.includes('starter')) return 'bg-rose-100 text-rose-955 border-rose-250';
                  if (c.includes('drink') || c.includes('beverage') || c.includes('juice')) return 'bg-sky-100 text-sky-955 border-sky-250';
                  if (c.includes('dinner')) return 'bg-indigo-100 text-indigo-955 border-indigo-250';
                  return 'bg-emerald-100 text-emerald-955 border-emerald-250';
                };

                return (
                  <div key={it.id} className="bg-white border border-stone-200 rounded-xl p-3.5 shadow-xs space-y-3">
                    <div className="flex items-start gap-2.5">
                      <img 
                        src={it.photoUrl} 
                        alt={it.name} 
                        className="w-12 h-12 object-cover rounded-lg border border-stone-150 shrink-0 shadow-2xs"
                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&auto=format&fit=crop'; }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1 label-container">
                          <p className="font-extrabold text-stone-900 text-xs sm:text-sm truncate">{it.name}</p>
                          <span className="shrink-0 font-display font-black text-xs text-amber-950 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded-lg">
                            ₹{it.price}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                          <span className={`px-1.5 py-0.5 border rounded text-[8px] font-extrabold uppercase tracking-widest ${getCatBadgeClass(it.category)}`}>
                            {it.category}
                          </span>
                          {isOutOfStock ? (
                            <span className="text-[8px] font-black uppercase text-red-600 bg-red-50 border border-red-100 px-1 py-0.5 rounded">Out of Stock!</span>
                          ) : isLowStock ? (
                            <span className="text-[8px] font-black uppercase text-amber-600 bg-amber-50 border border-amber-10 border-amber-150 px-1 py-0.5 rounded">Low Stock ({it.stock})</span>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    {/* Price quick action strip */}
                    <div className="flex items-center justify-between gap-2 bg-stone-50 border border-stone-200/50 p-2 rounded-lg">
                      <span className="text-[10px] font-black text-stone-500 uppercase tracking-wider">Quick Price:</span>
                      <QuickPriceInput item={it} onUpdate={handleQuickPriceUpdate} />
                    </div>

                    {/* Stock quick action strip & settings */}
                    <div className="flex items-center justify-between gap-2 bg-stone-50 border border-stone-200/50 p-2 rounded-lg">
                      <span className="text-[10px] font-black text-stone-500 uppercase tracking-wider">Quick Stock:</span>
                      
                      <QuickStockInput item={it} onUpdate={handleQuickStockUpdate} slimLayout={true} />
                    </div>

                    {/* Meta actions */}
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => startEditItem(it)}
                        className="px-3.5 py-1.5 bg-amber-500 text-stone-950 font-black rounded-lg text-[10px] uppercase tracking-wider flex items-center gap-1 active:scale-95 shadow-2xs"
                      >
                        <Edit className="w-3 h-3" />
                        <span>Edit Details</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteFoodItem(it.id, it.name)}
                        className="p-1.5 text-red-650 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* -------------------- TAB: CATEGORIES -------------------- */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div className="border-b border-stone-100 pb-3">
              <h2 className="font-bold text-lg font-display text-stone-800">Dynamic Menu Categories</h2>
              <p className="text-xs text-stone-500">Insert custom food sections (e.g. "Tea & Brews", "Bengali Sweets")</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Insert Category Box */}
              <div className="md:col-span-5 bg-stone-50 p-5 rounded-2xl border border-stone-200 space-y-4">
                <h3 className="text-xs uppercase font-extrabold text-stone-400 tracking-wider">Add New Category</h3>
                
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-stone-500 uppercase">Category Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Desserts"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="w-full bg-white px-3 py-2.5 border border-stone-200 rounded-xl text-xs"
                  />
                </div>

                <button
                  onClick={addCategory}
                  className="w-full py-2.5 bg-amber-970 hover:bg-amber-900 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Insert Category</span>
                </button>
              </div>

              {/* Listing Box */}
              <div className="md:col-span-7 space-y-3">
                <h3 className="text-xs uppercase font-extrabold text-stone-450 tracking-wider">Configured Categories</h3>
                <div className="border border-stone-200 rounded-2xl overflow-hidden divide-y divide-stone-150 shadow-xs bg-white">
                  {categories.map((cat, idx) => (
                    <div key={idx} className="p-3 px-4 flex items-center justify-between text-xs hover:bg-stone-50/50">
                      <div>
                        <p className="font-extrabold text-stone-800 text-sm mb-0.5">{cat.name}</p>
                        <p className="text-[10px] text-stone-450 font-mono">Reference Code: {cat.id}</p>
                      </div>
                      
                      <button 
                        onClick={() => deleteCategory(cat.id)}
                        className="p-1 px-2 border border-red-150 hover:bg-red-50 text-red-650 rounded-lg font-bold transition-all cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* -------------------- TAB: BUSINESS SETTINGS -------------------- */}
        {activeTab === 'business' && (
          <div className="space-y-6">
            <div className="border-b border-stone-100 pb-3">
              <h2 className="font-bold text-lg font-display text-stone-800">Shop Layout & Business Configuration</h2>
              <p className="text-xs text-stone-500">Edit GMB details, logo URL, addresses, location embed iframe, or bio description</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 bg-stone-50 p-5 border rounded-2xl">
              
              {/* Logo Storage Upload Section */}
              <div className="md:col-span-12 border-b border-stone-200 pb-4 flex flex-col sm:flex-row items-center gap-4">
                <img 
                  src={bizForm.logoUrl} 
                  alt="Business Logo" 
                  className="w-16 h-16 object-cover rounded-2xl border-2 border-white shadow shadow-stone-300"
                />
                <div className="space-y-1 text-center sm:text-left flex-1">
                  <h4 className="font-bold text-stone-800 text-sm">Upload Business Header Logo</h4>
                  <p className="text-xs text-stone-400">Save restaurant logo natively into local container disk storage.</p>
                  <label className="px-3 py-1.5 bg-stone-200 hover:bg-stone-300 rounded-lg cursor-pointer text-xs font-semibold inline-flex items-center gap-1 mt-1 transition-all">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Logo Image</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => handleFileUpload(e, 'logo')}
                      className="hidden" 
                    />
                  </label>
                </div>
                <div className="w-full sm:w-1/2">
                  <label className="text-[10px] font-bold text-stone-400 uppercase">Logo Url Direct</label>
                  <input
                    type="text"
                    value={bizForm.logoUrl}
                    onChange={(e) => setBizForm(prev => ({ ...prev, logoUrl: e.target.value }))}
                    className="w-full bg-white px-3 py-1.5 border border-stone-200 rounded-xl text-xs mt-1"
                  />
                </div>
              </div>

              {/* Text Fields */}
              <div className="md:col-span-6 space-y-1">
                <label className="text-[11px] font-bold text-stone-500 uppercase">Shop Name (Stylish Fitting)</label>
                <input
                  type="text"
                  required
                  value={bizForm.name}
                  onChange={(e) => setBizForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-white px-3 py-2 border border-stone-200 rounded-xl text-xs font-bold text-stone-800"
                />
              </div>

              <div className="md:col-span-6 space-y-1">
                <label className="text-[11px] font-bold text-stone-500 uppercase">GMB Location Pointer Address</label>
                <input
                  type="text"
                  required
                  value={bizForm.address}
                  onChange={(e) => setBizForm(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full bg-white px-3 py-2 border border-stone-200 rounded-xl text-xs"
                />
              </div>

              <div className="md:col-span-6 space-y-1">
                <label className="text-[11px] font-bold text-stone-500 uppercase">Interactive Map Embed URL (Iframe Src)</label>
                <input
                  type="text"
                  value={bizForm.mapIframeUrl}
                  onChange={(e) => setBizForm(prev => ({ ...prev, mapIframeUrl: e.target.value }))}
                  className="w-full bg-white px-3 py-2 border border-stone-200 rounded-xl text-xs"
                />
              </div>

              <div className="md:col-span-6 space-y-1">
                <label className="text-[11px] font-bold text-stone-500 uppercase">Contact Phone Numbers (Comma separated)</label>
                <input
                  type="text"
                  value={bizForm.contactPhones.join(', ')}
                  onChange={(e) => setBizForm(prev => ({ ...prev, contactPhones: e.target.value.split(',').map(s => s.trim()) }))}
                  className="w-full bg-white px-3 py-2 border border-stone-200 rounded-xl text-xs"
                />
              </div>

              <div className="md:col-span-12 space-y-1">
                <label className="text-[11px] font-bold text-stone-500 uppercase">About Us Bio / Description text</label>
                <textarea
                  rows={4}
                  value={bizForm.aboutUsText}
                  onChange={(e) => setBizForm(prev => ({ ...prev, aboutUsText: e.target.value }))}
                  className="w-full bg-white p-3 border border-stone-200 rounded-xl text-xs"
                />
              </div>

              <div className="md:col-span-12 text-right pt-4 border-t border-stone-100 mt-2">
                <button
                  type="button"
                  onClick={saveBusinessConfig}
                  className="w-full sm:w-auto px-7 py-3 bg-gradient-to-r from-amber-500 via-orange-500 to-red-650 hover:from-amber-600 hover:via-orange-600 hover:to-red-700 active:scale-[0.98] text-white font-black rounded-xl text-xs uppercase tracking-widest transition-all shadow-md hover:shadow-lg hover:shadow-orange-500/20 inline-flex items-center justify-center gap-2 cursor-pointer select-none"
                >
                  <Save className="w-4 h-4 text-orange-100 animate-pulse" />
                  <span>Update Business Settings</span>
                </button>
              </div>

            </div>
          </div>
        )}

        {/* -------------------- TAB: HERO SLIDER -------------------- */}
        {activeTab === 'hero' && (
          <div className="space-y-6">
            <div className="border-b border-stone-100 pb-3">
              <h2 className="font-bold text-lg font-display text-stone-800">Landing Hero Slideshow Image Editor</h2>
              <p className="text-xs text-stone-500">Edit sliding banners displayed right under top bar including upload-to-storage</p>
            </div>

            {/* Slider Adder Box */}
            <div className="bg-stone-50 p-5 rounded-2xl border space-y-4">
              <h3 className="text-xs uppercase font-extrabold text-stone-400 tracking-wider">Add Hero Slide Banner</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                <div className="md:col-span-4 space-y-1">
                  <label className="text-[11px] font-bold text-stone-500 uppercase">Slide Caption/Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Traditional clay oven recipes..."
                    value={newHeroTitle}
                    onChange={(e) => setNewHeroTitle(e.target.value)}
                    className="w-full bg-white px-3 py-2 border border-stone-200 rounded-xl text-xs"
                  />
                </div>

                <div className="md:col-span-6 space-y-1">
                  <label className="text-[11px] font-bold text-stone-500 uppercase block">Banner Image Storage</label>
                  <div className="flex items-center gap-2">
                    <label className="px-3 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl cursor-pointer text-xs font-semibold flex items-center gap-1">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Banner</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => handleFileUpload(e, 'hero')}
                        className="hidden" 
                      />
                    </label>
                    <input
                      type="text"
                      placeholder="Or enter direct URL link"
                      value={newHeroUrl}
                      onChange={(e) => setNewHeroUrl(e.target.value)}
                      className="flex-1 bg-white px-3 py-2 border border-stone-200 rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <button
                    onClick={addHeroBanner}
                    className="w-full py-2 bg-amber-970 hover:bg-amber-900 text-white font-bold rounded-xl text-xs hover:shadow transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Insert Slide</span>
                  </button>
                </div>
              </div>

              {newHeroUrl && (
                <div className="h-28 w-full border rounded-xl overflow-hidden shadow-inner relative max-w-sm">
                  <img src={newHeroUrl} alt="Preview" className="w-full h-full object-cover" />
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/70 text-white text-[9px] rounded font-bold">{newHeroTitle || 'No Title'}</span>
                </div>
              )}
            </div>

            {/* List Box of active slides */}
            <div className="space-y-3">
              <h3 className="text-xs uppercase font-extrabold text-stone-450 tracking-wider">Configured Hero Slides ({heroBanners.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {heroBanners.map((slide) => (
                  <div key={slide.id} className="border border-stone-200 rounded-2xl overflow-hidden bg-stone-50 flex flex-col justify-between shadow-xs">
                    <div className="h-32 w-full relative">
                      <img src={slide.imageUrl} alt={slide.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent p-3 flex items-end">
                        <p className="text-white text-xs font-bold leading-tight line-clamp-2">{slide.title}</p>
                      </div>
                    </div>
                    <div className="p-3 bg-white flex justify-between items-center text-xs">
                      <span className="text-[10px] text-stone-400 truncate max-w-[170px]">{slide.imageUrl}</span>
                      <button
                        onClick={() => removeHeroBanner(slide.id)}
                        className="px-2 py-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer text-xs font-semibold"
                      >
                        Remove Slide
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* -------------------- TAB: PRINTER SETTINGS -------------------- */}
        {activeTab === 'printer' && (
          <div className="space-y-6">
            <div className="border-b border-stone-100 pb-3">
              <h2 className="font-bold text-lg font-display text-stone-800">Bluetooth Printer Configuration</h2>
              <p className="text-xs text-stone-500">Pair your standard Bluetooth thermal receiver (e.g., 58mm / 80mm ESC-POS printer)</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* Main Pairing Card */}
              <div className="bg-stone-50 border border-stone-200 rounded-3xl p-5 text-center space-y-4 shadow-xs">
                <Printer className="w-12 h-12 text-amber-900 mx-auto animate-pulse" />
                <div>
                  <h3 className="font-extrabold font-display text-stone-800 text-sm">Bluetooth Pairing Center</h3>
                  <p className="text-[11px] text-stone-500 leading-relaxed mt-1">
                    Pair real web-bluetooth certified thermal printers, or configure customizable simulators for offline bill previewing.
                  </p>
                </div>

                <div className="bg-white p-4 border border-stone-150 rounded-2xl flex flex-col justify-center items-center text-sm">
                  {bluetoothDevice ? (
                    <div className="space-y-3 w-full">
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-150 rounded-full text-xs font-bold mb-1">
                        <Check className="w-3.5 h-3.5 text-emerald-500" /> Active Connection
                      </span>
                      <p className="text-stone-800 font-extrabold text-xs">Device: {bluetoothDevice}</p>
                      <p className="text-[10px] text-stone-400">Driver: ESC/POS Generic (80mm width standard)</p>
                      
                      <button
                        type="button"
                        onClick={removeBluetoothPrinter}
                        className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-150 rounded-xl text-xs font-bold transition-colors cursor-pointer select-none"
                      >
                        Disconnect Printer
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3 w-full">
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-stone-100 text-stone-500 rounded-full text-xs font-bold mb-1">
                        No paired device
                      </span>
                      <p className="text-stone-450 text-[11px] leading-snug">
                        Ready to scan or manually bind your wireless thermal receiver below.
                      </p>
                      
                      <button
                        type="button"
                        onClick={connectBluetoothController}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer select-none"
                      >
                        <PlusCircle className="w-4 h-4" />
                        Pair Bluetooth Printer
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Direct Bypass Connection Panels */}
              <div className="space-y-4">
                <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm space-y-3">
                  <h4 className="font-extrabold text-stone-800 text-xs uppercase tracking-wide">Manual / Direct Connection</h4>
                  <p className="text-[11px] text-stone-500">
                    If web-bluetooth is blocked in your browser or sandbox environment, simply enter your Bluetooth / Wifi thermal printer name below to force bind it.
                  </p>
                  
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customPrinterName}
                      onChange={(e) => setCustomPrinterName(e.target.value)}
                      placeholder="e.g. XP-80C Thermal Printer"
                      className="flex-grow p-2 text-xs border border-stone-250 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-900 bg-stone-50"
                    />
                    <button
                      type="button"
                      onClick={() => connectManualPrinterName(customPrinterName)}
                      className="px-3 py-2 bg-stone-800 hover:bg-stone-900 text-white font-bold text-xs rounded-lg transition-all cursor-pointer select-none whitespace-nowrap"
                    >
                      Connect
                    </button>
                  </div>
                </div>

                <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm space-y-3">
                  <h4 className="font-extrabold text-stone-800 text-xs uppercase tracking-wide">Select Simulator Printer Models</h4>
                  <p className="text-[11px] text-stone-500">
                    Quickly select a pre-verified thermal receipt model to play with instant printing:
                  </p>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      "BKK-80mm Thermal (BLE-2309)",
                      "RPP02N Mini Printer",
                      "XP-80C Thermal Bill Printer",
                      "Bixolon SRP-350 Plus"
                    ].map((model) => (
                      <button
                        key={model}
                        type="button"
                        onClick={() => connectManualPrinterName(model)}
                        className="p-2 border border-stone-200 hover:border-amber-900/35 hover:bg-amber-50 rounded-lg text-left text-[11px] text-stone-700 transition-all font-medium text-ellipsis overflow-hidden whitespace-nowrap cursor-pointer select-none"
                        title={model}
                      >
                        {model}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
