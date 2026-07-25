import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { rtiAPI } from '../api';
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
  FileSignature,
  Info
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

// Initial offline/mock requests in case backend fails or during initialization
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
    submittedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 days ago (30 days left)
    status: "submitted",
    details: "Seeking detailed financial breakdown, signed contracts, and penalty terms for contractor delays on the Kalanki-Maharajgunj section of Ring Road expansion."
  }
];

export default function RtiAssistant() {
  const [activeTab, setActiveTab] = useState('info'); // 'info', 'wizard' or 'tracker'
  const [step, setStep] = useState(1);
  const [trackedRequests, setTrackedRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [errors, setErrors] = useState({});

  // Wizard State
  const [wizardData, setWizardData] = useState({
    department: "Ministry of Physical Infrastructure and Transport",
    customDepartment: "",
    address: "Singha Durbar, Kathmandu",
    officerName: "Information Officer",
    subject: "",
    description: "",
    format: "Written Report (Printed Copies)",
    applicantName: "",
    applicantAddress: "",
    applicantEmail: "",
    applicantPhone: "",
    citizenshipNo: "",
    addSignaturePlaceholder: true,
  });

  // Tracked requests filter / detail view
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [simulationDays, setSimulationDays] = useState({}); 

  // Load from backend API
  const fetchMyRequests = async () => {
    setLoadingRequests(true);
    setErrorMessage(null);
    try {
      const data = await rtiAPI.getMine();
      setTrackedRequests(data);
    } catch (err) {
      console.error("Error fetching RTI requests:", err);
      // Fallback to local storage or defaults if offline
      const saved = localStorage.getItem('nirikshan_rti_requests');
      const offlineData = saved ? JSON.parse(saved) : INITIAL_REQUESTS;
      setTrackedRequests(offlineData);
      setErrorMessage("Showing cached/offline RTI requests as backend is currently unreachable.");
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    fetchMyRequests();
  }, []);

  useEffect(() => {
    if (trackedRequests.length > 0) {
      localStorage.setItem('nirikshan_rti_requests', JSON.stringify(trackedRequests));
    }
  }, [trackedRequests]);

  const handleWizardChange = (e) => {
    const { name, value, type, checked } = e.target;
    setWizardData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
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
      applicantName: "",
      applicantAddress: "",
      applicantEmail: "",
      applicantPhone: "",
      citizenshipNo: "",
      addSignaturePlaceholder: true,
    });
    setStep(1);
    setErrors({});
  };

  const validateStep = (stepNum) => {
    const stepErrors = {};
    if (stepNum === 1) {
      if (wizardData.department === "Other / Custom Office" && !wizardData.customDepartment.trim()) {
        stepErrors.customDepartment = "Please specify the custom office name.";
      }
      if (!wizardData.address.trim()) {
        stepErrors.address = "Office address is required.";
      }
      if (!wizardData.officerName.trim()) {
        stepErrors.officerName = "Officer designation is required.";
      }
    }
    if (stepNum === 2) {
      if (!wizardData.subject.trim()) {
        stepErrors.subject = "Subject/Title is required.";
      }
      if (!wizardData.description.trim()) {
        stepErrors.description = "Specific details of information requested are required.";
      }
    }
    if (stepNum === 3) {
      if (!wizardData.applicantName.trim()) {
        stepErrors.applicantName = "Applicant name is required.";
      }
      if (!wizardData.applicantAddress.trim()) {
        stepErrors.applicantAddress = "Permanent address is required.";
      }
      if (!wizardData.applicantEmail.trim()) {
        stepErrors.applicantEmail = "Email address is required.";
      }
      if (!wizardData.applicantPhone.trim()) {
        stepErrors.applicantPhone = "Phone number is required.";
      }
    }
    return stepErrors;
  };

  const handleContinue = () => {
    const stepErrors = validateStep(step);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
    } else {
      setErrors({});
      setStep(s => s + 1);
    }
  };

  const handleGenerateAndTrack = async () => {
    const step1Errors = validateStep(1);
    const step2Errors = validateStep(2);
    const step3Errors = validateStep(3);
    const allErrors = { ...step1Errors, ...step2Errors, ...step3Errors };
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      if (Object.keys(step1Errors).length > 0) setStep(1);
      else if (Object.keys(step2Errors).length > 0) setStep(2);
      else if (Object.keys(step3Errors).length > 0) setStep(3);
      return;
    }

    const dateStr = new Date().toISOString().split('T')[0];
    const letter = `दर्ता नं: .................... मिति: ${dateStr}\n\nश्रीमान् ${wizardData.officerName || "सूचना अधिकारी ज्यू"},\n${getOfficeName()}\n${wizardData.address || ""}\n\nविषय: सूचना माग गरिएको सम्बन्धमा ।\n\nप्रस्तुत विषयमा, नेपालको संविधानको धारा २७ (सूचनाको हक सम्बन्धी हक) र सूचनाको हक सम्बन्धी ऐन, २०६४ को दफा ३ बमोजिम म निम्न बमोजिमका सूचना उपलब्ध गराई पाउन यो निवेदन पेश गर्दछु ।\n\nमाग गरिएको सूचनाको विवरण:\n${wizardData.description}\n\nमाग गरिएको सूचना ${wizardData.format} को रूपमा उपलब्ध गराइदिनुहुन अनुरोध गर्दछु । यसका लागि लाग्ने आवश्यक प्रतिलिपि दस्तुर म नियमानुसार बुझाउन तयार छु ।\n\nनिवेदकको विवरण:\nनाम: ${wizardData.applicantName}\nठेगाना: ${wizardData.applicantAddress}\nसम्पर्क नं: ${wizardData.applicantPhone}\n${wizardData.citizenshipNo ? `ना.प्र.नं: ${wizardData.citizenshipNo}` : ''}`;

    const deadline = new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const payload = {
      subject: wizardData.subject,
      targetOffice: getOfficeName(),
      letterContent: letter,
      deadlineDate: deadline
    };

    setLoadingRequests(true);
    try {
      const response = await rtiAPI.submit(payload);
      await fetchMyRequests();
      setActiveTab('tracker');
      setSelectedRequest(response);
      resetWizard();
      alert("Official RTI request letter drafted, posted to backend, and added to your tracked requests dashboard successfully.");
    } catch (err) {
      console.error("Failed to submit RTI request:", err);
      alert(err.response?.data?.error || "Failed to submit RTI request to the server.");
    } finally {
      setLoadingRequests(false);
    }
  };

  const downloadPdfFile = () => {
    const doc = new jsPDF();
    const dateStr = new Date().toISOString().split('T')[0];
    
    doc.setFont("Helvetica");
    doc.setFontSize(12);
    
    doc.text(`Date: ${dateStr}`, 150, 20);
    
    doc.setFont("Helvetica", "bold");
    doc.text("To,", 20, 35);
    doc.text(`The Information Officer`, 20, 42);
    doc.text(`${getOfficeName()}`, 20, 49);
    doc.text(`${wizardData.address}`, 20, 56);
    
    doc.text("Subject: Request for Information under Right to Information (RTI) Act", 20, 70);
    
    doc.setFont("Helvetica", "normal");
    const introText = "Pursuant to the Right to Information Act, I hereby demand the following official information records from your office:";
    const splitIntro = doc.splitTextToSize(introText, 170);
    doc.text(splitIntro, 20, 80);
    
    doc.setFont("Helvetica", "bold");
    doc.text("Details of Information Required:", 20, 100);
    doc.setFont("Helvetica", "normal");
    const details = wizardData.description || "Seeking details of public expenditure.";
    const splitDetails = doc.splitTextToSize(details, 170);
    doc.text(splitDetails, 20, 107);
    
    const formatText = `Preferred Information Format: ${wizardData.format}. I am willing to pay any official copy fees as per the rules.`;
    const splitFormat = doc.splitTextToSize(formatText, 170);
    doc.text(splitFormat, 20, 150);
    
    doc.setFont("Helvetica", "bold");
    doc.text("Applicant Information:", 20, 170);
    doc.setFont("Helvetica", "normal");
    doc.text(`Full Name: ${wizardData.applicantName}`, 20, 177);
    doc.text(`Address: ${wizardData.applicantAddress}`, 20, 184);
    doc.text(`Phone No: ${wizardData.applicantPhone}`, 20, 191);
    doc.text(`Email: ${wizardData.applicantEmail}`, 20, 198);
    if (wizardData.citizenshipNo) {
      doc.text(`Citizenship Number: ${wizardData.citizenshipNo}`, 20, 205);
    }
    
    if (wizardData.addSignaturePlaceholder) {
      doc.line(130, 225, 185, 225);
      doc.text("Applicant Signature", 140, 231);
    }
    
    doc.save(`RTI_Request_${dateStr}.pdf`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans">
      <div className="border-b border-dust-beige/60 pb-6 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-serif text-pagoda-wood tracking-tight">
            Ask for Government Information (RTI)
          </h1>
          <p className="text-slate-basalt/70 font-serif max-w-2xl mt-2 leading-relaxed">
            Understand your rights, easily file requests for information, and track their progress.
          </p>
        </div>

        <div className="bg-weather-stone/50 p-1 flex rounded-sm border border-dust-beige/40 overflow-x-auto">
          <button
            onClick={() => { setActiveTab('info'); setSelectedRequest(null); }}
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-sm transition-all duration-200 whitespace-nowrap ${
              activeTab === 'info'
                ? 'bg-pagoda-wood text-himalayan-mist shadow-sm'
                : 'text-slate-basalt/70 hover:text-slate-basalt'
            }`}
          >
            <Info className="w-4 h-4 inline-block mr-1" /> Learn More
          </button>
          <button
            onClick={() => { setActiveTab('wizard'); setSelectedRequest(null); }}
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-sm transition-all duration-200 whitespace-nowrap ${
              activeTab === 'wizard'
                ? 'bg-pagoda-wood text-himalayan-mist shadow-sm'
                : 'text-slate-basalt/70 hover:text-slate-basalt'
            }`}
          >
            File a Request
          </button>
          <button
            onClick={() => setActiveTab('tracker')}
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-sm transition-all duration-200 whitespace-nowrap ${
              activeTab === 'tracker'
                ? 'bg-pagoda-wood text-himalayan-mist shadow-sm'
                : 'text-slate-basalt/70 hover:text-slate-basalt'
            }`}
          >
            Track Status ({trackedRequests.length})
          </button>
        </div>
      </div>

      {activeTab === 'info' && (
        <div className="bg-white border border-dust-beige p-8 rounded-sm shadow-sm space-y-6 animate-fadeIn">
          <h2 className="text-2xl font-serif text-pagoda-wood">Understanding the Right to Information (RTI) Act</h2>
          <p className="text-slate-basalt/80">Every citizen has the right to ask for information from government offices and public institutions. It's your right to know how public money is spent, how decisions are made, and how public services are managed.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
            <div className="bg-weather-stone/30 p-6 border border-dust-beige rounded-sm">
              <h3 className="text-lg font-bold text-pagoda-wood mb-3 flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-temple-brass" /> What you can ask for
              </h3>
              <ul className="list-disc list-inside space-y-2 text-slate-basalt/80">
                <li>Budget and expenditure details</li>
                <li>Copies of official contracts or decisions</li>
                <li>Reports on public projects</li>
                <li>Reasons behind administrative decisions</li>
              </ul>
            </div>
            <div className="bg-weather-stone/30 p-6 border border-dust-beige rounded-sm">
              <h3 className="text-lg font-bold text-pagoda-wood mb-3 flex items-center gap-2">
                <Layers className="w-5 h-5 text-temple-brass" /> How to file a request
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-slate-basalt/80">
                <li>Identify the correct government office holding the information.</li>
                <li>Use our 'File a Request' tab to easily write your application.</li>
                <li>Submit the application to the Information Officer of that office.</li>
                <li>Keep the receipt to track the status. The office must reply within 15 days.</li>
              </ol>
            </div>
          </div>
          
          <div className="mt-8 flex gap-4">
            <button onClick={() => { setActiveTab('wizard'); }} className="bg-pagoda-wood text-himalayan-mist px-6 py-3 font-semibold rounded-sm hover:bg-temple-brass hover:text-pagoda-wood transition flex items-center gap-2">
              <Plus className="w-5 h-5" /> File Your First Request
            </button>
            <button onClick={downloadPdfFile} className="border border-pagoda-wood text-pagoda-wood px-6 py-3 font-semibold rounded-sm hover:bg-weather-stone transition flex items-center gap-2">
              <Download className="w-5 h-5" /> Download Blank Template
            </button>
          </div>
        </div>
      )}

      {activeTab === 'wizard' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fadeIn">
          <div className="lg:col-span-7 bg-white border border-dust-beige p-6 rounded-sm shadow-sm flex flex-col justify-between min-h-[580px]">
            <div>
              <div className="flex justify-between items-center mb-8 border-b border-dust-beige/30 pb-4">
                {[1, 2, 3].map((s) => {
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
                        {s === 1 && "Office"}
                        {s === 2 && "Information"}
                        {s === 3 && "Details"}
                      </span>
                      {s < 3 && <ChevronRight className="w-3.5 h-3.5 text-dust-beige/50 hidden sm:inline" />}
                    </div>
                  );
                })}
              </div>

              {step === 1 && (
                <div className="space-y-4 animate-fadeIn">
                  <h3 className="text-lg font-serif text-pagoda-wood border-l-2 border-temple-brass pl-3 mb-4">
                    Step 1: Which office are you asking?
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-basalt mb-1">Government Office</label>
                    <select
                      name="department"
                      value={wizardData.department}
                      onChange={handleWizardChange}
                      className="w-full bg-himalayan-mist border border-dust-beige p-3 text-sm focus:outline-none focus:border-temple-brass rounded-sm"
                    >
                      {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>

                  {wizardData.department === "Other / Custom Office" && (
                    <div className="animate-fadeIn">
                      <label className="block text-sm font-semibold text-slate-basalt mb-1">Office Name</label>
                      <input
                        type="text"
                        name="customDepartment"
                        placeholder="e.g. Ward Office 3"
                        value={wizardData.customDepartment}
                        onChange={handleWizardChange}
                        className="w-full bg-himalayan-mist border border-dust-beige p-3 text-sm focus:outline-none focus:border-temple-brass rounded-sm"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-slate-basalt mb-1">Office Address</label>
                    <input
                      type="text"
                      name="address"
                      value={wizardData.address}
                      onChange={handleWizardChange}
                      placeholder="e.g. Kathmandu"
                      className="w-full bg-himalayan-mist border border-dust-beige p-3 text-sm focus:outline-none focus:border-temple-brass rounded-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-basalt mb-1">Officer Title (Usually 'Information Officer')</label>
                    <input
                      type="text"
                      name="officerName"
                      value={wizardData.officerName}
                      onChange={handleWizardChange}
                      className="w-full bg-himalayan-mist border border-dust-beige p-3 text-sm focus:outline-none focus:border-temple-brass rounded-sm"
                    />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4 animate-fadeIn">
                  <h3 className="text-lg font-serif text-pagoda-wood border-l-2 border-temple-brass pl-3 mb-4">
                    Step 2: What information do you need?
                  </h3>

                  <div>
                    <label className="block text-sm font-semibold text-slate-basalt mb-1">Subject</label>
                    <input
                      type="text"
                      name="subject"
                      value={wizardData.subject}
                      onChange={handleWizardChange}
                      placeholder="e.g., Budget for local park"
                      className="w-full bg-himalayan-mist border border-dust-beige p-3 text-sm focus:outline-none focus:border-temple-brass rounded-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-basalt mb-1">Details (Be clear and specific)</label>
                    <textarea
                      name="description"
                      rows={5}
                      value={wizardData.description}
                      onChange={handleWizardChange}
                      placeholder="List exactly what documents you want."
                      className="w-full bg-himalayan-mist border border-dust-beige p-3 text-sm focus:outline-none focus:border-temple-brass rounded-sm font-serif"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-basalt mb-1">How do you want this?</label>
                    <select
                      name="format"
                      value={wizardData.format}
                      onChange={handleWizardChange}
                      className="w-full bg-himalayan-mist border border-dust-beige p-3 text-sm focus:outline-none focus:border-temple-brass rounded-sm"
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
                    Step 3: Your Details
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-basalt mb-1">Your Full Name</label>
                      <input type="text" name="applicantName" value={wizardData.applicantName} onChange={handleWizardChange} className="w-full bg-himalayan-mist border border-dust-beige p-3 text-sm focus:outline-none focus:border-temple-brass rounded-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-basalt mb-1">Citizenship No (Optional)</label>
                      <input type="text" name="citizenshipNo" value={wizardData.citizenshipNo} onChange={handleWizardChange} className="w-full bg-himalayan-mist border border-dust-beige p-3 text-sm focus:outline-none focus:border-temple-brass rounded-sm" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-basalt mb-1">Address</label>
                    <input type="text" name="applicantAddress" value={wizardData.applicantAddress} onChange={handleWizardChange} className="w-full bg-himalayan-mist border border-dust-beige p-3 text-sm focus:outline-none focus:border-temple-brass rounded-sm" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-basalt mb-1">Email</label>
                      <input type="email" name="applicantEmail" value={wizardData.applicantEmail} onChange={handleWizardChange} className="w-full bg-himalayan-mist border border-dust-beige p-3 text-sm focus:outline-none focus:border-temple-brass rounded-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-basalt mb-1">Phone Number</label>
                      <input type="tel" name="applicantPhone" value={wizardData.applicantPhone} onChange={handleWizardChange} className="w-full bg-himalayan-mist border border-dust-beige p-3 text-sm focus:outline-none focus:border-temple-brass rounded-sm" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-8 border-t border-dust-beige/20 mt-8">
              {step > 1 ? (
                <button onClick={() => setStep(s => s - 1)} className="px-6 py-2 border border-dust-beige text-sm font-semibold hover:bg-weather-stone text-slate-basalt transition-all rounded-sm">
                  Back
                </button>
              ) : (
                <button onClick={resetWizard} className="px-4 py-2 text-slate-basalt/60 hover:text-slate-basalt text-sm font-semibold transition-all">
                  Clear Form
                </button>
              )}

              {step < 3 ? (
                <button onClick={handleContinue} className="bg-pagoda-wood text-himalayan-mist px-6 py-3 text-sm font-semibold hover:bg-temple-brass hover:text-pagoda-wood transition-all shadow-sm rounded-sm">
                  Continue
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={downloadPdfFile} className="px-4 py-3 border border-pagoda-wood text-pagoda-wood text-sm font-semibold hover:bg-weather-stone transition-all rounded-sm flex items-center gap-1.5">
                    <Download className="w-4 h-4" /> Download PDF
                  </button>
                  <button onClick={handleGenerateAndTrack} className="bg-pagoda-wood text-himalayan-mist px-6 py-3 text-sm font-semibold hover:bg-temple-brass hover:text-pagoda-wood transition-all shadow-md rounded-sm flex items-center gap-1.5">
                    <Send className="w-4 h-4" /> Save Request
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col">
            <span className="block text-[10px] uppercase font-bold tracking-widest text-slate-basalt/50 mb-2 pl-1">Document Preview</span>
            <div className="flex-grow bg-himalayan-mist border border-dust-beige p-8 rounded-sm shadow-md font-serif text-slate-basalt min-h-[580px] flex flex-col justify-between relative overflow-hidden text-sm">
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none select-none">
                <FileSignature className="w-80 h-80 text-pagoda-wood" />
              </div>
              <div className="relative z-10 space-y-4">
                <div className="text-right">
                  <p>Date: {new Date().toISOString().split('T')[0]}</p>
                </div>
                <div className="space-y-1">
                  <p className="font-bold">To,</p>
                  <p>The Information Officer</p>
                  <p className="font-semibold">{getOfficeName()}</p>
                  <p>{wizardData.address || "[Address]"}</p>
                </div>
                <div className="pt-4 pb-2 border-b-2 border-dust-beige/50">
                  <p className="font-bold">Subject: Request for Information</p>
                </div>
                <p className="leading-relaxed">
                  I hereby request the following information from your office:
                </p>
                <div className="bg-white/50 p-3 min-h-[100px] border border-dust-beige/30 whitespace-pre-wrap">
                  {wizardData.description || "..."}
                </div>
                <p>Format required: {wizardData.format}</p>
              </div>
              <div className="relative z-10 pt-8 mt-8 border-t border-dust-beige/30">
                <p className="font-bold mb-2">Applicant Details:</p>
                <p>Name: {wizardData.applicantName || "[Name]"}</p>
                <p>Address: {wizardData.applicantAddress || "[Address]"}</p>
                <p>Phone: {wizardData.applicantPhone || "[Phone]"}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'tracker' && (
        <div className="animate-fadeIn">
          {trackedRequests.length === 0 ? (
            <div className="bg-white border border-dust-beige p-10 text-center rounded-sm">
              <Layers className="w-10 h-10 text-dust-beige mx-auto mb-4" />
              <h3 className="text-lg font-serif text-pagoda-wood mb-2">No Requests Found</h3>
              <p className="text-slate-basalt/70 mb-6">You haven't filed or tracked any RTI requests yet.</p>
              <button onClick={() => setActiveTab('wizard')} className="bg-pagoda-wood text-himalayan-mist px-6 py-2 rounded-sm">File a Request</button>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-xl font-serif text-pagoda-wood mb-4">Your Saved Requests</h2>
              {trackedRequests.map(req => (
                <div key={req.id} className="bg-white border border-dust-beige p-4 rounded-sm shadow-sm flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                  <div>
                    <h3 className="font-bold text-pagoda-wood">{req.subject}</h3>
                    <p className="text-sm text-slate-basalt/70">{req.department}</p>
                    <p className="text-xs text-slate-basalt/50 mt-1">Submitted: {req.submittedDate || "Recently"}</p>
                  </div>
                  <div className="bg-weather-stone/30 px-4 py-2 rounded-sm border border-dust-beige/50 text-sm font-semibold text-slate-basalt">
                    Status: {req.status || "Processing"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
