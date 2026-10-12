import React, { useEffect, useState } from 'react';
import { Plus, Search, Trash2, Edit, ExternalLink, RefreshCw, ArrowLeft, Play, Image as ImageIcon } from 'lucide-react';
import { Link } from '../../router/Router';
import { getAllOutfitsAdmin, updateOutfit, deleteOutfit } from '../../firebase/services/outfits';
import { deleteProductsByOutfitId } from '../../firebase/services/products';
import { Outfit } from '../../types/schema';

export const AdminOutfitsPage: React.FC = () => {
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'archived'>('all');

  const fetchOutfits = async () => {
    setLoading(true);
    try {
      const data = await getAllOutfitsAdmin();
      setOutfits(data);
    } catch (err: any) {
      console.warn('Error loading admin outfits:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOutfits();
  }, []);

  const handleStatusChange = async (outfitId: string, newStatus: 'published' | 'draft' | 'archived') => {
    try {
      await updateOutfit(outfitId, { status: newStatus });
      await fetchOutfits();
    } catch (err: any) {
      alert(`Error updating status: ${err.message}`);
    }
  };

  const handleDelete = async (outfit: Outfit) => {
    if (!window.confirm(`Permanently delete outfit ${outfit.id} (${outfit.title}) and all associated affiliate products?`)) {
      return;
    }
    try {
      await deleteProductsByOutfitId(outfit.id);
      await deleteOutfit(outfit.id);
      await fetchOutfits();
    } catch (err: any) {
      alert(`Error deleting outfit: ${err.message}`);
    }
  };

  const filtered = outfits.filter((o) => {
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        o.id.toLowerCase().includes(q) ||
        o.title.toLowerCase().includes(q) ||
        o.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E5DDD0]">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#66615B] mb-1">
            <Link to="/admin" className="hover:text-[#171717] flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Admin Dashboard</span>
            </Link>
          </div>
          <h1 className="font-editorial text-3xl font-bold text-[#171717] tracking-tight">
            Manage Outfits
          </h1>
          <p className="text-xs text-[#66615B] mt-1">
            Complete catalogue across published, draft, and archived states.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchOutfits}
            className="p-2.5 bg-[#FFFFFF] hover:bg-[#F7F3EB] text-[#171717] rounded-xl border border-[#E5DDD0] shadow-xs cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#CDA66B]' : ''}`} />
          </button>
          <Link
            to="/admin/outfits/new"
            className="bg-[#CDA66B] hover:bg-[#A77B3D] text-[#FFFFFF] font-semibold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Create Outfit</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-[#FFFFFF] p-3.5 rounded-xl border border-[#E5DDD0] shadow-xs">
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
                  ? 'bg-[#CDA66B] text-[#FFFFFF] font-semibold'
                  : 'bg-[#F7F3EB] text-[#66615B] hover:text-[#171717] border border-[#E5DDD0]'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Outfits Table */}
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5DDD0] overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-xs text-[#66615B]">Loading catalog...</div>
        ) : filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F3EB] text-[#66615B] uppercase tracking-wider font-semibold border-b border-[#E5DDD0]">
                <tr>
                  <th className="py-3 px-4">Media</th>
                  <th className="py-3 px-4">Look ID</th>
                  <th className="py-3 px-4">Title & Slug</th>
                  <th className="py-3 px-4">Format</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5DDD0] text-[#171717]">
                {filtered.map((outfit) => {
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
                        <span className="font-mono font-bold text-[#A77B3D]">
                          {outfit.id}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-[#171717] block max-w-xs truncate">
                          {outfit.title}
                        </span>
                        <span className="text-[11px] text-[#66615B] font-mono block truncate">
                          /{outfit.slug}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#66615B] capitalize">
                        {outfit.heroMediaType || 'image'}
                      </td>
                      <td className="py-3 px-4 text-[#66615B]">{outfit.category}</td>
                      <td className="py-3 px-4">
                        <select
                          value={outfit.status}
                          onChange={(e) => handleStatusChange(outfit.id, e.target.value as any)}
                          className={`bg-[#FFFFFF] border rounded px-2 py-1 text-[11px] font-semibold outline-none ${
                            outfit.status === 'published'
                              ? 'text-emerald-700 border-emerald-300'
                              : outfit.status === 'draft'
                              ? 'text-amber-700 border-amber-300'
                              : 'text-neutral-600 border-neutral-300'
                          }`}
                        >
                          <option value="published">Published</option>
                          <option value="draft">Draft</option>
                          <option value="archived">Archived</option>
                        </select>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <Link
                          to={`/admin/outfits/${outfit.id}/edit`}
                          className="p-1.5 text-[#66615B] hover:text-[#A77B3D] inline-block"
                          title="Edit Outfit"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <Link
                          to={`/outfit/${outfit.slug || outfit.id.toLowerCase()}`}
                          target="_blank"
                          className="p-1.5 text-[#66615B] hover:text-[#171717] inline-block"
                          title="Preview Outfit Page"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(outfit)}
                          className="p-1.5 text-[#66615B] hover:text-rose-600 transition inline-block cursor-pointer"
                          title="Delete Outfit"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-xs text-[#66615B]">
            No outfits found matching your filters.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOutfitsPage;
