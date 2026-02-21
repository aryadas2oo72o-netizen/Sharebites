import React, { useState, useEffect } from "react";
import { 
  PlusCircle, 
  MapPin, 
  Clock, 
  Phone, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft,
  UtensilsCrossed,
  Users,
  ChevronRight,
  Package
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Food {
  id: string;
  name: string;
  description: string;
  quantity: number;
  expiryDate: string;
  location: string;
  communityCode: string;
  contactNumber: string;
  status: "Available" | "Completed" | "Expired";
  createdAt: number;
}

export default function App() {
  const [communityCode, setCommunityCode] = useState<string>("");
  const [isEntered, setIsEntered] = useState(false);
  const [view, setView] = useState<"list" | "post">("list");
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    quantity: 1,
    expiryDate: "",
    location: "",
    contactNumber: "",
  });

  const fetchFoods = async () => {
    if (!communityCode) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/foods/community/${communityCode}`);
      const data = await res.json();
      setFoods(data);
    } catch (err) {
      console.error("Error fetching foods:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isEntered) {
      fetchFoods();
      const interval = setInterval(fetchFoods, 30000); // Refresh every 30s
      return () => clearInterval(interval);
    }
  }, [isEntered, communityCode]);

  const handleEnterCommunity = (e: React.FormEvent) => {
    e.preventDefault();
    if (communityCode.trim()) {
      setIsEntered(true);
    }
  };

  const handlePostFood = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    console.log("Submitting food donation...", { ...formData, communityCode });

    try {
      const res = await fetch("/api/foods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, communityCode }),
      });
      
      if (res.ok) {
        console.log("Food donation posted successfully");
        setFormData({
          name: "",
          description: "",
          quantity: 1,
          expiryDate: "",
          location: "",
          contactNumber: "",
        });
        setView("list");
        fetchFoods();
      } else {
        console.error("Failed to post food:", res.statusText);
        alert("Failed to post donation. Please try again.");
      }
    } catch (err) {
      console.error("Error posting food:", err);
      alert("An error occurred. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const markAsCompleted = async (id: string) => {
    try {
      const res = await fetch(`/api/foods/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Completed", quantity: 0 }),
      });
      if (res.ok) {
        fetchFoods();
      }
    } catch (err) {
      console.error("Error updating food:", err);
    }
  };

  const isExpired = (dateStr: string) => {
    return new Date(dateStr).getTime() < Date.now();
  };

  if (!isEntered) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-6 font-sans">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-stone-100"
        >
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mb-4">
              <UtensilsCrossed className="text-emerald-600 w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold text-stone-900 tracking-tight">ShareBites</h1>
            <p className="text-stone-500 text-center mt-2">Connecting communities through food sharing.</p>
          </div>

          <form onSubmit={handleEnterCommunity} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2 uppercase tracking-wider">
                Community Code
              </label>
              <input
                type="text"
                required
                placeholder="e.g. GREEN-VALLEY-12"
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-lg font-mono"
                value={communityCode}
                onChange={(e) => setCommunityCode(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2 group"
            >
              Enter Community
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-stone-100 flex items-center gap-4 text-stone-400 text-sm">
            <Users className="w-4 h-4" />
            <span>Join your local community to start sharing.</span>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 font-sans pb-20">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsEntered(false)}
              className="p-2 hover:bg-stone-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-stone-600" />
            </button>
            <div>
              <h2 className="font-bold text-stone-900">ShareBites</h2>
              <p className="text-xs text-stone-500 font-mono uppercase">{communityCode}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setView("list")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                view === "list" 
                  ? "bg-emerald-100 text-emerald-700" 
                  : "text-stone-600 hover:bg-stone-100"
              }`}
            >
              Feed
            </button>
            <button
              onClick={() => setView("post")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                view === "post" 
                  ? "bg-emerald-100 text-emerald-700" 
                  : "text-stone-600 hover:bg-stone-100"
              }`}
            >
              Donate
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {view === "list" ? (
            <motion.div
              key="list"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-stone-800">Available Food</h3>
                <button 
                  onClick={fetchFoods}
                  className="text-emerald-600 text-sm font-medium hover:underline"
                >
                  Refresh
                </button>
              </div>

              {loading ? (
                <div className="flex justify-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                </div>
              ) : foods.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-stone-300">
                  <Package className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                  <p className="text-stone-500">No food items available in this community yet.</p>
                  <button 
                    onClick={() => setView("post")}
                    className="mt-4 text-emerald-600 font-bold"
                  >
                    Be the first to donate!
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {foods.map((food) => (
                    <FoodCard 
                      key={food.id} 
                      food={food} 
                      onComplete={() => markAsCompleted(food.id)} 
                    />
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="post"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-xl mx-auto"
            >
              <div className="bg-white rounded-3xl shadow-sm border border-stone-200 p-8">
                <h3 className="text-2xl font-bold text-stone-900 mb-6">Post Food Donation</h3>
                <form onSubmit={handlePostFood} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-1">Food Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Fresh Homemade Pasta"
                      className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-1">Description</label>
                    <textarea
                      required
                      placeholder="Tell us more about the food..."
                      className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none min-h-[100px]"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-stone-700 mb-1">Quantity (Plates/Items)</label>
                      <input
                        type="number"
                        required
                        min="1"
                        className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-stone-700 mb-1">Expiry Date & Time</label>
                      <input
                        type="datetime-local"
                        required
                        className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                        value={formData.expiryDate}
                        onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-1">Pickup Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-2.5 w-5 h-5 text-stone-400" />
                      <input
                        type="text"
                        required
                        placeholder="Street address or landmark"
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-1">Contact Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 w-5 h-5 text-stone-400" />
                      <input
                        type="tel"
                        required
                        placeholder="Your phone number"
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                        value={formData.contactNumber}
                        onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-100 transition-all mt-4 ${
                      isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                  >
                    {isSubmitting ? "Posting..." : "Post Donation"}
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Action Button for Mobile */}
      {view === "list" && (
        <button
          onClick={() => setView("post")}
          className="fixed bottom-8 right-8 w-14 h-14 bg-emerald-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform md:hidden"
        >
          <PlusCircle className="w-8 h-8" />
        </button>
      )}
    </div>
  );
}

function FoodCard({ food, onComplete }: { food: Food; onComplete: () => void | Promise<void>; key?: string }) {
  const isExpired = new Date(food.expiryDate).getTime() < Date.now();
  const status = food.status === "Completed" ? "Completed" : isExpired ? "Expired" : "Available";

  const getStatusStyles = () => {
    switch (status) {
      case "Available": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "Expired": return "bg-red-100 text-red-700 border-red-200";
      case "Completed": return "bg-stone-100 text-stone-500 border-stone-200";
    }
  };

  return (
    <motion.div 
      layout
      className={`bg-white rounded-2xl border p-5 shadow-sm transition-all ${
        status === "Completed" ? "opacity-60 grayscale-[0.5]" : "hover:shadow-md"
      } ${status === "Expired" ? "border-red-100" : "border-stone-100"}`}
    >
      <div className="flex justify-between items-start mb-3">
        <h4 className="text-lg font-bold text-stone-900">{food.name}</h4>
        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full border ${getStatusStyles()}`}>
          {status}
        </span>
      </div>
      
      <p className="text-stone-600 text-sm mb-4 line-clamp-2">{food.description}</p>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-xs text-stone-500">
          <Package className="w-4 h-4" />
          <span>{food.quantity} plates/items available</span>
        </div>
        <div className={`flex items-center gap-2 text-xs ${isExpired ? "text-red-600 font-medium" : "text-stone-500"}`}>
          <Clock className="w-4 h-4" />
          <span>Expires: {new Date(food.expiryDate).toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-stone-500">
          <MapPin className="w-4 h-4" />
          <span>{food.location}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-stone-500">
          <Phone className="w-4 h-4" />
          <span>{food.contactNumber}</span>
        </div>
      </div>

      {status === "Available" && (
        <button
          onClick={onComplete}
          className="w-full mt-2 py-2.5 bg-stone-900 hover:bg-black text-white text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          Mark as Completed
        </button>
      )}
      
      {status === "Expired" && (
        <div className="flex items-center gap-2 text-red-600 text-xs font-medium mt-2 p-2 bg-red-50 rounded-lg">
          <AlertCircle className="w-4 h-4" />
          This item has expired and is no longer safe to share.
        </div>
      )}
    </motion.div>
  );
}
