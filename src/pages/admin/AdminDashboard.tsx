import React, { useEffect, useState, useMemo } from 'react';
import {
  Layers,
  CheckCircle2,
  FileEdit,
  Archive,
  Plus,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  Sparkles,
  Play,
  Image as ImageIcon,
  Search,
  LogOut,
  User,
} from 'lucide-react';
import { Link, useNavigate } from '../../router/Router';
import { auth } from '../../firebase/config';
import { logOut } from '../../firebase/services/admin';
import { getAllOutfitsAdmin, updateOutfit, createOutfit } from '../../firebase/services/outfits';
import { createProduct, deleteProductsByOutfitId } from '../../firebase/services/products';
import { Outfit } from '../../types/schema';
import { SAMPLE_EDITORIAL_PRESETS } from '../../assets/sampleAssets';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'archived'>('all');

  const fetchOutfits = async () => {
    setLoading(true);
    try {
      const data = await getAllOutfitsAdmin();
      setOutfits(data);
    } catch (err: any) {
      console.warn('Admin fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOutfits();
  }, []);

  // Actual Database-Derived Counts
  const stats = {
    total: outfits.length,
    published: outfits.filter((o) => o.status === 'published').length,
    drafts: outfits.filter((o) => o.status === 'draft').length,
    archived: outfits.filter((o) => o.status === 'archived').length,
  };

  const togglePublishStatus = async (outfit: Outfit) => {
    const nextStatus = outfit.status === 'published' ? 'draft' : 'published';
    try {
      await updateOutfit(outfit.id, { status: nextStatus });
      setMessage(`Outfit ${outfit.id} status updated to ${nextStatus.toUpperCase()}.`);
      await fetchOutfits();
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      alert(`Could not update status: ${err.message}`);
    }
  };

  const handleArchive = async (outfit: Outfit) => {
    if (!window.confirm(`Archive outfit ${outfit.id}? It will be hidden from public discovery.`)) {
      return;
    }
    try {
      await updateOutfit(outfit.id, { status: 'archived' });
      setMessage(`Outfit ${outfit.id} has been moved to ARCHIVED state.`);
      await fetchOutfits();
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      alert(`Could not archive outfit: ${err.message}`);
    }
  };

  const filteredOutfits = useMemo(() => {
    return outfits.filter((o) => {
      if (statusFilter !== 'all' && o.status !== statusFilter) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        return (
          o.id.toLowerCase().includes(q) ||
          o.title.toLowerCase().includes(q) ||
          o.category.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [outfits, statusFilter, searchTerm]);

  const handleSeedPresets = async () => {
    if (!window.confirm('Populate Cloud Firestore with the curated looks (OUT-001 through OUT-005) including images and video looks?')) {
      return;
    }

    setSeeding(true);
    setMessage('Writing editorial looks into Cloud Firestore...');
    try {
      for (const preset of SAMPLE_EDITORIAL_PRESETS) {
        const { products, ...outfitData } = preset;
        await updateOutfit(preset.id, outfitData).catch(async () => {
          await createOutfit(outfitData as any);
        });

        await deleteProductsByOutfitId(preset.id);
        for (const p of products) {
          await createProduct(p.id, {
            outfitId: preset.id,
            name: p.name,
            retailer: p.retailer,
            price: p.price,
            currency: p.currency,
            affiliateUrl: p.affiliateUrl,
            imageUrl: p.imageUrl || null,
            sortOrder: p.sortOrder,
          });
        }
      }
      setMessage('Successfully initialized curated looks into Cloud Firestore!');
      await fetchOutfits();
    } catch (err: any) {
      alert(`Seeding error: ${err.message}`);
    } finally {
      setSeeding(false);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E5DDD0]">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#A77B3D] font-semibold">
            OutFyt.co.in Management Portal
          </span>
          <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-[#171717] tracking-tight">
            Curation Dashboard
          </h1>
          <p className="text-xs text-[#66615B] mt-1">
            Real-time management for social outfit look identifiers, media, and affiliate retailer links.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5 sm:gap-3">
          {/* Administrator Account Indicator */}
          {auth.currentUser?.email && (
            <div className="flex items-center gap-2 text-xs px-3 py-2 rounded-xl bg-[#FFFFFF] border border-[#E5DDD0] text-[#66615B] shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span className="font-mono text-[#171717] font-medium max-w-[180px] sm:max-w-[220px] truncate" title={auth.currentUser.email}>
                {auth.currentUser.email}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#A77B3D] bg-[#EFE6D8] px-1.5 py-0.5 rounded">
                Admin
              </span>
              <button
                onClick={() => logOut()}
                className="text-[#66615B] hover:text-[#171717] ml-1 pl-2 border-l border-[#E5DDD0] transition-colors cursor-pointer flex items-center gap-1"
                title="Sign out of Admin Portal"
              >
                <LogOut className="w-3 h-3" />
                <span className="hidden sm:inline text-[11px]">Sign Out</span>
              </button>
            </div>
          )}

          <button
            onClick={fetchOutfits}
            disabled={loading}
            className="p-2.5 bg-[#FFFFFF] hover:bg-[#F7F3EB] text-[#171717] rounded-xl border border-[#E5DDD0] transition shadow-xs cursor-pointer"
            title="Refresh database records"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#CDA66B]' : ''}`} />
          </button>

          <Link
            to="/admin/outfits/new"
            className="bg-[#CDA66B] hover:bg-[#A77B3D] text-[#FFFFFF] font-semibold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Look</span>
          </Link>
        </div>
      </div>

      {/* Action Notification Message */}
      {message && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage(null)} className="text-[#66615B] hover:text-[#171717]">&times;</button>
        </div>
      )}

      {/* Database Derived Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E5DDD0] space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-[#66615B]">
            <span className="text-xs font-medium">Total Outfits</span>
            <Layers className="w-4 h-4 text-[#A77B3D]" />
          </div>
          <div className="font-mono text-3xl font-bold text-[#171717] tabular-nums">
            {stats.total}
          </div>
          <span className="text-[11px] text-[#66615B] block">Recorded looks in Firestore</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E5DDD0] space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-[#66615B]">
            <span className="text-xs font-medium">Published</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="font-mono text-3xl font-bold text-emerald-700 tabular-nums">
            {stats.published}
          </div>
          <span className="text-[11px] text-[#66615B] block">Live & public to visitors</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E5DDD0] space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-[#66615B]">
            <span className="text-xs font-medium">Drafts</span>
            <FileEdit className="w-4 h-4 text-amber-600" />
          </div>
          <div className="font-mono text-3xl font-bold text-amber-700 tabular-nums">
            {stats.drafts}
          </div>
          <span className="text-[11px] text-[#66615B] block">Private / under curation</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E5DDD0] space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-[#66615B]">
            <span className="text-xs font-medium">Archived</span>
            <Archive className="w-4 h-4 text-[#66615B]" />
          </div>
          <div className="font-mono text-3xl font-bold text-[#66615B] tabular-nums">
            {stats.archived}
          </div>
          <span className="text-[11px] text-[#66615B] block">Hidden from public discovery</span>
        </div>
      </div>

      {/* Catalog Preset Seeding Strip */}
      <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E5DDD0] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#A77B3D]">
            <Sparkles className="w-4 h-4" />
            <span>Editorial Preset Quick-Action</span>
          </div>
          <h3 className="text-base font-semibold text-[#171717]">
            Initialize / Restore Curated Outfits (OUT-001 through OUT-005)
          </h3>
          <p className="text-xs text-[#66615B]">
            Populates Cloud Firestore with our verified fashion presets, high-res photography, video reel, and Indian retailer affiliate data.
          </p>
        </div>
        <button
          onClick={handleSeedPresets}
          disabled={seeding}
          className="shrink-0 bg-[#EFE6D8] hover:bg-[#E5DDD0] text-[#171717] font-semibold text-xs px-4 py-2.5 rounded-xl border border-[#E5DDD0] transition flex items-center gap-1.5 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-[#A77B3D]" />
          <span>{seeding ? 'Writing to Firestore...' : 'Seed 5 Curated Looks'}</span>
        </button>
      </div>

      {/* Outfits Management Table with Search and Status Filters */}
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5DDD0] overflow-hidden shadow-xs space-y-4 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5DDD0] pb-4">
          <div>
            <h3 className="text-base font-semibold text-[#171717]">Catalog Outfits Management</h3>
            <p className="text-xs text-[#66615B]">Filter by state, publish or archive looks, and manage affiliate garments.</p>
          </div>
          <Link
            to="/admin/outfits/new"
            className="text-xs font-semibold bg-[#CDA66B] hover:bg-[#A77B3D] text-[#FFFFFF] px-3.5 py-1.5 rounded-lg flex items-center gap-1 shrink-0 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Outfit</span>
          </Link>
        </div>

        {/* Search and Status Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by ID (OUT-001), title, or category..."
              className="w-full bg-[#F7F3EB] border border-[#E5DDD0] rounded-lg pl-9 pr-4 py-2 text-xs text-[#171717] placeholder-[#66615B] outline-none focus:border-[#CDA66B]"
            />
            <Search className="w-4 h-4 text-[#66615B] absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          <div className="flex items-center gap-1 text-xs">
            {(['all', 'published', 'draft', 'archived'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg capitalize transition cursor-pointer ${
                  statusFilter === status
                    ? 'bg-[#171717] text-[#CDA66B] font-semibold'
                    : 'bg-[#F7F3EB] text-[#66615B] hover:text-[#171717]'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-[#66615B]">Loading catalog records...</div>
        ) : filteredOutfits.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F3EB] text-[#66615B] uppercase tracking-wider font-semibold border-b border-[#E5DDD0]">
                <tr>
                  <th className="py-3 px-4">Media</th>
                  <th className="py-3 px-4">Look ID & Title</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5DDD0] text-[#171717]">
                {filteredOutfits.map((outfit) => {
                  const isVideo = outfit.heroMediaType === 'video';
                  const thumb = outfit.heroThumbnailUrl || outfit.heroImageUrl || outfit.heroMediaUrl;
                  return (
                    <tr key={outfit.id} className="hover:bg-[#F7F3EB]/60 transition">
                      <td className="py-3 px-4">
                        <div className="w-12 h-16 rounded overflow-hidden bg-[#EFE6D8] border border-[#E5DDD0] shrink-0 relative">
                          {thumb ? (
                            <img
                              src={thumb}
                              alt={outfit.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#66615B]">
                              <ImageIcon className="w-4 h-4" />
                            </div>
                          )}
                          {isVideo && (
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                              <Play className="w-3 h-3 text-white fill-current" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-[#A77B3D] block">
                          {outfit.id}
                        </span>
                        <span className="font-medium text-[#171717] truncate block max-w-xs sm:max-w-md">
                          {outfit.title}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#66615B] capitalize">
                        {outfit.heroMediaType || 'image'}
                      </td>
                      <td className="py-3 px-4 text-[#66615B]">{outfit.category}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                            outfit.status === 'published'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : outfit.status === 'draft'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-neutral-100 text-neutral-600 border border-neutral-200'
                          }`}
                        >
                          {outfit.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        {/* Publish / Unpublish Action */}
                        <button
                          onClick={() => togglePublishStatus(outfit)}
                          className="text-[11px] text-[#66615B] hover:text-[#171717] underline cursor-pointer"
                        >
                          {outfit.status === 'published' ? 'Unpublish' : 'Publish'}
                        </button>
                        <span>&bull;</span>

                        {/* Edit Action */}
                        <Link
                          to={`/admin/outfits/${outfit.id}/edit`}
                          className="text-[11px] text-[#A77B3D] hover:underline font-semibold"
                        >
                          Edit
                        </Link>
                        <span>&bull;</span>

                        {/* Preview Action */}
                        <Link
                          to={`/outfit/${outfit.slug || outfit.id.toLowerCase()}`}
                          target="_blank"
                          className="text-[11px] text-[#66615B] hover:text-[#171717] inline-flex items-center gap-0.5"
                        >
                          <span>Preview</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </Link>
                        <span>&bull;</span>

                        {/* Archive Action */}
                        {outfit.status !== 'archived' ? (
                          <button
                            onClick={() => handleArchive(outfit)}
                            className="text-[11px] text-[#66615B] hover:text-rose-600 underline cursor-pointer"
                          >
                            Archive
                          </button>
                        ) : (
                          <button
                            onClick={() => togglePublishStatus(outfit)}
                            className="text-[11px] text-[#66615B] hover:text-emerald-700 underline cursor-pointer"
                          >
                            Restore
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-[#66615B]">
            No outfits found matching criteria. Click "Create Outfit" or "Seed 5 Curated Looks" above.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
