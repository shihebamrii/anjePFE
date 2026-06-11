'use client'; // Instructs Next.js to render this file on the client-side (in the browser)

import { useState, useEffect } from 'react'; // React hooks for component state and side effects
import { useAuth } from '@/context/AuthContext'; // Hook to access user identity and auth helpers
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // UI components for card boxes
import { Badge } from '@/components/ui/badge'; // UI label badge indicator component
import { Button } from '@/components/ui/button'; // UI clickable button component
import { Input } from '@/components/ui/input'; // UI text input field
import { LoadingPage } from '@/components/ui/loading'; // UI loading screen page placeholder
import { complaintService } from '@/services/complaintService'; // API services to fetch and update complaints records
import { formatDate } from '@/lib/utils'; // Utility function to convert ISO dates to user-friendly format
import { AlertTriangle, CheckCircle2, XCircle, Clock, MessageSquare, X, Send } from 'lucide-react'; // Visual icon library elements
import { PortalModal } from '@/components/ui/portal-modal'; // UI portal modal component for overlays

// Configurations dictionary mapping complaint status keys to visual class styles, labels, and icons
const STATUS_CONFIG = {
  PENDING: { label: 'En attente', color: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800', icon: Clock },
  ACCEPTED: { label: 'Acceptée', color: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800', icon: CheckCircle2 },
  REJECTED: { label: 'Rejetée', color: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800', icon: XCircle },
};

export default function ComplaintsPage() {
  // --- Auth Context Hooks ---
  const { user, isStudent } = useAuth(); // Retrieve current logged in user details and student flags
  
  // Flag determining if the user has elevated permissions to resolve complaints (department chief or admin)
  const isChef = user?.role === 'CHEF_DEPT' || user?.role === 'ADMIN';

  // --- React State Declarations ---
  const [complaints, setComplaints] = useState([]); // List of complaints retrieved from the server
  const [loading, setLoading] = useState(true); // Loading page indicator flag
  const [resolveModal, setResolveModal] = useState(null); // Active complaint database ID target being resolved (null if modal closed)
  const [resolveData, setResolveData] = useState({ status: '', response: '' }); // Input form values for resolving a complaint
  const [resolving, setResolving] = useState(false); // Indicates if the resolve API submission is processing

  // Retrieve complaints list once upon component initialization
  useEffect(() => {
    async function fetchData() {
      try {
        const data = await complaintService.getComplaints(); // Request complaints API list
        setComplaints(data); // Save results to state array
      } catch (err) { 
        console.error(err); // Log network errors to developer console
      } finally { 
        setLoading(false); // Hide full page loading indicator
      }
    }
    fetchData();
  }, []); // Empty dependency array run once on mount

  // Resolves the targeted complaint status and comment response on the backend API
  const handleResolve = async () => {
    if (!resolveData.status) return; // Exit if no status decision (Accept/Reject) has been set
    setResolving(true); // Enable saving indicator
    try {
      // Call PUT resolution api endpoint on the backend
      const updated = await complaintService.resolveComplaint(resolveModal, resolveData);
      
      // Update local state list replacing old complaint object with the newly returned version
      setComplaints(complaints.map(c => c._id === resolveModal ? updated : c));
      
      setResolveModal(null); // Close modal popup
      setResolveData({ status: '', response: '' }); // Reset modal inputs state values
    } catch (err) { 
      console.error(err);
    } finally { 
      setResolving(false); // Disable saving indicator
    }
  };

  // If page is fetching initial data, show full screen loader
  if (loading) return <LoadingPage />;

  // Filter complaints list categories to count and display stats
  const pending = complaints.filter(c => c.status === 'PENDING');
  const resolved = complaints.filter(c => c.status !== 'PENDING');

  return (
    <div className="space-y-6">
      {/* Header section displaying title, icon and context descriptions */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2 tracking-tight">
          <AlertTriangle size={24} className="text-amber-500" />
          Réclamations
        </h1>
        <p className="text-slate-500 mt-1 text-sm">
          {isStudent ? 'Suivez vos réclamations de notes' : 'Gérez les réclamations des étudiants'}
        </p>
      </div>

      {/* Statistics counters grids (Pending, Accepted, Rejected) */}
      <div className="grid grid-cols-3 gap-4">
        {/* Pending card count */}
        <Card className="border-0">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-md">
              <Clock className="text-white" size={18} />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{pending.length}</p>
              <p className="text-xs text-slate-400">En attente</p>
            </div>
          </CardContent>
        </Card>
        {/* Accepted card count */}
        <Card className="border-0">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md">
              <CheckCircle2 className="text-white" size={18} />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{complaints.filter(c => c.status === 'ACCEPTED').length}</p>
              <p className="text-xs text-slate-400">Acceptées</p>
            </div>
          </CardContent>
        </Card>
        {/* Rejected card count */}
        <Card className="border-0">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-md">
              <XCircle className="text-white" size={18} />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{complaints.filter(c => c.status === 'REJECTED').length}</p>
              <p className="text-xs text-slate-400">Rejetées</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Complaints List Table Container */}
      <Card className="border-0">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                  {/* Conditionally display student column only for chiefs/admins */}
                  {isChef && <th className="text-left p-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Étudiant</th>}
                  <th className="text-left p-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Matière</th>
                  <th className="text-left p-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Note</th>
                  <th className="text-left p-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Type</th>
                  <th className="text-left p-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Raison</th>
                  <th className="text-left p-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Statut</th>
                  <th className="text-left p-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Date</th>
                  {isChef && <th className="text-right p-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {complaints.map((complaint) => {
                  const cfg = STATUS_CONFIG[complaint.status]; // Pick styling parameters based on item status
                  const StatusIcon = cfg.icon;
                  return (
                    <tr key={complaint._id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                      {/* Render student details if user is chief */}
                      {isChef && (
                        <td className="p-4">
                          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{complaint.student?.firstName} {complaint.student?.lastName}</p>
                          <p className="text-[11px] text-slate-400">{complaint.student?.studentId}</p>
                        </td>
                      )}
                      {/* Course subject details */}
                      <td className="p-4">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{complaint.grade?.courseName}</p>
                        <p className="text-[11px] text-slate-400">{complaint.grade?.subject}</p>
                      </td>
                      {/* Score score details */}
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded-lg text-sm font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                          {complaint.grade?.score}/20
                        </span>
                      </td>
                      {/* Evaluation type badge (DS, EXAM, etc.) */}
                      <td className="p-4">
                        <Badge variant="secondary" className="text-[10px]">{complaint.grade?.type}</Badge>
                      </td>
                      {/* Reason paragraph cell */}
                      <td className="p-4 max-w-[200px]">
                        <p className="text-sm text-slate-600 dark:text-slate-300 truncate" title={complaint.reason}>{complaint.reason}</p>
                        {/* Display response text feedback if already processed */}
                        {complaint.response && (
                          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 truncate" title={complaint.response}>
                            <MessageSquare size={10} /> {complaint.response}
                          </p>
                        )}
                      </td>
                      {/* Status indicator pill cell */}
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${cfg.color}`}>
                          <StatusIcon size={12} /> {cfg.label}
                        </span>
                      </td>
                      {/* Creation formatted date cell */}
                      <td className="p-4 text-sm text-slate-400">{formatDate(complaint.createdAt)}</td>
                      {/* Actions buttons triggering popup dialog if user is chief */}
                      {isChef && (
                        <td className="p-4 text-right">
                          {complaint.status === 'PENDING' ? (
                            <Button size="sm" variant="outline" onClick={() => { setResolveModal(complaint._id); setResolveData({ status: '', response: '' }); }} className="text-xs gap-1">
                              <MessageSquare size={12} /> Traiter
                            </Button>
                          ) : (
                            <span className="text-[11px] text-slate-400">
                              {complaint.resolvedBy ? `${complaint.resolvedBy.firstName} ${complaint.resolvedBy.lastName}` : '—'}
                            </span>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {/* Show empty placeholder text if complaints list is empty */}
            {complaints.length === 0 && <p className="text-sm text-slate-400 text-center py-12">Aucune réclamation</p>}
          </div>
        </CardContent>
      </Card>

      {/* Action modal to resolve a targeted complaint */}
      <PortalModal isOpen={!!resolveModal} onClose={() => setResolveModal(null)}>
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Traiter la Réclamation</h2>
          <button onClick={() => setResolveModal(null)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X size={18} className="text-slate-400" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">Décision</label>
            <div className="flex gap-3">
              {/* Option to accept the student's request */}
              <button
                onClick={() => setResolveData({ ...resolveData, status: 'ACCEPTED' })}
                className={`flex-1 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                  resolveData.status === 'ACCEPTED'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                    : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-emerald-300'
                }`}
              >
                <CheckCircle2 size={16} className="inline mr-1.5" /> Accepter
              </button>
              {/* Option to reject the student's request */}
              <button
                onClick={() => setResolveData({ ...resolveData, status: 'REJECTED' })}
                className={`flex-1 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                  resolveData.status === 'REJECTED'
                    ? 'border-red-500 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400'
                    : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-red-300'
                }`}
              >
                <XCircle size={16} className="inline mr-1.5" /> Rejeter
              </button>
            </div>
          </div>
          {/* Optional Response comment textarea */}
          <div>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">Réponse (optionnel)</label>
            <textarea
              value={resolveData.response}
              onChange={(e) => setResolveData({ ...resolveData, response: e.target.value })}
              placeholder="Ajouter un commentaire..."
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-200 shadow-sm focus:ring-2 focus:ring-accent/30 focus:border-accent outline-none resize-none"
            />
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="ghost" size="sm" onClick={() => setResolveModal(null)}>Annuler</Button>
          <Button
            type="button"
            size="sm"
            disabled={!resolveData.status || resolving}
            onClick={handleResolve}
            className="gap-1.5"
          >
            {resolving ? (
              <><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Traitement...</>
            ) : (
              <><Send size={14} /> Confirmer</>
            )}
          </Button>
        </div>
      </PortalModal>
    </div>
  );
}

