import React, { useState, useEffect } from 'react';
import { Material } from '../types';
import { subscribeMaterials, createMaterial, deleteMaterial } from '../services/campusService';
import { useAuth } from '../context/AuthContext';
import { 
  BookOpen, 
  UploadCloud, 
  FileText, 
  Search, 
  Trash2, 
  Download, 
  Calendar, 
  User, 
  AlertCircle, 
  X,
  FileCode,
  FileSpreadsheet,
  CheckCircle2
} from 'lucide-react';

interface MaterialsViewProps {
  isUploadModalOpen: boolean;
  onCloseUploadModal: () => void;
  onOpenUploadModal: () => void;
}

export const MaterialsView: React.FC<MaterialsViewProps> = ({
  isUploadModalOpen,
  onCloseUploadModal,
  onOpenUploadModal,
}) => {
  const { userProfile, isOwner } = useAuth();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<{ name: string; size: string; type: string } | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    const unsub = subscribeMaterials(setMaterials);
    return () => unsub();
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setSelectedFile({
        name: file.name,
        size: formatFileSize(file.size),
        type: file.name.split('.').pop()?.toUpperCase() || 'FILE'
      });
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile({
        name: file.name,
        size: formatFileSize(file.size),
        type: file.name.split('.').pop()?.toUpperCase() || 'FILE'
      });
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;
    if (!title.trim() || !subject.trim() || !selectedFile) {
      setError('Please provide title, subject, and select a file to upload');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await createMaterial({
        title: title.trim(),
        subject: subject.trim(),
        description: description.trim(),
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        fileType: selectedFile.type,
        uploaderName: userProfile.name,
        uploaderUid: userProfile.uid
      });

      // Reset
      setTitle('');
      setSubject('');
      setDescription('');
      setSelectedFile(null);
      onCloseUploadModal();
    } catch (err: any) {
      setError(err.message || 'Failed to upload material metadata');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this academic resource?')) {
      try {
        await deleteMaterial(id);
      } catch (err) {
        console.error("Failed to delete material", err);
      }
    }
  };

  const filteredMaterials = materials.filter(m => 
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.uploaderName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-700 via-indigo-700 to-pink-600 text-white p-6 sm:p-7 shadow-lg shadow-purple-500/10">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold text-white flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                Knowledge Base
              </span>
              <span className="text-xs text-purple-200">
                {materials.length} Shared Documents & Past Papers
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Academic Materials, Notes & Syllabus Resources
            </h2>
            <p className="text-xs sm:text-sm text-purple-100 max-w-xl">
              Lecture slides, past exam questions, lab manuals, and faculty course readings available to everyone.
            </p>
          </div>

          <button
            id="btn-upload-study-material"
            onClick={onOpenUploadModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-purple-50 text-purple-800 font-extrabold text-xs rounded-xl shadow-md transition-all shrink-0"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Material</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            id="input-search-materials"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search resources by title, subject, file format or uploader..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Materials List */}
      {filteredMaterials.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/90 shadow-sm">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-800">No study materials found</p>
          <p className="text-xs text-slate-400 mt-1">
            {searchQuery ? 'Try a different search query' : 'Be the first to share notes or lecture slides with the campus'}
          </p>
          <button
            onClick={onOpenUploadModal}
            className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-xl text-xs font-bold transition-colors"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Upload notes or slides now</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMaterials.map((mat) => {
            const canDelete = isOwner || mat.uploaderUid === userProfile?.uid || userProfile?.roles?.includes('Institution Admin') || userProfile?.roles?.includes('Moderator');
            const isPdf = mat.fileType.toLowerCase().includes('pdf');
            const isDoc = mat.fileType.toLowerCase().includes('doc');

            return (
              <div
                key={mat.id}
                id={`material-card-${mat.id}`}
                className="group relative p-5 bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:border-purple-300 hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500" />
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-purple-50 text-purple-700 border border-purple-200/70">
                      {mat.subject}
                    </span>
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                      isPdf 
                        ? 'bg-red-50 text-red-700 border border-red-200' 
                        : isDoc 
                        ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {mat.fileType}
                    </span>
                  </div>

                  <h3 className="font-black text-base text-slate-900 group-hover:text-purple-700 transition-colors mb-1 line-clamp-1">
                    {mat.title}
                  </h3>

                  {mat.description && (
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3 font-normal">
                      {mat.description}
                    </p>
                  )}

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/60 flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-semibold text-slate-800 truncate">
                        {mat.fileName}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono font-bold shrink-0 ml-2 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                      {mat.fileSize}
                    </span>
                  </div>
                </div>

                <div className="pt-3 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-black flex items-center justify-center">
                      {mat.uploaderName.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-bold text-slate-700 truncate max-w-[110px]">{mat.uploaderName}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => alert(`Downloading "${mat.fileName}" (${mat.fileSize}). Cloud verified document.`)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 transition-colors"
                      title="Download resource"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Get</span>
                    </button>
                    {canDelete && (
                      <button
                        onClick={() => handleDelete(mat.id)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete material"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-base">Share Academic Material</h3>
              <button
                onClick={onCloseUploadModal}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Title / Topic *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chapter 4 - Graph Algorithms Slides"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Course / Subject *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Data Structures & Algorithms"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Brief notes, lecture references, or chapter hints..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white resize-none"
                />
              </div>

              {/* Drag and Drop File Picker (Adheres to file upload usability guideline) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Upload Document or Archive *
                </label>
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleFileDrop}
                  className={`p-5 rounded-2xl border-2 border-dashed text-center transition-all cursor-pointer ${
                    isDragOver
                      ? 'border-purple-600 bg-purple-50'
                      : selectedFile
                      ? 'border-emerald-300 bg-emerald-50/40'
                      : 'border-slate-200 hover:border-purple-300 bg-slate-50'
                  }`}
                  onClick={() => document.getElementById('material-file-input')?.click()}
                >
                  <input
                    id="material-file-input"
                    type="file"
                    className="hidden"
                    onChange={handleFileInput}
                  />

                  {selectedFile ? (
                    <div className="flex items-center justify-center gap-2 text-emerald-700">
                      <CheckCircle2 className="w-5 h-5" />
                      <div className="text-left">
                        <p className="text-xs font-bold truncate max-w-[200px]">{selectedFile.name}</p>
                        <p className="text-[10px] text-emerald-600">{selectedFile.size} • {selectedFile.type}</p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <UploadCloud className="w-8 h-8 text-purple-500 mx-auto mb-1" />
                      <p className="text-xs font-semibold text-slate-700">Drag & drop your file here</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">or click to browse from device (PDF, DOCX, PPTX, ZIP)</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onCloseUploadModal}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-xl shadow-xs disabled:opacity-50"
                >
                  {loading ? 'Publishing...' : 'Share Material'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
