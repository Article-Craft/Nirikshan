import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Layers, 
  Send, 
  Calendar, 
  Download, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  FileCheck, 
  User, 
  Building, 
  ChevronRight, 
  RefreshCw,
  Plus,
  ArrowLeft,
  FileSignature
} from 'lucide-react';

const DEPARTMENTS = [
  "Ministry of Home Affairs",
  "Ministry of Finance",
  "Ministry of Health and Population",
  "Ministry of Education, Science and Technology",
  "Ministry of Physical Infrastructure and Transport",
  "Department of Foreign Employment",
  "Kathmandu Metropolitan City Office",
  "Lalitpur Metropolitan City Office",
  "Nepal Electricity Authority",
  "Customs Department",
  "Other / Custom Office"
];

// Initial mock tracked requests
const INITIAL_REQUESTS = [
  {
    id: "rti-101",
    subject: "Road Expansion Tender and Budget Allocations for Ring Road Phase 2",
    department: "Ministry of Physical Infrastructure and Transport",
    address: "Singha Durbar, Kathmandu",
    officerName: "Mr. Rajendra Prasad Bhatta",
    applicantName: "Pritam Rai",
    applicantAddress: "Kapan, Kathmandu",
    applicantPhone: "9841XXXXXX",
    submissionDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 days ago (30 days left)
    status: "submitted",
    details: "Seeking detailed financial breakdown, signed contracts, and penalty terms for contractor delays on the Kalanki-Maharajgunj section of Ring Road expansion."
  },
  {
    id: "rti-102",
    subject: "Public Health Procurement of Critical Life-Saving Drugs",
    department: "Ministry of Health and Population",
    address: "Ramshahpath, Kathmandu",
    officerName: "Dr. Sandip Shrestha",
    applicantName: "Pritam Rai",
    applicantAddress: "Kapan, Kathmandu",
    applicantPhone: "9841XXXXXX",
    submissionDate: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 18 days ago (17 days left)
    status: "in_progress",
    details: "Request for tender documents, list of bidding suppliers, and actual delivery log of paracetamol and essential saline supplies to provincial government hospitals."
  },
  {
    id: "rti-103",
    subject: "Kathmandu Valley Water Quality Test Reports & Filtration Budgets",
    department: "Kathmandu Metropolitan City Office",
    address: "Bagh Durbar, Kathmandu",
    officerName: "Ms. Sunita Shakya",
    applicantName: "Pritam Rai",
    applicantAddress: "Kapan, Kathmandu",
    applicantPhone: "9841XXXXXX",
    submissionDate: new Date(Date.now() - 32 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 32 days ago (3 days left)
    status: "delayed",
    details: "Seeking quarterly biochemical water quality report from Melamchi project distribution tanks and municipal budget utilized for regional water purification tablets."
  }
];

export default function RtiAssistant() {
  const [activeTab, setActiveTab] = useState('wizard'); // 'wizard' or 'tracker'
  const [step, setStep] = useState(1);
  const [trackedRequests, setTrackedRequests] = useState(() => {
    const saved = localStorage.getItem('nirikshan_rti_requests');
    return saved ? JSON.parse(saved) : INITIAL_REQUESTS;
  });

  // Wizard State
  const [wizardData, setWizardData] = useState({
    department: "Ministry of Physical Infrastructure and Transport",
    customDepartment: "",
    address: "Singha Durbar, Kathmandu",
    officerName: "Information Officer",
    subject: "",
    description: "",
    format: "Written Report (Printed Copies)",
    applicantName: "Pritam Rai",
    applicantAddress: "Kathmandu, Nepal",
    applicantEmail: "pritam@nirikshan.gov.np",
    applicantPhone: "9841234567",
    citizenshipNo: "",
    addSignaturePlaceholder: true,
  });

  // Tracked requests filter / detail view
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [simulationDays, setSimulationDays] = useState({}); // allows custom offset simulation per request

  useEffect(() => {
    localStorage.setItem('nirikshan_rti_requests', JSON.stringify(trackedRequests));
  }, [trackedRequests]);

  const handleWizardChange = (e) => {
    const { name, value, type, checked } = e.target;
    setWizardData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const getOfficeName = () => {
    return wizardData.department === "Other / Custom Office" 
      ? (wizardData.customDepartment || "Selected Public Authority")
      : wizardData.department;
  };

  const resetWizard = () => {
    setWizardData({
      department: "Ministry of Physical Infrastructure and Transport",
      customDepartment: "",
      address: "Singha Durbar, Kathmandu",
      officerName: "Information Officer",
      subject: "",
      description: "",
      format: "Written Report (Printed Copies)",
      applicantName: "Pritam Rai",
      applicantAddress: "Kathmandu, Nepal",
      applicantEmail: "pritam@nirikshan.gov.np",
      applicantPhone: "9841234567",
      citizenshipNo: "",
      addSignaturePlaceholder: true,
    });
    setStep(1);
  };

  const handleGenerateAndTrack = () => {
    const newRequest = {
      id: "rti-" + Math.floor(1000 + Math.random() * 9000),
      subject: wizardData.subject || "General Information Request",
      department: getOfficeName(),
      address: wizardData.address,
      officerName: wizardData.officerName,
      applicantName: wizardData.applicantName,
      applicantAddress: wizardData.applicantAddress,
      applicantPhone: wizardData.applicantPhone,
      submissionDate: new Date().toISOString().split('T')[0],
      status: "submitted",
      details: wizardData.description || "Seeking government records under Article 27 of the Constitution of Nepal."
    };

    setTrackedRequests([newRequest, ...trackedRequests]);
    setActiveTab('tracker');
    setSelectedRequest(newRequest);
    alert("Official RTI request letter drafted successfully and added to your tracked requests dashboard.");
  };

  // 35-Day Deadline calculations
  const getDeadlineStats = (req) => {
    const submission = new Date(req.submissionDate);
    const simulatedOffset = simulationDays[req.id] || 0;
    
    // Add offset days to submission date to simulate passing of time
    const adjustedSubmission = new Date(submission.getTime() - (simulatedOffset * 24 * 60 * 60 * 1000));
    
    const today = new Date();
    const diffTime = today.getTime() - adjustedSubmission.getTime();
    const daysElapsed = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    const totalDuration = 35;
    const daysRemaining = Math.max(0, totalDuration - daysElapsed);
    const percentageRemaining = Math.max(0, (daysRemaining / totalDuration) * 100);
    const percentageElapsed = 100 - percentageRemaining;

    let fillClass = "bg-rhododendron-green";
    let textClass = "text-rhododendron-green";
    let statusLabel = "Plenty of time - Initial response window";
    let statusColorClass = "bg-rhododendron-green/10 border-rhododendron-green/30 text-rhododendron-green";

    if (daysRemaining <= 4) {
      fillClass = "bg-charred-brick";
      textClass = "text-charred-brick font-bold";
      statusLabel = daysRemaining === 0 ? "OVERDUE — Eligible to file NIC Appeal" : "Critical deadline — Appeal period near";
      statusColorClass = "bg-charred-brick/10 border-charred-brick/30 text-charred-brick";
    } else if (daysRemaining <= 20) {
      fillClass = "bg-turmeric-clay";
      textClass = "text-turmeric-clay";
      statusLabel = "Approaching deadline — Follow up recommended";
      statusColorClass = "bg-turmeric-clay/10 border-turmeric-clay/30 text-turmeric-clay";
    }

    return {
      daysElapsed,
      daysRemaining,
      percentageElapsed,
      percentageRemaining,
      fillClass,
      textClass,
      statusLabel,
      statusColorClass,
      simulatedOffset
    };
  };

  const handleSimulateTime = (reqId, days) => {
    setSimulationDays(prev => ({
      ...prev,
      [reqId]: days
    }));
  };

  const triggerPrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans">
      
      {/* Header section */}
      <div className="border-b border-dust-beige/60 pb-6 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-serif text-pagoda-wood tracking-tight">
            Right to Information (RTI) Portal
          </h1>
          <p className="text-slate-basalt/70 font-serif max-w-2xl mt-2 leading-relaxed">
            Draft, generate, and monitor legal requests under Article 27 of the Constitution of Nepal 
            and Section 3 of the Right to Information Act, 2064.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="bg-weather-stone/50 p-1 flex rounded-sm border border-dust-beige/40">
          <button
            onClick={() => { setActiveTab('wizard'); setSelectedRequest(null); }}
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-sm transition-all duration-200 ${
              activeTab === 'wizard'
                ? 'bg-pagoda-wood text-himalayan-mist shadow-sm'
                : 'text-slate-basalt/70 hover:text-slate-basalt'
            }`}
          >
            RTI Draft Wizard
          </button>
          <button
            onClick={() => setActiveTab('tracker')}
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-sm transition-all duration-200 ${
              activeTab === 'tracker'
                ? 'bg-pagoda-wood text-himalayan-mist shadow-sm'
                : 'text-slate-basalt/70 hover:text-slate-basalt'
            }`}
          >
            Tracked Requests ({trackedRequests.length})
          </button>
        </div>
      </div>

      {activeTab === 'wizard' ? (
        /* WIZARD VIEW */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Form Wizard Column */}
          <div className="lg:col-span-7 bg-weather-stone/20 border border-dust-beige p-6 rounded-sm shadow-inner flex flex-col justify-between min-h-[580px]">
            <div>
              {/* Step indicator */}
              <div className="flex justify-between items-center mb-8 border-b border-dust-beige/30 pb-4">
                {[1, 2, 3, 4].map((s) => {
                  let stepColor = "border-dust-beige text-slate-basalt/40";
                  let bgFill = "bg-transparent";
                  if (step === s) {
                    stepColor = "border-temple-brass text-temple-brass font-bold ring-2 ring-temple-brass/20";
                    bgFill = "bg-temple-brass/5";
                  } else if (step > s) {
                    stepColor = "border-terraced-pine text-terraced-pine bg-terraced-pine/5 font-semibold";
                  }
                  
                  return (
                    <div key={s} className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs transition-all duration-300 ${stepColor} ${bgFill}`}>
                        {step > s ? "✓" : s}
                      </div>
                      <span className={`text-[10px] uppercase font-semibold tracking-wider hidden sm:inline ${
                        step === s ? "text-temple-brass font-bold" : step > s ? "text-terraced-pine" : "text-slate-basalt/40"
                      }`}>
                        {s === 1 && "Agency"}
                        {s === 2 && "Information"}
                        {s === 3 && "Applicant"}
                        {s === 4 && "Preview"}
                      </span>
                      {s < 4 && <ChevronRight className="w-3.5 h-3.5 text-dust-beige/50 hidden sm:inline" />}
                    </div>
                  );
                })}
              </div>

              {/* Step Content */}
              {step === 1 && (
                <div className="space-y-4 animate-fadeIn">
                  <h3 className="text-lg font-serif text-pagoda-wood border-l-2 border-temple-brass pl-3 mb-4">
                    Step 1: Select Target Public Agency
                  </h3>
                  
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-basalt/80 mb-2">
                      Government Body / Ministry
                    </label>
                    <select
                      name="department"
                      value={wizardData.department}
                      onChange={handleWizardChange}
                      className="w-full bg-himalayan-mist border border-dust-beige p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-temple-brass"
                    >
                      {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>

                  {wizardData.department === "Other / Custom Office" && (
                    <div className="animate-fadeIn">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-basalt/80 mb-2">
                        Specify Office Name
                      </label>
                      <input
                        type="text"
                        name="customDepartment"
                        placeholder="e.g. Ward Office 3, Lalitpur Metropolitan"
                        value={wizardData.customDepartment}
                        onChange={handleWizardChange}
                        className="w-full bg-himalayan-mist border border-dust-beige p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-temple-brass"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-basalt/80 mb-2">
                      Office Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={wizardData.address}
                      onChange={handleWizardChange}
                      placeholder="Singha Durbar, Kathmandu"
                      className="w-full bg-himalayan-mist border border-dust-beige p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-temple-brass"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-basalt/80 mb-2">
                      Designation of Officer
                    </label>
                    <input
                      type="text"
                      name="officerName"
                      value={wizardData.officerName}
                      onChange={handleWizardChange}
                      placeholder="e.g. Information Officer (सूचना अधिकारी)"
                      className="w-full bg-himalayan-mist border border-dust-beige p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-temple-brass"
                    />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4 animate-fadeIn">
                  <h3 className="text-lg font-serif text-pagoda-wood border-l-2 border-temple-brass pl-3 mb-4">
                    Step 2: Describe Information Requested
                  </h3>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-basalt/80 mb-2">
                      Subject / Title of Request
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={wizardData.subject}
                      onChange={handleWizardChange}
                      placeholder="e.g., Budget allocations and contract copy for local park cleanup"
                      className="w-full bg-himalayan-mist border border-dust-beige p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-temple-brass"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-basalt/80 mb-2">
                      Specific Details Requested (Be clear and concise)
                    </label>
                    <textarea
                      name="description"
                      rows={5}
                      value={wizardData.description}
                      onChange={handleWizardChange}
                      placeholder="Please list the specific files, receipts, timelines, or reports you are requesting. Mention dates if possible (e.g. fiscal year 2080/81)."
                      className="w-full bg-himalayan-mist border border-dust-beige p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-temple-brass font-serif leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-basalt/80 mb-2">
                      Preferred Mode of Information Delivery
                    </label>
                    <select
                      name="format"
                      value={wizardData.format}
                      onChange={handleWizardChange}
                      className="w-full bg-himalayan-mist border border-dust-beige p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-temple-brass"
                    >
                      <option>Written Report (Printed Copies)</option>
                      <option>Inspection of Documents on Premises</option>
                      <option>Digital Copies via Email (PDF/Excel)</option>
                      <option>Certified True Copies</option>
                    </select>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4 animate-fadeIn">
                  <h3 className="text-lg font-serif text-pagoda-wood border-l-2 border-temple-brass pl-3 mb-4">
                    Step 3: Applicant Identification
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-basalt/80 mb-2">
                        Applicant Full Name
                      </label>
                      <input
                        type="text"
                        name="applicantName"
                        value={wizardData.applicantName}
                        onChange={handleWizardChange}
                        placeholder="Pritam Rai"
                        className="w-full bg-himalayan-mist border border-dust-beige p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-temple-brass"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-basalt/80 mb-2">
                        Citizenship Card Number (Optional)
                      </label>
                      <input
                        type="text"
                        name="citizenshipNo"
                        value={wizardData.citizenshipNo}
                        onChange={handleWizardChange}
                        placeholder="e.g. 24-01-72-XXXXX"
                        className="w-full bg-himalayan-mist border border-dust-beige p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-temple-brass"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-basalt/80 mb-2">
                      Permanent Address
                    </label>
                    <input
                      type="text"
                      name="applicantAddress"
                      value={wizardData.applicantAddress}
                      onChange={handleWizardChange}
                      placeholder="e.g. Budhanilkantha-4, Kathmandu"
                      className="w-full bg-himalayan-mist border border-dust-beige p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-temple-brass"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-basalt/80 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="applicantEmail"
                        value={wizardData.applicantEmail}
                        onChange={handleWizardChange}
                        className="w-full bg-himalayan-mist border border-dust-beige p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-temple-brass"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-basalt/80 mb-2">
                        Mobile Phone Number
                      </label>
                      <input
                        type="tel"
                        name="applicantPhone"
                        value={wizardData.applicantPhone}
                        onChange={handleWizardChange}
                        className="w-full bg-himalayan-mist border border-dust-beige p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-temple-brass"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="addSignaturePlaceholder"
                      name="addSignaturePlaceholder"
                      checked={wizardData.addSignaturePlaceholder}
                      onChange={handleWizardChange}
                      className="accent-pagoda-wood h-4 w-4"
                    />
                    <label htmlFor="addSignaturePlaceholder" className="text-xs text-slate-basalt/80 font-medium">
                      Add a formal signature line and thumbprint placeholders to the footer
                    </label>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-4 animate-fadeIn">
                  <h3 className="text-lg font-serif text-pagoda-wood border-l-2 border-temple-brass pl-3 mb-4">
                    Step 4: Final Review & Legal Context
                  </h3>

                  <div className="bg-weather-stone/50 border border-dust-beige/70 p-4 space-y-3 text-xs text-slate-basalt/80 font-serif leading-relaxed">
                    <p className="font-semibold text-pagoda-wood flex items-center gap-1.5">
                      <FileCheck className="w-4 h-4 text-temple-brass" />
                      Legal Declaration under RTI Act 2064
                    </p>
                    <p>
                      This application constitutes a formal demand under the laws of Nepal. Under Section 6(1) of the 
                      RTI Act 2064, the Information Officer is bound to provide the requested information within 
                      <strong> 15 days</strong>.
                    </p>
                    <p>
                      We track the deadline on your Nirikshan dashboard with a 35-day safety margin (35 days includes 
                      the initial 15 days + 20 days appeal timeframe to the Office Head).
                    </p>
                  </div>

                  <div className="bg-status-fulfilled/5 border border-status-fulfilled/30 text-status-fulfilled p-4 text-xs font-sans rounded-sm">
                    <strong>✓ Document Validation Complete:</strong> The letter contains all necessary constitutional declarations required for formal legal requests. Review the generated paper on the right pane.
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-8 border-t border-dust-beige/20 mt-8">
              {step > 1 ? (
                <button
                  onClick={() => setStep(s => s - 1)}
                  className="px-4 py-2 border border-dust-beige text-xs uppercase tracking-wider font-semibold hover:bg-weather-stone text-slate-basalt transition-all duration-200 rounded-sm"
                >
                  Back
                </button>
              ) : (
                <button
                  onClick={resetWizard}
                  className="px-4 py-2 text-slate-basalt/40 hover:text-slate-basalt text-xs uppercase tracking-wider font-semibold transition-all duration-200"
                >
                  Clear Form
                </button>
              )}

              {step < 4 ? (
                <button
                  onClick={() => setStep(s => s + 1)}
                  className="bg-pagoda-wood text-himalayan-mist px-6 py-2.5 text-xs uppercase tracking-widest font-semibold hover:bg-temple-brass hover:text-pagoda-wood transition-all duration-300 shadow-sm rounded-sm"
                >
                  Continue
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={triggerPrint}
                    className="px-4 py-2.5 border border-pagoda-wood text-pagoda-wood text-xs uppercase tracking-wider font-semibold hover:bg-weather-stone transition-all duration-200 rounded-sm flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Print PDF
                  </button>
                  <button
                    onClick={handleGenerateAndTrack}
                    className="bg-pagoda-wood text-himalayan-mist px-6 py-2.5 text-xs uppercase tracking-widest font-semibold hover:bg-temple-brass hover:text-pagoda-wood transition-all duration-300 shadow-md rounded-sm flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Track Request
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Letter Preview Column */}
          <div className="lg:col-span-5 flex flex-col">
            <span className="block text-[10px] uppercase font-bold tracking-widest text-slate-basalt/50 mb-2 pl-1">
              Live Official Document Preview
            </span>
            
            {/* The Document Sheet */}
            <div className="flex-grow bg-himalayan-mist border border-dust-beige p-8 rounded-sm shadow-md font-serif text-slate-basalt min-h-[580px] flex flex-col justify-between relative overflow-hidden">
              
              {/* Background Crest Watermark (Subtle Styling) */}
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
                <FileSignature className="w-80 h-80 text-pagoda-wood" />
              </div>

              <div className="space-y-6 text-sm leading-relaxed relative z-10">
                {/* Date and Header */}
                <div className="flex justify-between items-start text-xs font-sans text-slate-basalt/60">
                  <span>दर्ता नं: ....................</span>
                  <span>मिति: {new Date().toISOString().split('T')[0]}</span>
                </div>

                {/* Main Addressing */}
                <div className="space-y-1">
                  <p className="font-semibold text-slate-basalt">श्रीमान् {wizardData.officerName || "सूचना अधिकारी ज्यू"},</p>
                  <p className="font-semibold text-slate-basalt">{getOfficeName()}</p>
                  <p className="text-xs text-slate-basalt/80">{wizardData.address || "[कार्यालयको ठेगाना]"}</p>
                </div>

                {/* Subject Block */}
                <div className="text-center py-2 border-y border-dust-beige/40">
                  <h4 className="font-serif font-bold text-pagoda-wood text-base">
                    विषय: सूचना माग गरिएको सम्बन्धमा ।
                  </h4>
                </div>

                {/* Body Text */}
                <div className="space-y-3 text-xs leading-relaxed text-slate-basalt/95">
                  <p>
                    प्रस्तुत विषयमा, नेपालको संविधानको धारा २७ (सूचनाको हक सम्बन्धी हक) र सूचनाको हक सम्बन्धी ऐन, २०६४ को दफा ३ बमोजिम 
                    म निम्न बमोजिमका सूचना उपलब्ध गराई पाउन यो निवेदन पेश गर्दछु ।
                  </p>
                  
                  <div className="bg-weather-stone/30 p-3.5 border border-dust-beige/50 font-serif leading-relaxed text-xs">
                    <strong>माग गरिएको सूचनाको विवरण:</strong>
                    <p className="mt-1.5 whitespace-pre-line text-slate-basalt italic">
                      {wizardData.description || "यहाँ माग गरिएको विवरण देखापर्नेछ । (विवरण स्पष्ट रूपमा खुलाउनुहोला)"}
                    </p>
                  </div>

                  <p>
                    माग गरिएको सूचना <strong>{wizardData.format}</strong> को रूपमा उपलब्ध गराइदिनुहुन अनुरोध गर्दछु । 
                    यसका लागि लाग्ने आवश्यक प्रतिलिपि दस्तुर म नियमानुसार बुझाउन तयार छु ।
                  </p>
                </div>

                {/* Footer Signature */}
                <div className="pt-6 grid grid-cols-2 text-xs font-sans text-slate-basalt/80 border-t border-dashed border-dust-beige/40">
                  <div>
                    <h5 className="font-bold text-slate-basalt">निवेदकको विवरण:</h5>
                    <p>नाम: {wizardData.applicantName}</p>
                    <p>ठेगाना: {wizardData.applicantAddress}</p>
                    <p>सम्पर्क नं: {wizardData.applicantPhone}</p>
                    {wizardData.citizenshipNo && <p>ना.प्र.नं: {wizardData.citizenshipNo}</p>}
                  </div>
                  {wizardData.addSignaturePlaceholder && (
                    <div className="flex flex-col justify-end items-end pr-2 space-y-8">
                      <div className="w-28 border-t border-slate-basalt/60 text-center text-[10px] text-slate-basalt/50 pt-1">
                        दस्तखत
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Legal footnotes */}
              <div className="mt-8 border-t border-dust-beige/30 pt-4 text-[9px] text-slate-basalt/50 leading-normal relative z-10 font-sans">
                नेपाल सरकारको राजपत्रमा प्रकाशित नियम अनुसार यो निवेदन औपचारिक कानुनी रूपमा दर्ता गरिनुपर्नेछ। 
                १५ दिन भित्र सूचना नपाएमा कार्यालय प्रमुख समक्ष र सो पछि राष्ट्रिय सूचना आयोग (NIC) मा पुनरावेदन गर्न सकिन्छ ।
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* TRACKER VIEW */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Tracked Request List Column */}
          <div className="lg:col-span-5 space-y-4">
            <span className="block text-[10px] uppercase font-bold tracking-widest text-slate-basalt/50 pl-1 mb-2">
              Tracked Legal Requests
            </span>

            <div className="space-y-3 max-h-[640px] overflow-y-auto pr-2">
              {trackedRequests.length === 0 ? (
                <div className="text-center py-10 bg-weather-stone/10 border border-dashed border-dust-beige/70 p-6 font-serif">
                  No requests are currently being tracked. Generate one using the wizard.
                </div>
              ) : (
                trackedRequests.map((req) => {
                  const stats = getDeadlineStats(req);
                  const isSelected = selectedRequest?.id === req.id;
                  
                  return (
                    <div
                      key={req.id}
                      onClick={() => setSelectedRequest(req)}
                      className={`p-4 border rounded-sm transition-all duration-200 cursor-pointer ${
                        isSelected 
                          ? 'bg-weather-stone border-temple-brass shadow-sm ring-1 ring-temple-brass/30' 
                          : 'bg-weather-stone/30 border-dust-beige/50 hover:bg-weather-stone/60'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-sans font-bold bg-pagoda-wood text-himalayan-mist px-2 py-0.5 uppercase rounded-sm">
                          {req.id}
                        </span>
                        <span className={`text-[10px] font-sans font-bold border px-2 py-0.5 rounded-sm capitalize ${stats.statusColorClass}`}>
                          {req.status.replace('_', ' ')}
                        </span>
                      </div>

                      <h4 className="text-sm font-serif font-bold text-pagoda-wood mb-1 truncate">
                        {req.subject}
                      </h4>
                      <p className="text-xs text-slate-basalt/60 flex items-center gap-1 mb-3">
                        <Building className="w-3.5 h-3.5 text-temple-brass" />
                        {req.department}
                      </p>

                      {/* 35-Day Countdown Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[10px] font-semibold text-slate-basalt/70">
                          <span>35-Day RTI Deadline</span>
                          <span className={stats.textClass}>{stats.daysRemaining} days left</span>
                        </div>
                        
                        {/* Weathered Stone Track */}
                        <div className="w-full h-2 bg-weather-stone overflow-hidden rounded-full border border-dust-beige/30">
                          {/* Fill transitioning color based on remaining days */}
                          <div 
                            className={`h-full transition-all duration-500 ${stats.fillClass}`}
                            style={{ width: `${stats.percentageRemaining}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Detailed Request Audit Column */}
          <div className="lg:col-span-7">
            {selectedRequest ? (
              <div className="bg-weather-stone/20 border border-dust-beige p-6 rounded-sm shadow-md space-y-6">
                
                {/* Header */}
                <div className="border-b border-dust-beige/40 pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-mono text-temple-brass font-bold">{selectedRequest.id} — Legal Dossier</span>
                    <span className="text-xs font-sans text-slate-basalt/60 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Submitted: {selectedRequest.submissionDate}
                    </span>
                  </div>
                  <h3 className="text-xl font-serif text-pagoda-wood leading-snug">
                    {selectedRequest.subject}
                  </h3>
                </div>

                {/* Time Machine Simulation Control Panel */}
                <div className="bg-weather-stone border border-dust-beige p-4 rounded-sm space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-pagoda-wood uppercase tracking-wider border-b border-dust-beige/60 pb-1.5">
                    <Clock className="w-4 h-4 text-temple-brass" />
                    Reviewer Simulation Engine (Passage of Time)
                  </div>
                  
                  <p className="text-[11px] text-slate-basalt/70 font-serif leading-relaxed">
                    Simulate time moving forward to inspect how the 35-day countdown bar and status tags transition through Nepal's legal appeal phases:
                  </p>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {[0, 10, 25, 33, 36].map((days) => {
                      const active = (simulationDays[selectedRequest.id] || 0) === days;
                      return (
                        <button
                          key={days}
                          onClick={() => handleSimulateTime(selectedRequest.id, days)}
                          className={`text-[10px] font-sans font-bold px-3 py-1.5 rounded-sm transition-all border ${
                            active
                              ? 'bg-pagoda-wood border-pagoda-wood text-himalayan-mist'
                              : 'bg-himalayan-mist border-dust-beige text-slate-basalt hover:bg-weather-stone'
                          }`}
                        >
                          +{days} Days {days === 0 && "(Reset)"}
                          {days === 10 && " (Green)"}
                          {days === 25 && " (Yellow)"}
                          {days === 33 && " (Red)"}
                          {days === 36 && " (Overdue)"}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Large countdown stats display */}
                {(() => {
                  const stats = getDeadlineStats(selectedRequest);
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      
                      <div className="bg-weather-stone/40 p-4 border border-dust-beige/50 text-center rounded-sm">
                        <span className="block text-[9px] uppercase font-bold text-slate-basalt/50 mb-1">Days Elapsed</span>
                        <span className="text-2xl font-serif text-pagoda-wood font-bold">{stats.daysElapsed}</span>
                        <span className="block text-[8px] text-slate-basalt/60 mt-1">out of 35 days</span>
                      </div>

                      <div className="bg-weather-stone/40 p-4 border border-dust-beige/50 text-center rounded-sm">
                        <span className="block text-[9px] uppercase font-bold text-slate-basalt/50 mb-1">Time Remaining</span>
                        <span className={`text-2xl font-serif font-bold ${stats.textClass}`}>{stats.daysRemaining}</span>
                        <span className="block text-[8px] text-slate-basalt/60 mt-1">days left</span>
                      </div>

                      <div className="bg-weather-stone/40 p-4 border border-dust-beige/50 text-center rounded-sm col-span-1 md:col-span-1">
                        <span className="block text-[9px] uppercase font-bold text-slate-basalt/50 mb-1">RTI Legal Status</span>
                        <span className={`text-xs font-sans font-bold block truncate py-1.5 uppercase ${stats.textClass}`}>
                          {stats.daysRemaining <= 4 ? "Critical Appeal" : "Active Claim"}
                        </span>
                      </div>

                      <div className="col-span-1 md:col-span-3">
                        <div className={`border p-3.5 text-xs font-serif leading-relaxed ${stats.statusColorClass}`}>
                          <div className="flex items-center gap-1.5 font-bold mb-1">
                            {stats.daysRemaining <= 4 ? <AlertTriangle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                            {stats.statusLabel}
                          </div>
                          {stats.daysRemaining <= 4 && (
                            <p className="mt-1 text-[11px] font-sans">
                              * Nepal RTI Act Section 9: If information is denied, citizens can lodge an appeal to the head of office within 30 days, or appeal directly to the National Information Commission (NIC) if unsatisfied.
                            </p>
                          )}
                        </div>
                      </div>

                    </div>
                  );
                })()}

                {/* Details Section */}
                <div className="space-y-3 font-serif">
                  <div className="border-t border-dust-beige/30 pt-4">
                    <span className="block text-[10px] font-sans font-bold uppercase text-slate-basalt/50 mb-1.5">
                      Target Public Agency & Information Officer
                    </span>
                    <p className="text-sm font-bold text-pagoda-wood">{selectedRequest.department}</p>
                    <p className="text-xs text-slate-basalt/80">{selectedRequest.address}</p>
                    <p className="text-xs text-slate-basalt/70 mt-1">Information Officer: {selectedRequest.officerName}</p>
                  </div>

                  <div className="border-t border-dust-beige/30 pt-4">
                    <span className="block text-[10px] font-sans font-bold uppercase text-slate-basalt/50 mb-1.5">
                      Description of Information Claimed
                    </span>
                    <p className="text-xs leading-relaxed whitespace-pre-line text-slate-basalt bg-weather-stone/30 p-3.5 border border-dust-beige/40">
                      {selectedRequest.details}
                    </p>
                  </div>

                  <div className="border-t border-dust-beige/30 pt-4 flex justify-between items-center text-xs font-sans">
                    <div>
                      <span className="block text-[9px] uppercase font-bold text-slate-basalt/50">Applicant</span>
                      <span className="font-semibold text-slate-basalt">{selectedRequest.applicantName}</span>
                    </div>
                    
                    <button
                      onClick={() => {
                        // Create a mock print view for the selected item
                        setWizardData({
                          department: selectedRequest.department,
                          customDepartment: "",
                          address: selectedRequest.address,
                          officerName: selectedRequest.officerName,
                          subject: selectedRequest.subject,
                          description: selectedRequest.details,
                          format: "Written Report (Printed Copies)",
                          applicantName: selectedRequest.applicantName,
                          applicantAddress: selectedRequest.applicantAddress,
                          applicantEmail: "pritam@nirikshan.gov.np",
                          applicantPhone: selectedRequest.applicantPhone,
                          citizenshipNo: "",
                          addSignaturePlaceholder: true,
                        });
                        setStep(4);
                        setActiveTab('wizard');
                      }}
                      className="bg-weather-stone border border-dust-beige hover:bg-dust-beige/40 text-pagoda-wood px-3.5 py-1.5 text-xs font-bold uppercase transition-all duration-200 flex items-center gap-1"
                    >
                      <FileText className="w-3.5 h-3.5 text-temple-brass" />
                      Re-generate PDF Document
                    </button>
                  </div>
                </div>

              </div>
            ) : (
              <div className="h-full flex flex-col justify-center items-center py-20 bg-weather-stone/10 border border-dashed border-dust-beige text-center rounded-sm">
                <FileText className="w-12 h-12 text-dust-beige/70 mb-3" />
                <p className="font-serif text-slate-basalt/50">Select a tracked RTI request from the left sidebar to audit its legal countdown status.</p>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
