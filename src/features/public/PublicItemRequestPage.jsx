import { useMemo, useState, useRef } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Boxes,
  CheckCircle2,
  FileText,
  Package,
  QrCode,
  ScanLine,
  Search,
  SearchCheck,
  Send,
  ShoppingBasket,
  Trash2,
} from "lucide-react";
import {
  Field,
  Modal,
  PrimaryButton,
  TextArea,
  TextInput,
} from "../../components/ui/Modal";
import { EmptyState, PublicBadge, PublicHero, PublicPageShell } from "./PublicLayout";
import {
  ActionHint,
  EmptyInline,
  ProgressSteps,
  PublicSection,
  StatusTimeline,
  SummaryRail,
  TrackPrompt,
} from "./PublicShared";
import {
  formatPublicDate,
  getDocumentStatusMeta,
  getRequestStatusMeta,
  makeReference,
  makeTimelineItems,
  mergeStoredRecords,
  saveStoredRecord,
} from "./publicUtils";
import { mockInventoryItems } from "../inventory/inventoryMockData";
import {
  getAvailabilityLabel,
  getConditionTone,
  getStatusTone,
} from "../inventory/inventoryTypes";

const ITEM_REQUESTS_KEY = "adnu-public-item-requests";
const itemSteps = [
  { id: "items", label: "Select Items" },
  { id: "schedule", label: "Borrowing Schedule" },
  { id: "requester", label: "Requester Info" },
  { id: "purpose", label: "Purpose & Details" },
  { id: "documents", label: "Required Docs" },
  { id: "review", label: "Review & Submit" },
];

const emptyItemRequest = {
  requesterName: "",
  organization: "",
  email: "",
  contactNumber: "",
  neededDate: "",
  returnDate: "",
  purpose: "",
  documentsAcknowledged: false,
};

export function PublicItemRequestPage() {
  const items = useMemo(
    () =>
      mockInventoryItems.filter(
        (item) =>
          !item.archived &&
          item.availableQuantity > 0 &&
          !["Lost", "Retired", "Archived", "Damaged", "Under Maintenance"].includes(item.status) &&
          !["Lost", "Damaged", "Retired", "Under Maintenance"].includes(item.condition),
      ),
    [],
  );
  const formSectionRef = useRef(null);
  const [filters, setFilters] = useState({
    search: "",
    category: "All categories",
    availability: "Any availability",
    sport: "All sports",
    condition: "All conditions",
  });
  const [basket, setBasket] = useState([]);
  const [requestOpen, setRequestOpen] = useState(false);
  const [showIntroModal, setShowIntroModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState(emptyItemRequest);
  const [errors, setErrors] = useState({});
  const [confirmation, setConfirmation] = useState(null);
  const [tracking, setTracking] = useState({ reference: "", email: "", result: null, message: "" });
  const [scanner, setScanner] = useState({
    open: false,
    code: "",
    result: null,
    permissionState: "idle",
  });

  const storedRequests = mergeStoredRecords(ITEM_REQUESTS_KEY, normalizeItemRecord);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const haystack = [item.name, item.sku, item.category, item.sport, item.location].join(" ").toLowerCase();
      const matchesSearch = haystack.includes(filters.search.trim().toLowerCase());
      const matchesCategory = filters.category === "All categories" || item.category === filters.category;
      const matchesAvailability =
        filters.availability === "Any availability" || getAvailabilityLabel(item) === filters.availability;
      const matchesSport = filters.sport === "All sports" || item.sport === filters.sport;
      const matchesCondition = filters.condition === "All conditions" || item.condition === filters.condition;
      return matchesSearch && matchesCategory && matchesAvailability && matchesSport && matchesCondition;
    });
  }, [filters, items]);

  const basketItems = basket
    .map((entry) => {
      const item = items.find((candidate) => candidate.id === entry.itemId);
      return item ? { ...entry, item } : null;
    })
    .filter(Boolean);

  const updateForm = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
  };

  const addToBasket = (item, quantity = 1) => {
    setBasket((current) => {
      const existing = current.find((entry) => entry.itemId === item.id);
      if (existing) {
        return current.map((entry) =>
          entry.itemId === item.id
            ? { ...entry, quantity: Math.min(item.availableQuantity, entry.quantity + quantity) }
            : entry,
        );
      }
      return [...current, { itemId: item.id, quantity: Math.min(item.availableQuantity, quantity) }];
    });
  };

  const updateBasketQuantity = (itemId, quantity) => {
    const item = items.find((candidate) => candidate.id === itemId);
    const safeQuantity = Math.max(1, Math.min(item?.availableQuantity ?? 1, Number(quantity) || 1));
    setBasket((current) => current.map((entry) => (entry.itemId === itemId ? { ...entry, quantity: safeQuantity } : entry)));
  };

  const removeFromBasket = (itemId) => {
    setBasket((current) => current.filter((entry) => entry.itemId !== itemId));
  };

  const openRequest = () => {
    setShowIntroModal(true);
  };

  const startFormFlow = () => {
    setShowIntroModal(false);
    setRequestOpen(true);
    setCurrentStep(1);
    setTimeout(() => {
      formSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const goNext = () => {
    const nextErrors = validateItemStep(currentStep, basketItems, form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setCurrentStep((current) => Math.min(current + 1, itemSteps.length));
  };

  const goBack = () => {
    setCurrentStep((current) => Math.max(current - 1, 1));
  };

  const submitRequest = () => {
    const nextErrors = validateFullItemRequest(basketItems, form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    const record = buildItemSubmission(basketItems, form);
    saveStoredRecord(ITEM_REQUESTS_KEY, record, normalizeItemRecord);
    setConfirmation(record);
    setTracking({ reference: record.reference, email: record.email, result: record, message: "" });
    setBasket([]);
    setForm(emptyItemRequest);
    setRequestOpen(false);
    setCurrentStep(1);
  };

  const trackRequest = (event) => {
    event.preventDefault();
    const reference = tracking.reference.trim().toUpperCase();
    const email = tracking.email.trim().toLowerCase();
    const result = storedRequests.find(
      (record) => record.reference === reference && record.email.toLowerCase() === email,
    );
    setTracking((current) => ({
      ...current,
      reference,
      result: result ?? null,
      message: result ? "" : "No matching public item request was found.",
    }));
  };

  const simulateScan = () => {
    const match =
      items.find((item) => item.sku.toLowerCase() === scanner.code.trim().toLowerCase()) ??
      items.find((item) => item.id.toLowerCase() === scanner.code.trim().toLowerCase()) ??
      filteredItems[0] ??
      items[0];

    setScanner((current) => ({
      ...current,
      permissionState: "granted",
      result: match ?? null,
    }));
  };

  return (
    <PublicPageShell compact>
      <main className="pb-16">
        {showIntroModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-[28px] border border-white bg-white shadow-2xl">
              <div className="space-y-6 p-8">
                <div>
                  <h2 className="text-2xl font-black text-slate-950">Start Your Borrowing Request</h2>
                  <p className="mt-3 text-[14px] leading-7 text-slate-600">
                    You have <span className="font-bold">{basketItems.length} {basketItems.length === 1 ? "item" : "items"}</span> ready to borrow
                  </p>
                </div>

                <div className="space-y-3 rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 h-5 w-5 flex-shrink-0 rounded-full bg-brand-blue/20 flex items-center justify-center">
                      <span className="text-[12px] font-bold text-brand-blue">1</span>
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-slate-900">Set your dates</p>
                      <p className="mt-1 text-[12px] text-slate-600">When you need and will return items</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 h-5 w-5 flex-shrink-0 rounded-full bg-brand-blue/20 flex items-center justify-center">
                      <span className="text-[12px] font-bold text-brand-blue">2</span>
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-slate-900">Enter your details</p>
                      <p className="mt-1 text-[12px] text-slate-600">Contact info and organization</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 h-5 w-5 flex-shrink-0 rounded-full bg-brand-blue/20 flex items-center justify-center">
                      <span className="text-[12px] font-bold text-brand-blue">3</span>
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-slate-900">Submit for approval</p>
                      <p className="mt-1 text-[12px] text-slate-600">Get a reference code to track your request</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => setShowIntroModal(false)}
                    className="flex-1 rounded-full border border-border-subtle bg-white px-4 py-3 text-[12px] font-bold text-slate-700 shadow-soft hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={startFormFlow}
                    className="flex-1 rounded-full bg-brand-blue px-4 py-3 text-[12px] font-bold text-white shadow-soft hover:bg-brand-blue-hover"
                  >
                    Start Request
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <PublicHero
          eyebrow="Item and equipment request"
          title="Browse, scan, and collect items before you open the borrowing form."
          description="Public users can build a request basket first, scan an item QR code if they have one, and only then move into a guided borrowing request."
          icon={Boxes}
          actions={<TrackPrompt />}
        />

        <section className="mt-10 space-y-6">
          <TrackingPanel tracking={tracking} setTracking={setTracking} onSubmit={trackRequest} />

          <PublicSection
            title="Browse requestable items"
            description="Search and filter before adding items to your request basket."
            icon={Package}
            action={
              <button
                type="button"
                onClick={() => setScanner({ open: true, code: "", result: null, permissionState: "idle" })}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border-subtle bg-white px-4 py-2.5 text-[12px] font-bold text-slate-700 shadow-soft hover:bg-slate-50"
              >
                <ScanLine className="h-4 w-4" />
                Scan Item QR
              </button>
            }
          >
            <div className="grid gap-3 lg:grid-cols-[1fr_repeat(4,minmax(0,180px))]">
              <label className="relative">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={filters.search}
                  onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
                  placeholder="Search item name or code"
                  className="w-full rounded-full border border-border-subtle bg-slate-50 py-3 pl-11 pr-4 text-[13px] font-medium text-slate-700 outline-none"
                />
              </label>
              <FilterSelect value={filters.category} onChange={(value) => setFilters((current) => ({ ...current, category: value }))}>
                <option>All categories</option>
                {Array.from(new Set(items.map((item) => item.category))).map((item) => <option key={item}>{item}</option>)}
              </FilterSelect>
              <FilterSelect value={filters.availability} onChange={(value) => setFilters((current) => ({ ...current, availability: value }))}>
                <option>Any availability</option>
                <option>Available</option>
                <option>Partially available</option>
                <option>Fully assigned</option>
              </FilterSelect>
              <FilterSelect value={filters.sport} onChange={(value) => setFilters((current) => ({ ...current, sport: value }))}>
                <option>All sports</option>
                {Array.from(new Set(items.map((item) => item.sport))).map((item) => <option key={item}>{item}</option>)}
              </FilterSelect>
              <FilterSelect value={filters.condition} onChange={(value) => setFilters((current) => ({ ...current, condition: value }))}>
                <option>All conditions</option>
                {Array.from(new Set(items.map((item) => item.condition))).map((item) => <option key={item}>{item}</option>)}
              </FilterSelect>
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_360px]">
              <div className="space-y-4">
                {filteredItems.length ? (
                  filteredItems.map((item) => (
                    <ItemBrowserCard
                      key={item.id}
                      item={item}
                      onAdd={() => addToBasket(item)}
                    />
                  ))
                ) : (
                  <EmptyState
                    icon={Package}
                    title="No requestable items"
                    description="Try another filter. Only public-safe, currently borrowable items appear here."
                  />
                )}
              </div>

              <SummaryRail
                title="Request basket"
                icon={ShoppingBasket}
                items={[
                  { label: "Selected items", value: String(basketItems.length) },
                  { label: "Total quantity", value: String(basketItems.reduce((sum, entry) => sum + entry.quantity, 0)) },
                  { label: "Borrow date", value: form.neededDate || "Add in step 2" },
                  { label: "Return date", value: form.returnDate || "Add in step 2" },
                ]}
                footer={
                  <div className="space-y-3">
                    {basketItems.length ? (
                      <div className="space-y-2">
                        {basketItems.map((entry) => (
                          <div key={entry.item.id} className="rounded-2xl bg-white px-4 py-3 shadow-soft">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-[13px] font-black text-slate-900">{entry.item.name}</p>
                                <p className="mt-1 text-[12px] text-slate-500">{entry.item.category}</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeFromBasket(entry.item.id)}
                                className="rounded-full p-2 text-slate-400 hover:bg-slate-50 hover:text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                            <div className="mt-3 flex items-center gap-2">
                              <span className="text-[12px] font-bold text-slate-500">Qty</span>
                              <input
                                type="number"
                                min="1"
                                max={entry.item.availableQuantity}
                                value={entry.quantity}
                                onChange={(event) => updateBasketQuantity(entry.item.id, event.target.value)}
                                className="w-20 rounded-xl border border-border-subtle bg-slate-50 px-3 py-2 text-[12px] font-bold text-slate-700"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <EmptyInline
                        title="No items selected yet"
                        description="Add items from the list or from the QR scanner to start your request."
                        icon={ShoppingBasket}
                      />
                    )}
                    <button
                      type="button"
                      onClick={openRequest}
                      disabled={!basketItems.length}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-blue px-4 py-3 text-[12px] font-bold text-white shadow-soft hover:bg-brand-blue-hover disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <ShoppingBasket className="h-4 w-4" />
                      Continue to Request
                    </button>
                  </div>
                }
              />
            </div>
          </PublicSection>

          {requestOpen ? (
            <section ref={formSectionRef} className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_320px]">
              <PublicSection
                title="Borrowing request flow"
                description="Each step confirms one piece of the request before submission."
                icon={Boxes}
              >
                <ProgressSteps steps={itemSteps} currentStep={currentStep} />
                <div className="mt-6">
                  <ItemStepContent
                    currentStep={currentStep}
                    basketItems={basketItems}
                    form={form}
                    errors={errors}
                    updateForm={updateForm}
                  />
                </div>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      if (currentStep === 1) {
                        setRequestOpen(false);
                        return;
                      }
                      goBack();
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-border-subtle bg-white px-4 py-3 text-[12px] font-bold text-slate-700 shadow-soft hover:bg-slate-50"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    {currentStep === 1 ? "Close" : "Back"}
                  </button>
                  {currentStep < itemSteps.length ? (
                    <PrimaryButton type="button" onClick={goNext} className="px-6 py-3">
                      Next
                      <ArrowRight className="h-4 w-4" />
                    </PrimaryButton>
                  ) : (
                    <PrimaryButton type="button" onClick={submitRequest} className="px-6 py-3">
                      Submit Request
                      <Send className="h-4 w-4" />
                    </PrimaryButton>
                  )}
                </div>
              </PublicSection>

              <SummaryRail
                title="Borrowing summary"
                icon={FileText}
                items={[
                  { label: "Items", value: basketItems.map((entry) => entry.item.name).join(", ") || "Select items" },
                  { label: "Borrow date", value: form.neededDate || "Pending" },
                  { label: "Return date", value: form.returnDate || "Pending" },
                  { label: "Requester", value: form.requesterName || "Pending" },
                ]}
              />
            </section>
          ) : null}

          {confirmation ? (
            <PublicSection
              title="Request submitted"
              description="Keep this reference number to track pickup and return updates."
              icon={CheckCircle2}
            >
              <div className="rounded-[24px] border border-green-100 bg-green-50/70 p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <PublicBadge className="bg-white text-green-700">{confirmation.reference}</PublicBadge>
                  <PublicBadge className="bg-white text-brand-blue">{confirmation.status}</PublicBadge>
                  <PublicBadge className="bg-white text-amber-700">{confirmation.documentStatus}</PublicBadge>
                </div>
                <p className="mt-3 text-[14px] leading-7 text-slate-700">
                  {confirmation.itemsSummary} requested for {formatPublicDate(confirmation.neededDate)}.
                </p>
              </div>
            </PublicSection>
          ) : null}
        </section>

        <ScannerModal
          scanner={scanner}
          setScanner={setScanner}
          onSimulateScan={simulateScan}
          onAddScannedItem={(item) => {
            addToBasket(item);
            setScanner({ open: false, code: "", result: null, permissionState: "idle" });
          }}
        />
      </main>
    </PublicPageShell>
  );
}

function ItemBrowserCard({ item, onAdd }) {
  return (
    <article className="overflow-hidden rounded-[28px] border border-white/75 bg-white/90 shadow-soft backdrop-blur sm:grid sm:grid-cols-[180px_1fr]">
      <img src={item.imageUrl} alt="" className="h-52 w-full object-cover sm:h-full" />
      <div className="p-6">
        <div className="flex flex-wrap items-center gap-2">
          <PublicBadge className={getStatusTone(item.status)}>{getAvailabilityLabel(item)}</PublicBadge>
          <PublicBadge className={getConditionTone(item.condition)}>{item.condition}</PublicBadge>
          <PublicBadge className="bg-brand-blue-light text-brand-blue">{item.sport}</PublicBadge>
        </div>
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-950">{item.name}</h2>
            <p className="mt-3 text-[14px] leading-7 text-slate-600">{item.description}</p>
          </div>
          <button
            type="button"
            onClick={onAdd}
            className="inline-flex items-center justify-center rounded-full bg-brand-blue px-4 py-2.5 text-[12px] font-bold text-white shadow-soft hover:bg-brand-blue-hover"
          >
            Add to Request
          </button>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-4">
          <InfoTile label="Available" value={`${item.availableQuantity} of ${item.totalQuantity}`} />
          <InfoTile label="Category" value={item.category} />
          <InfoTile label="Pickup area" value={item.location} />
          <InfoTile label="Rules" value="Valid ID required" />
        </div>
      </div>
    </article>
  );
}

function TrackingPanel({ tracking, setTracking, onSubmit }) {
  return (
    <PublicSection
      title="Track an existing item request"
      description="Use your reference code and email to check status and pickup or return instructions."
      icon={SearchCheck}
    >
      <form className="grid gap-3 lg:grid-cols-[1fr_1fr_auto]" onSubmit={onSubmit}>
        <TextInput
          value={tracking.reference}
          onChange={(event) => setTracking((current) => ({ ...current, reference: event.target.value, message: "" }))}
          placeholder="ITM-ABC123"
        />
        <TextInput
          type="email"
          value={tracking.email}
          onChange={(event) => setTracking((current) => ({ ...current, email: event.target.value, message: "" }))}
          placeholder="email@example.com"
        />
        <PrimaryButton type="submit" className="px-5 py-3">
          Track Request
        </PrimaryButton>
      </form>

      {tracking.message ? (
        <div className="mt-5">
          <EmptyState icon={FileText} title="Request not found" description={tracking.message} />
        </div>
      ) : null}

      {tracking.result ? (
        <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="rounded-[24px] border border-brand-blue/10 bg-brand-blue-light/50 p-5">
            <div className="flex flex-wrap items-center gap-2">
              <PublicBadge className="bg-white text-brand-blue">{tracking.result.reference}</PublicBadge>
              <PublicBadge className={getRequestStatusMeta(tracking.result.status)}>{tracking.result.status}</PublicBadge>
              <PublicBadge className={getDocumentStatusMeta(tracking.result.documentStatus)}>{tracking.result.documentStatus}</PublicBadge>
            </div>
            <p className="mt-4 text-[14px] font-black text-slate-950">{tracking.result.itemsSummary}</p>
            <p className="mt-2 text-[13px] leading-6 text-slate-600">
              {formatPublicDate(tracking.result.neededDate)} to {formatPublicDate(tracking.result.returnDate)}
            </p>
            <div className="mt-4 rounded-2xl bg-white px-4 py-3 shadow-soft">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Pickup and return</p>
              <p className="mt-1 text-[13px] leading-6 text-slate-700">{tracking.result.nextSteps}</p>
            </div>
            {tracking.result.missingDocuments?.length ? (
              <div className="mt-4 rounded-2xl bg-white px-4 py-3 shadow-soft">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Missing documents</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {tracking.result.missingDocuments.map((document) => (
                    <span key={document} className="rounded-full bg-amber-50 px-3 py-1.5 text-[11px] font-bold text-amber-700">
                      {document}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
          <StatusTimeline title="Borrowing timeline" items={makeTimelineItems(tracking.result.activityLog)} />
        </div>
      ) : null}
    </PublicSection>
  );
}

function ScannerModal({ scanner, setScanner, onSimulateScan, onAddScannedItem }) {
  return (
    <Modal
      open={scanner.open}
      onClose={() => setScanner({ open: false, code: "", result: null, permissionState: "idle" })}
      title="Scan item QR"
      description="Use the camera when available, or enter the item code manually."
      footer={
        <>
          <button
            type="button"
            onClick={() => setScanner({ open: false, code: "", result: null, permissionState: "idle" })}
            className="inline-flex items-center justify-center rounded-full border border-border-subtle bg-white px-4 py-2.5 text-[12px] font-bold text-slate-700 shadow-soft hover:bg-slate-50"
          >
            Cancel
          </button>
          <PrimaryButton type="button" onClick={onSimulateScan}>
            Simulate Scan
          </PrimaryButton>
        </>
      }
    >
      <div className="space-y-5">
        <div className="rounded-[24px] border border-border-subtle bg-slate-950 p-6 text-white">
          <div className="mx-auto flex h-60 w-full max-w-sm items-center justify-center rounded-[22px] border border-dashed border-white/30 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.16),rgba(15,23,42,0.7))]">
            <div className="scanner-frame flex h-40 w-40 items-center justify-center rounded-[28px] border border-brand-blue/60">
              <QrCode className="h-12 w-12 text-white/80" />
            </div>
          </div>
          <p className="mt-4 text-center text-[13px] leading-6 text-white/75">
            Camera access can be connected later. For now, this public flow simulates a scan and previews the matched item before adding it to the basket.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <TextInput
            value={scanner.code}
            onChange={(event) => setScanner((current) => ({ ...current, code: event.target.value, result: null }))}
            placeholder="Enter item code manually"
          />
          <button
            type="button"
            onClick={() => setScanner((current) => ({ ...current, permissionState: "granted" }))}
            className="inline-flex items-center justify-center rounded-full border border-border-subtle bg-white px-4 py-2.5 text-[12px] font-bold text-slate-700 shadow-soft hover:bg-slate-50"
          >
            Use Camera UI
          </button>
        </div>

        {scanner.permissionState === "granted" ? (
          <ActionHint icon={ScanLine}>Camera frame ready. Use Simulate Scan to test the flow.</ActionHint>
        ) : null}

        {scanner.result ? (
          <div className="rounded-[22px] border border-green-100 bg-green-50/70 p-4">
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-green-700">Scan success</p>
            <p className="mt-2 text-[15px] font-black text-slate-950">{scanner.result.name}</p>
            <p className="mt-1 text-[12px] leading-6 text-slate-600">
              {scanner.result.sku} | {scanner.result.category} | {scanner.result.availableQuantity} available
            </p>
            <button
              type="button"
              onClick={() => onAddScannedItem(scanner.result)}
              className="mt-4 inline-flex items-center justify-center rounded-full bg-brand-blue px-4 py-2.5 text-[12px] font-bold text-white shadow-soft hover:bg-brand-blue-hover"
            >
              Add scanned item to basket
            </button>
          </div>
        ) : null}
      </div>
    </Modal>
  );
}

function ItemStepContent({ currentStep, basketItems, form, errors, updateForm }) {
  if (currentStep === 1) {
    return basketItems.length ? (
      <div className="space-y-3">
        <ActionHint>{basketItems.length} item{basketItems.length === 1 ? "" : "s"} selected for this request.</ActionHint>
        {basketItems.map((entry) => (
          <div key={entry.item.id} className="rounded-2xl border border-border-subtle bg-white px-4 py-3">
            <p className="text-[14px] font-black text-slate-950">{entry.item.name}</p>
            <p className="mt-1 text-[12px] text-slate-500">Quantity requested: {entry.quantity}</p>
          </div>
        ))}
      </div>
    ) : (
      <EmptyInline title="Select at least one item" description="Add items from the browser or scanner before continuing." icon={ShoppingBasket} />
    );
  }

  if (currentStep === 2) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Borrow date" error={errors.neededDate}>
          <TextInput type="date" value={form.neededDate} onChange={(event) => updateForm("neededDate", event.target.value)} />
        </Field>
        <Field label="Return date" error={errors.returnDate}>
          <TextInput type="date" value={form.returnDate} onChange={(event) => updateForm("returnDate", event.target.value)} />
        </Field>
      </div>
    );
  }

  if (currentStep === 3) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Requester name" error={errors.requesterName}>
          <TextInput value={form.requesterName} onChange={(event) => updateForm("requesterName", event.target.value)} placeholder="Juan Dela Cruz" />
        </Field>
        <Field label="Organization" error={errors.organization}>
          <TextInput value={form.organization} onChange={(event) => updateForm("organization", event.target.value)} placeholder="School, club, or office" />
        </Field>
        <Field label="Email" error={errors.email}>
          <TextInput type="email" value={form.email} onChange={(event) => updateForm("email", event.target.value)} placeholder="requester@example.com" />
        </Field>
        <Field label="Contact number" error={errors.contactNumber}>
          <TextInput value={form.contactNumber} onChange={(event) => updateForm("contactNumber", event.target.value)} placeholder="+63 917 000 0000" />
        </Field>
      </div>
    );
  }

  if (currentStep === 4) {
    return (
      <Field label="Purpose" error={errors.purpose}>
        <TextArea value={form.purpose} onChange={(event) => updateForm("purpose", event.target.value)} placeholder="Describe where and why the item will be used." />
      </Field>
    );
  }

  if (currentStep === 5) {
    return (
      <div className="rounded-[24px] border border-border-subtle bg-slate-50/80 p-5">
        <h3 className="text-[15px] font-black text-slate-950">Borrowing requirements</h3>
        <p className="mt-3 text-[13px] leading-6 text-slate-600">
          Bring a valid ID and any endorsement or waiver requested by the equipment office before pickup.
        </p>
        <label className="mt-5 flex items-start gap-3 text-[13px] font-medium leading-6 text-slate-600">
          <input
            type="checkbox"
            checked={form.documentsAcknowledged}
            onChange={(event) => updateForm("documentsAcknowledged", event.target.checked)}
            className="mt-1 h-4 w-4 rounded border-border-subtle accent-brand-blue"
          />
          I understand that items are released only after approval and document checks.
        </label>
        {errors.documentsAcknowledged ? <p className="mt-2 text-[11px] text-red-600">{errors.documentsAcknowledged}</p> : null}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <StepCard title="Items" body={basketItems.map((entry) => `${entry.quantity} x ${entry.item.name}`).join(", ")} />
      <StepCard title="Borrowing period" body={`${form.neededDate || "Pending"} to ${form.returnDate || "Pending"}`} />
      <StepCard title="Requester" body={form.requesterName || "Pending"} />
      <StepCard title="Organization" body={form.organization || "Pending"} />
      <StepCard title="Purpose" body={form.purpose || "Pending"} />
      <StepCard title="Documents" body={form.documentsAcknowledged ? "Acknowledged" : "Needs confirmation"} />
    </div>
  );
}

function StepCard({ title, body }) {
  return (
    <div className="rounded-2xl border border-border-subtle bg-white px-4 py-3">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">{title}</p>
      <p className="mt-1 text-[13px] leading-6 text-slate-700">{body}</p>
    </div>
  );
}

function InfoTile({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 px-4 py-3">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-1 text-[13px] font-bold leading-5 text-slate-700">{value}</p>
    </div>
  );
}

function FilterSelect({ value, onChange, children }) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full appearance-none rounded-full border border-border-subtle bg-slate-50 px-4 py-3 text-[13px] font-bold text-slate-600 outline-none"
    >
      {children}
    </select>
  );
}

function validateItemStep(step, basketItems, form) {
  const errors = {};
  if (step === 1 && !basketItems.length) {
    errors.items = "Select at least one item.";
  }
  if (step === 2) {
    if (!form.neededDate) errors.neededDate = "Choose a borrow date.";
    if (!form.returnDate) errors.returnDate = "Choose a return date.";
    if (form.neededDate && form.returnDate && form.returnDate < form.neededDate) {
      errors.returnDate = "Return date must be after the borrow date.";
    }
  }
  if (step === 3) {
    ["requesterName", "organization", "email", "contactNumber"].forEach((field) => {
      if (!String(form[field] ?? "").trim()) errors[field] = "This field is required.";
    });
  }
  if (step === 4 && !String(form.purpose ?? "").trim()) {
    errors.purpose = "Purpose is required.";
  }
  if (step === 5 && !form.documentsAcknowledged) {
    errors.documentsAcknowledged = "Confirm the borrowing requirements.";
  }
  return errors;
}

function validateFullItemRequest(basketItems, form) {
  return {
    ...validateItemStep(1, basketItems, form),
    ...validateItemStep(2, basketItems, form),
    ...validateItemStep(3, basketItems, form),
    ...validateItemStep(4, basketItems, form),
    ...validateItemStep(5, basketItems, form),
  };
}

function buildItemSubmission(basketItems, form) {
  const reference = makeReference("ITM");
  return {
    reference,
    requesterName: form.requesterName.trim(),
    organization: form.organization.trim(),
    email: form.email.trim(),
    contactNumber: form.contactNumber.trim(),
    items: basketItems.map((entry) => ({
      itemId: entry.item.id,
      itemName: entry.item.name,
      quantity: entry.quantity,
      category: entry.item.category,
      sport: entry.item.sport,
    })),
    itemsSummary: basketItems.map((entry) => `${entry.quantity} x ${entry.item.name}`).join(", "),
    neededDate: form.neededDate,
    returnDate: form.returnDate,
    purpose: form.purpose.trim(),
    status: "Pending Review",
    documentStatus: "Documents Needed",
    missingDocuments: ["Valid ID", "Any endorsement requested by the equipment office"],
    nextSteps: "Wait for pickup instructions from the equipment office and bring the required documents on release day.",
    activityLog: [
      `${formatPublicDate(form.neededDate)} - Borrowing request submitted`,
      `${formatPublicDate(form.neededDate)} - Waiting for equipment office review`,
    ],
    submittedAt: new Date().toISOString(),
  };
}

function normalizeItemRecord(record) {
  const items = record.items ?? (record.itemName ? [{ itemName: record.itemName, quantity: record.quantity ?? 1, category: record.category, sport: record.sport }] : []);
  return {
    ...record,
    reference: record.reference ?? record.id ?? makeReference("ITM"),
    items,
    itemsSummary:
      record.itemsSummary ??
      items.map((entry) => `${entry.quantity} x ${entry.itemName}`).join(", "),
    status: record.status ?? "Pending Review",
    documentStatus: record.documentStatus ?? "Documents Needed",
    missingDocuments: record.missingDocuments ?? ["Valid ID"],
    nextSteps:
      record.nextSteps ??
      "Wait for pickup instructions from the equipment office and bring the required documents on release day.",
    activityLog: record.activityLog ?? [`${formatPublicDate(record.neededDate || new Date().toISOString().slice(0, 10))} - Borrowing request submitted`],
  };
}
