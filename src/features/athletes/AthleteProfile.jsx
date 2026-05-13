import { useState } from "react";
import {
  ShieldCheck,
  TrendingUp,
  FileText,
  Image as ImageIcon,
  Activity,
  Dumbbell,
  HeartPulse,
  MoreVertical,
  Plus,
} from "lucide-react";
import {
  Field,
  FeedbackPanel,
  Modal,
  PrimaryButton,
  SecondaryButton,
  SelectInput,
  TextArea,
  TextInput,
} from "../../components/ui/Modal";

export function AthleteProfile({ athlete }) {
  const [modal, setModal] = useState(null);
  const closeModal = () => setModal(null);

  return (
    <div className="space-y-6 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Top Profile Card */}
      <div className="bg-surface-card rounded-[24px] border border-border-subtle/40 shadow-soft p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 relative z-10">
          <div className="flex items-start gap-6">
            <img
              src={athlete.imageUrl}
              alt={athlete.name}
              className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-soft"
            />
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {athlete.name}
              </h1>
              <p className="text-[14px] text-brand-blue font-medium mt-1">
                {athlete.sport} | {athlete.event}
              </p>

              <div className="flex flex-wrap items-center gap-6 mt-6">
                <div>
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                    Student ID
                  </p>
                  <p className="text-[14px] font-medium text-slate-900">
                    {athlete.id}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                    Academic Standing
                  </p>
                  <p className="text-[14px] font-semibold text-brand-gold">
                    {athlete.standing}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                    Medical Status
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    <p className="text-[14px] font-medium text-slate-900">
                      {athlete.status}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                    Coach
                  </p>
                  <p className="text-[14px] font-medium text-slate-900">
                    {athlete.coach}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-4">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-brand-blue/10 text-brand-blue rounded-full text-[12px] font-semibold">
                {athlete.scholarship}
              </span>
              <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[12px] font-semibold">
                {athlete.year}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setModal({ type: "status" })}
              className="flex items-center gap-2 bg-brand-blue text-white px-5 py-2 rounded-full font-medium hover:bg-brand-blue-hover transition-colors shadow-soft text-[12px] tracking-wide mt-2"
            >
              <ShieldCheck className="w-4 h-4" />
              Elite Status
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (1/3) */}
        <div className="space-y-6">
          {/* Academic Monitoring */}
          <div className="bg-surface-card p-7 rounded-[24px] border border-border-subtle/40 shadow-soft">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[16px] font-bold text-slate-900 leading-tight">
                Academic
                <br />
                Monitoring
              </h2>
              <button
                type="button"
                onClick={() => setModal({ type: "report" })}
                className="text-[12px] font-semibold text-brand-blue hover:underline"
              >
                Full Report
              </button>
            </div>

            {/* Minimal line chart placeholder */}
            <div className="h-28 w-full flex items-end justify-between px-4 pb-8 mb-4 border-b border-border-subtle/50 mt-8">
              <div className="w-2 h-[45%] bg-slate-200 rounded-full relative group">
                <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-400 whitespace-nowrap">
                  S1 '22
                </span>
              </div>
              <div className="w-2 h-[55%] bg-slate-200 rounded-full relative group">
                <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-400 whitespace-nowrap">
                  S2 '22
                </span>
              </div>
              <div className="w-2 h-[75%] bg-brand-blue-light rounded-full relative group">
                <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-[10px] font-bold text-brand-blue whitespace-nowrap">
                  S1 '23
                </span>
              </div>
              <div className="w-2 h-[95%] bg-brand-blue rounded-full relative group shadow-soft">
                <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-[10px] font-bold text-brand-blue whitespace-nowrap">
                  CURRENT
                </span>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 flex items-center justify-between mt-6 border border-border-subtle/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[12px] text-slate-500 font-medium">
                    Current GPA
                  </p>
                  <p className="text-[16px] font-bold text-brand-blue">
                    {athlete.gpa} / 4.0
                  </p>
                </div>
              </div>
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-[10px] font-bold">
                +12.5%
              </span>
            </div>
          </div>

          {/* Digital Documents */}
          <div className="bg-surface-card p-7 rounded-[24px] border border-border-subtle/40 shadow-soft">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[16px] font-bold text-slate-900">
                Digital Documents
              </h2>
              <button
                type="button"
                onClick={() => setModal({ type: "document" })}
                className="w-8 h-8 rounded-full hover:bg-slate-50 flex items-center justify-center text-slate-500 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() =>
                  setModal({
                    type: "view-document",
                    payload: "Scholarship_Agreement.pdf",
                  })
                }
                className="w-full flex items-center gap-4 p-4 rounded-2xl border border-border-subtle/50 hover:border-brand-blue/20 hover:bg-slate-50 transition-all cursor-pointer text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-slate-900 truncate">
                    Scholarship_Agreement.pdf
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Signed: Oct 12, 2023 • 2.4 MB
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() =>
                  setModal({
                    type: "view-document",
                    payload: "Medical_Clearance_2024.docx",
                  })
                }
                className="w-full flex items-center gap-4 p-4 rounded-2xl border border-border-subtle/50 hover:border-brand-blue/20 hover:bg-slate-50 transition-all cursor-pointer text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-brand-blue flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-slate-900 truncate">
                    Medical_Clearance_2024.docx
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Expires: Jun 20, 2024 • 1.1 MB
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() =>
                  setModal({
                    type: "view-document",
                    payload: "Athlete_ID_Scan.png",
                  })
                }
                className="w-full flex items-center gap-4 p-4 rounded-2xl border border-border-subtle/50 hover:border-brand-blue/20 hover:bg-slate-50 transition-all cursor-pointer text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-slate-900 truncate">
                    Athlete_ID_Scan.png
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Verified • 850 KB
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Performance Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-surface-card p-6 rounded-[24px] border border-border-subtle/40 shadow-soft">
              <div className="flex items-center gap-2 text-brand-blue mb-4">
                <Activity className="w-4 h-4" />
                <h3 className="text-[13px] font-semibold">
                  Sprint Performance
                </h3>
              </div>
              <p className="text-4xl font-extrabold text-slate-900 tracking-tighter">
                54.2
              </p>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                400m Hurdles (Sec)
              </p>
              <div className="w-full h-1.5 bg-slate-100 rounded-full mt-4 overflow-hidden">
                <div className="w-4/5 h-full bg-brand-blue rounded-full"></div>
              </div>
              <p className="text-[11px] text-slate-500 mt-3">
                Personal Best • -0.4s improvement
              </p>
            </div>

            <div className="bg-surface-card p-6 rounded-[24px] border border-border-subtle/40 shadow-soft">
              <div className="flex items-center gap-2 text-brand-gold mb-4">
                <Dumbbell className="w-4 h-4" />
                <h3 className="text-[13px] font-semibold">Strength (Squat)</h3>
              </div>
              <p className="text-4xl font-extrabold text-slate-900 tracking-tighter">
                115
              </p>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                Max Load (KG)
              </p>
              <div className="w-full h-1.5 bg-slate-100 rounded-full mt-4 overflow-hidden">
                <div className="w-11/12 h-full bg-brand-gold rounded-full"></div>
              </div>
              <p className="text-[11px] text-slate-500 mt-3">
                Target: 125kg for Spring Games
              </p>
            </div>

            <div className="bg-surface-card p-6 rounded-[24px] border border-border-subtle/40 shadow-soft">
              <div className="flex items-center gap-2 text-slate-600 mb-4">
                <HeartPulse className="w-4 h-4" />
                <h3 className="text-[13px] font-semibold">Wellness Score</h3>
              </div>
              <p className="text-4xl font-extrabold text-slate-900 tracking-tighter">
                92
                <span className="text-[18px] text-slate-400 font-bold">
                  /100
                </span>
              </p>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                Optimal Readiness
              </p>
              <div className="w-full h-1.5 bg-slate-100 rounded-full mt-4 overflow-hidden">
                <div className="w-[92%] h-full bg-slate-700 rounded-full"></div>
              </div>
              <p className="text-[11px] text-slate-500 mt-3">
                Sleep: 8.5h • Strain: Low
              </p>
            </div>
          </div>

          {/* Equipment History */}
          <div className="bg-surface-card rounded-[24px] border border-border-subtle/40 shadow-soft overflow-hidden">
            <div className="p-7 border-b border-border-subtle/50 flex items-center justify-between">
              <h2 className="text-[16px] font-bold text-slate-900">
                Equipment History
              </h2>
              <button
                type="button"
                onClick={() => setModal({ type: "issue" })}
                className="flex items-center gap-2 bg-brand-blue text-white px-4 py-2 rounded-full font-medium hover:bg-brand-blue-hover transition-colors shadow-soft text-[12px] tracking-wide"
              >
                <Plus className="w-3.5 h-3.5" />
                ISSUE ITEM
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 text-[10px] tracking-widest font-bold text-slate-400 uppercase border-b border-border-subtle/50">
                    <th className="p-5 pl-7 font-semibold">Item Description</th>
                    <th className="p-5 font-semibold">Issued Date</th>
                    <th className="p-5 font-semibold">Due Date</th>
                    <th className="p-5 font-semibold">Status</th>
                    <th className="p-5 pr-7 font-semibold text-right">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle/50 text-[13px]">
                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-5 pl-7">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                          <ImageIcon className="w-5 h-5 opacity-50" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">
                            Nike Air Zoom Victory
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Serial: #TK-8912
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-5 text-slate-600">Nov 02, 2023</td>
                    <td className="p-5 text-slate-600">Mar 15, 2024</td>
                    <td className="p-5">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold bg-green-50 text-green-700 uppercase tracking-wider">
                        In Possession
                      </span>
                    </td>
                    <td className="p-5 pr-7 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          setModal({
                            type: "equipment-action",
                            payload: "Nike Air Zoom Victory",
                          })
                        }
                        className="text-slate-400 hover:text-brand-blue transition-colors p-1.5 rounded-lg hover:bg-slate-100"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-5 pl-7">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                          <Dumbbell className="w-5 h-5 opacity-50" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">
                            Resistance Band Set (L4)
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Serial: #TR-440
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-5 text-slate-600">Oct 15, 2023</td>
                    <td className="p-5 text-slate-600">Oct 30, 2023</td>
                    <td className="p-5">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600 uppercase tracking-wider">
                        Returned
                      </span>
                    </td>
                    <td className="p-5 pr-7 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          setModal({
                            type: "equipment-action",
                            payload: "Resistance Band Set (L4)",
                          })
                        }
                        className="text-slate-400 hover:text-brand-blue transition-colors p-1.5 rounded-lg hover:bg-slate-100"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-5 pl-7">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                          <Activity className="w-5 h-5 opacity-50" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">
                            Polar H10 Heart Monitor
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Serial: #SN-90221
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-5 text-slate-600">Nov 28, 2023</td>
                    <td className="p-5 font-semibold text-red-600">
                      Dec 15, 2023
                    </td>
                    <td className="p-5">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold bg-red-50 text-red-700 uppercase tracking-wider">
                        Overdue
                      </span>
                    </td>
                    <td className="p-5 pr-7 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          setModal({
                            type: "equipment-action",
                            payload: "Polar H10 Heart Monitor",
                          })
                        }
                        className="text-slate-400 hover:text-brand-blue transition-colors p-1.5 rounded-lg hover:bg-slate-100"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Recovery Plan */}
          <div className="bg-brand-blue-light/80 p-7 rounded-[24px] border border-brand-blue/20 shadow-soft flex flex-col sm:flex-row gap-6 items-center sm:items-start">
            <div className="w-24 h-24 rounded-2xl bg-slate-800 shrink-0 overflow-hidden relative shadow-md">
              <img
                src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=200"
                alt="Therapy"
                className="w-full h-full object-cover opacity-80"
              />
            </div>
            <div className="flex-1">
              <h2 className="text-[16px] font-bold text-slate-900 mb-2">
                Recovery Plan & Coaching Notes
              </h2>
              <p className="text-[13px] text-slate-600 leading-relaxed">
                "Sarah is showing excellent progression in her fast-twitch
                response drills. We are focusing on hurdle clearance mechanics
                this week. Monitoring slight inflammation in left Achilles -
                physical therapy sessions scheduled for Tuesday and Thursday."
              </p>
              <div className="flex items-center gap-3 mt-4">
                <div className="flex -space-x-2">
                  <div className="w-7 h-7 rounded-full bg-brand-blue border-2 border-white flex items-center justify-center text-[10px] font-bold text-white z-10">
                    MT
                  </div>
                  <div className="w-7 h-7 rounded-full bg-brand-gold border-2 border-white flex items-center justify-center text-[10px] font-bold text-white z-0">
                    DR
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  Updated 4 hours ago by Head Coach & Physio
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <AthleteProfileModal modal={modal} onClose={closeModal} athlete={athlete} />
    </div>
  );
}

function AthleteProfileModal({ modal, onClose, athlete }) {
  if (!modal) return null;

  const footer = (
    <>
      <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
      <PrimaryButton onClick={onClose}>Save</PrimaryButton>
    </>
  );

  if (modal.type === "status") {
    return (
      <Modal
        open
        onClose={onClose}
        title="Update Athlete Status"
        description={`Adjust clearance and scholarship markers for ${athlete.name}.`}
        footer={footer}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Medical status">
            <SelectInput defaultValue={athlete.status}>
              <option>Cleared</option>
              <option>Injured</option>
              <option>Pending Review</option>
            </SelectInput>
          </Field>
          <Field label="Scholarship">
            <SelectInput defaultValue={athlete.scholarship}>
              <option>Full Scholarship</option>
              <option>Partial Scholarship</option>
              <option>Walk-on</option>
            </SelectInput>
          </Field>
          <div className="sm:col-span-2">
            <Field label="Status note">
              <TextArea placeholder="Summarize why this status is being updated." />
            </Field>
          </div>
        </div>
      </Modal>
    );
  }

  if (modal.type === "report") {
    return (
      <Modal
        open
        onClose={onClose}
        title="Academic Performance Report"
        description="Prepare a detailed report for coaching and compliance review."
        footer={
          <>
            <SecondaryButton onClick={onClose}>Close</SecondaryButton>
            <PrimaryButton onClick={onClose}>Generate report</PrimaryButton>
          </>
        }
      >
        <FeedbackPanel tone="info" title={`${athlete.gpa} GPA currently tracked`}>
          The modal is ready for historical grade, eligibility, and attendance
          data once the backend is connected.
        </FeedbackPanel>
      </Modal>
    );
  }

  if (modal.type === "document") {
    return (
      <Modal
        open
        onClose={onClose}
        title="Add Document"
        description="Register a new file record on the athlete profile."
        footer={footer}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Document name">
            <TextInput placeholder="Medical clearance" />
          </Field>
          <Field label="Document type">
            <SelectInput defaultValue="Medical">
              <option>Medical</option>
              <option>Scholarship</option>
              <option>Identification</option>
              <option>Academic</option>
            </SelectInput>
          </Field>
          <div className="sm:col-span-2">
            <Field label="Notes">
              <TextArea placeholder="Expiration date, verification notes, or owner..." />
            </Field>
          </div>
        </div>
      </Modal>
    );
  }

  if (modal.type === "view-document") {
    return (
      <Modal
        open
        onClose={onClose}
        title={modal.payload}
        description="Document details are shown here until file preview storage is connected."
        footer={<PrimaryButton onClick={onClose}>Done</PrimaryButton>}
      >
        <FeedbackPanel tone="success" title="Verified profile document">
          This placeholder detail view can later include file preview, expiry
          status, download, and audit trail actions.
        </FeedbackPanel>
      </Modal>
    );
  }

  if (modal.type === "issue") {
    return (
      <Modal
        open
        onClose={onClose}
        title="Issue Equipment"
        description={`Assign a new item to ${athlete.name}.`}
        footer={footer}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Asset">
            <TextInput placeholder="Search equipment ID or name" />
          </Field>
          <Field label="Due date">
            <TextInput type="date" />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Issue notes">
              <TextArea placeholder="Fit notes, coach authorization, or return conditions..." />
            </Field>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Equipment Actions"
      description={`Manage ${modal.payload}.`}
      footer={footer}
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <button className="rounded-2xl border border-border-subtle/50 bg-slate-50 p-4 text-left text-[13px] font-bold text-slate-700 hover:border-brand-blue/20 hover:bg-brand-blue-light">
          View details
        </button>
        <button className="rounded-2xl border border-border-subtle/50 bg-slate-50 p-4 text-left text-[13px] font-bold text-slate-700 hover:border-brand-blue/20 hover:bg-brand-blue-light">
          Mark returned
        </button>
        <button className="rounded-2xl border border-red-100 bg-red-50 p-4 text-left text-[13px] font-bold text-red-700 hover:bg-red-100">
          Report issue
        </button>
      </div>
    </Modal>
  );
}
