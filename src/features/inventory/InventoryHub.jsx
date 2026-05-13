import { Download, Plus, ClipboardList, ArrowUpRight, Wrench, QrCode, Camera, AlertTriangle, Filter, MoreVertical, Search, ArrowRight } from "lucide-react";

const mockEquipment = [
  {
    id: "#ADNU-VB-042",
    name: "Mikasa V200W Pro",
    category: "Volleyball",
    status: "Available",
    condition: "Excellent",
    image: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=100&h=100&fit=crop&q=80"
  },
  {
    id: "#ADNU-TM-011",
    name: "Commercial Treadmill X8",
    category: "Cardio",
    status: "In Use",
    condition: "Good",
    image: "https://images.unsplash.com/photo-1576678927484-cc907957088c?w=100&h=100&fit=crop&q=80"
  },
  {
    id: "#ADNU-BB-098",
    name: "Wilson Evolution Basketball",
    category: "Basketball",
    status: "Maintenance",
    condition: "Requires Repair",
    image: "https://images.unsplash.com/photo-1519861531473-9200262188bf?w=100&h=100&fit=crop&q=80"
  },
  {
    id: "#ADNU-SC-212",
    name: "Adidas FIFA Pro Match Ball",
    category: "Soccer",
    status: "Available",
    condition: "Excellent",
    image: "https://images.unsplash.com/photo-1614632537423-1e6c2e7e0aab?w=100&h=100&fit=crop&q=80"
  }
];

export function InventoryHub() {
  return (
    <div className="space-y-6 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Asset Inventory Hub</h1>
          <p className="text-[13px] text-slate-500 mt-1">Manage, track, and maintain the varsity athletic equipment ecosystem.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-surface-card border border-border-subtle/50 text-slate-600 px-4 py-2.5 rounded-full font-medium hover:bg-slate-50 transition-colors shadow-soft text-[12px] tracking-wide">
            <Download className="w-3.5 h-3.5 text-slate-400" />
            Export Report
          </button>
          <button className="flex items-center gap-2 bg-brand-blue text-white px-4 py-2.5 rounded-full font-medium hover:bg-brand-blue-hover transition-colors shadow-soft text-[12px] tracking-wide">
            <Plus className="w-3.5 h-3.5" />
            Add New Asset
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Assets */}
        <div className="bg-surface-card p-7 rounded-[24px] border border-border-subtle/40 shadow-soft flex flex-col justify-between hover:shadow-float transition-shadow duration-300">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div className="w-9 h-9 rounded-full bg-brand-blue-light text-brand-blue flex items-center justify-center">
                <ClipboardList className="w-4 h-4" />
              </div>
              <p className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">Total Assets</p>
            </div>
            <div className="flex items-end justify-between mt-6">
              <h3 className="text-4xl font-extrabold text-slate-900 tracking-tighter">2,481</h3>
              <span className="text-[12px] font-semibold text-brand-blue mb-1">+12 this month</span>
            </div>
          </div>
        </div>

        {/* Active Loans */}
        <div className="bg-surface-card p-7 rounded-[24px] border border-border-subtle/40 shadow-soft flex flex-col justify-between hover:shadow-float transition-shadow duration-300">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div className="w-9 h-9 rounded-full bg-brand-gold-light text-brand-gold-hover flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4" />
              </div>
              <p className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">Active Loans</p>
            </div>
            <div className="flex items-end justify-between mt-6">
              <h3 className="text-4xl font-extrabold text-slate-900 tracking-tighter">142</h3>
              <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden mb-2">
                <div className="w-3/4 h-full bg-brand-gold-hover rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Maintenance */}
        <div className="bg-surface-card p-7 rounded-[24px] border border-border-subtle/40 shadow-soft flex flex-col justify-between hover:shadow-float transition-shadow duration-300">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div className="w-9 h-9 rounded-full bg-brand-blue-light/50 text-slate-500 flex items-center justify-center">
                <Wrench className="w-4 h-4" />
              </div>
              <p className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">Maintenance</p>
            </div>
            <div className="flex items-end justify-between mt-6">
              <h3 className="text-4xl font-extrabold text-slate-900 tracking-tighter">18</h3>
              <span className="text-[12px] font-semibold text-red-600 mb-1 uppercase tracking-wide">3 Critical</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Equipment Directory */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface-card rounded-[24px] border border-border-subtle/40 shadow-soft overflow-hidden flex flex-col h-full">
            <div className="p-7 border-b border-border-subtle/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-[16px] font-bold text-slate-900">Equipment Directory</h2>
              <div className="flex items-center gap-3">
                <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-500 transition-colors">
                  <Filter className="w-4 h-4" />
                </button>
                <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-500 transition-colors">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 text-[10px] tracking-widest font-bold text-slate-400 uppercase">
                    <th className="p-5 pl-7 font-semibold">QR ID</th>
                    <th className="p-5 font-semibold">Item Name</th>
                    <th className="p-5 font-semibold">Category</th>
                    <th className="p-5 font-semibold">Status</th>
                    <th className="p-5 pr-7 font-semibold">Condition</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle/50 text-[13px]">
                  {mockEquipment.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors cursor-pointer group">
                      <td className="p-5 pl-7 font-bold text-brand-blue">{item.id}</td>
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          <img src={item.image} alt={item.name} className="w-8 h-8 rounded-lg object-cover border border-border-subtle" />
                          <span className="font-semibold text-slate-900 max-w-[140px] truncate block">{item.name}</span>
                        </div>
                      </td>
                      <td className="p-5">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold bg-brand-blue/5 text-brand-blue/80 tracking-wide">
                          {item.category}
                        </span>
                      </td>
                      <td className="p-5">
                        <div className="flex items-center gap-2 font-semibold">
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            item.status === 'Available' ? 'bg-green-500' :
                            item.status === 'In Use' ? 'bg-brand-gold-hover' : 'bg-red-500'
                          }`}></span>
                          <span className={
                            item.status === 'Available' ? 'text-green-600' :
                            item.status === 'In Use' ? 'text-brand-gold-hover' : 'text-red-600'
                          }>{item.status}</span>
                        </div>
                      </td>
                      <td className="p-5 pr-7 text-slate-600 font-medium">
                        {item.condition}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-5 px-7 border-t border-border-subtle/50 flex items-center justify-between text-[12px]">
              <span className="text-slate-500 font-medium">Showing 4 of 2,481 entries</span>
              <div className="flex items-center gap-1.5">
                <button className="px-3 py-1.5 rounded-lg border border-border-subtle hover:bg-slate-50 font-semibold text-slate-600 transition-colors">Previous</button>
                <button className="w-8 h-8 rounded-lg bg-brand-blue text-white font-bold flex items-center justify-center shadow-soft">1</button>
                <button className="w-8 h-8 rounded-lg hover:bg-slate-50 text-slate-600 font-semibold flex items-center justify-center transition-colors">2</button>
                <button className="px-3 py-1.5 rounded-lg border border-border-subtle hover:bg-slate-50 font-semibold text-slate-600 transition-colors">Next</button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Scan Card */}
          <div className="bg-brand-blue rounded-[24px] shadow-float p-7 relative overflow-hidden text-white">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
            <div className="relative z-10">
              <QrCode className="w-8 h-8 mb-5 opacity-90" />
              <h2 className="text-[18px] font-bold mb-2">Scan for Asset Check-in</h2>
              <p className="text-[13px] text-white/70 leading-relaxed mb-6">
                Quickly loan equipment or update status by scanning the asset's QR code.
              </p>
              <button className="w-full flex items-center justify-center gap-2 bg-white text-brand-blue px-4 py-3 rounded-xl font-bold hover:bg-white/90 transition-colors shadow-soft text-[13px]">
                <Camera className="w-4 h-4" />
                Launch Scanner
              </button>
            </div>
          </div>

          {/* Live Transactions */}
          <div className="bg-surface-card rounded-[24px] border border-border-subtle/40 shadow-soft overflow-hidden">
            <div className="p-6 border-b border-border-subtle/50 flex items-center justify-between">
              <h2 className="text-[15px] font-bold text-slate-900">Live Transactions</h2>
              <span className="px-2 py-0.5 bg-brand-gold-hover text-white text-[9px] font-bold rounded-md tracking-widest uppercase shadow-sm">Live</span>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex gap-4 relative">
                <div className="absolute left-[3px] top-7 bottom-[-24px] w-px bg-border-subtle/50"></div>
                <div className="w-1.5 h-10 rounded-full bg-brand-blue shrink-0 z-10"></div>
                <div>
                  <p className="text-[13px] font-bold text-slate-900">Coach Arnaiz checked out 12 Volleyballs</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">2 mins ago • Facility A</p>
                </div>
              </div>
              <div className="flex gap-4 relative">
                <div className="absolute left-[3px] top-7 bottom-[-24px] w-px bg-border-subtle/50"></div>
                <div className="w-1.5 h-10 rounded-full bg-brand-gold-hover shrink-0 z-10"></div>
                <div>
                  <p className="text-[13px] font-bold text-slate-900">Team Alpha returned 5 Soccer Med-kits</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">15 mins ago • Training Ground 1</p>
                </div>
              </div>
              <div className="flex gap-4 relative">
                <div className="absolute left-[3px] top-7 bottom-[-24px] w-px bg-border-subtle/50"></div>
                <div className="w-1.5 h-10 rounded-full bg-red-500 shrink-0 z-10"></div>
                <div>
                  <p className="text-[13px] font-bold text-slate-900">System Alert: Treadmill #011 maintenance overdue</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">1 hour ago • Cardio Center</p>
                </div>
              </div>
              <div className="flex gap-4 relative">
                <div className="w-1.5 h-10 rounded-full bg-slate-300 shrink-0 z-10"></div>
                <div>
                  <p className="text-[13px] font-bold text-slate-900 text-slate-600">Maintenance Log: Pool pump filter replaced</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">4 hours ago • Aquatic Hub</p>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-border-subtle/50">
              <button className="w-full text-center text-[13px] font-bold text-brand-blue hover:text-brand-blue-hover transition-colors py-2">
                View All Activity
              </button>
            </div>
          </div>

          {/* Report Damaged Asset */}
          <div className="bg-surface-card p-6 rounded-[24px] border border-dashed border-border-subtle shadow-sm hover:shadow-soft transition-shadow group cursor-pointer">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-50 text-slate-600 flex items-center justify-center shrink-0 group-hover:bg-slate-100 transition-colors">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-[14px] font-bold text-slate-900">Report Damaged Asset</h3>
                <p className="text-[12px] text-slate-500 mt-1 leading-relaxed">Broken equipment? File a rapid report for the maintenance team.</p>
                <div className="flex items-center gap-1.5 text-[12px] font-bold text-brand-blue mt-3 group-hover:gap-2 transition-all">
                  Start Report <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
