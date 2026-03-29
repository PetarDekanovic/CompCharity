import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Upload, X, CheckCircle, Loader2, ChevronRight, ChevronLeft, Laptop, Smartphone, Monitor, Printer, MousePointer2, Info, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { db, collection, addDoc, serverTimestamp, handleFirestoreError, OperationType } from "../../lib/firebase";
import { useAuth } from "../../hooks/useAuth";
import { analyzeDeviceDescription } from "../../services/geminiService";

const submissionSchema = z.object({
  fullName: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(7, "Phone is required"),
  location: z.string().min(2, "Location is required"),
  category: z.string().min(1, "Category is required"),
  brand: z.string().min(1, "Brand is required"),
  model: z.string().min(1, "Model is required"),
  estimatedAge: z.string().min(1, "Age is required"),
  condition: z.string().min(1, "Condition is required"),
  description: z.string().min(10, "Please provide more detail"),
  accessories: z.string().optional(),
  preferredOutcome: z.string().optional(),
  collectionPreference: z.string().min(1, "Preference is required"),
  consent: z.boolean().refine((v) => v === true, "You must consent to proceed"),
});

type SubmissionData = z.infer<typeof submissionSchema>;

interface Props {
  type: "DONATION" | "RESALE";
}

const STEPS = [
  { id: "contact", title: "Contact", description: "Who are you?" },
  { id: "device", title: "Device", description: "What are you donating?" },
  { id: "details", title: "Details", description: "Condition & Photos" },
  { id: "review", title: "Review", description: "Final check" },
];

export default function SubmissionForm({ type }: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SubmissionData>({
    resolver: zodResolver(submissionSchema),
    defaultValues: {
      consent: false,
    },
  });

  const formData = watch();

  const handleAnalyze = async () => {
    const description = watch("description");
    if (!description || description.length < 10) {
      toast.error("Please provide a more detailed description first.");
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await analyzeDeviceDescription(description);
      if (result) {
        if (result.category) setValue("category", result.category);
        if (result.condition) {
          // Map Gemini condition to our select options if possible
          const conditionMap: Record<string, string> = {
            "Excellent": "Fully working",
            "Good": "Slow but working",
            "Fair": "Needs OS install",
            "Poor": "Damaged"
          };
          const mapped = conditionMap[result.condition] || result.condition;
          setValue("condition", mapped);
        }
        toast.success("Gemini analyzed your description and updated the fields!");
      }
    } catch (error) {
      console.error("Analysis Error:", error);
      toast.error("Failed to analyze description. Please fill fields manually.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      if (images.length + newFiles.length > 5) {
        toast.error("Maximum 5 images allowed");
        return;
      }
      setImages((prev) => [...prev, ...newFiles]);
      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
      setPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const nextStep = async () => {
    const fields = currentStep === 0 
      ? ["fullName", "email", "phone", "location"] 
      : currentStep === 1 
      ? ["category", "brand", "model", "estimatedAge"]
      : ["condition", "collectionPreference", "description"];
    
    const isValid = await trigger(fields as any);
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onSubmit = async (data: SubmissionData) => {
    if (!user) {
      toast.error("Please sign in to submit a request.");
      navigate("/auth");
      return;
    }

    setIsSubmitting(true);
    const referenceNumber = `CC-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    try {
      // For now, we'll just store placeholder image URLs
      // In a real app, you'd upload to Firebase Storage first
      const imageUrls = previews.map((_, i) => `https://picsum.photos/seed/device-${i}/800/600`);

      const submissionData = {
        ...data,
        userId: user.id,
        type,
        status: "pending",
        referenceNumber,
        images: imageUrls,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, "submissions"), submissionData);
      
      setIsSuccess(true);
      toast.success("Submission received! We'll be in touch soon.");
      setTimeout(() => navigate("/dashboard"), 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "submissions");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-32 bg-white rounded-[64px] shadow-2xl border border-blue-50"
      >
        <div className="inline-flex p-8 bg-green-50 rounded-full mb-8">
          <CheckCircle className="w-16 h-16 text-green-600" />
        </div>
        <h2 className="text-4xl font-bold text-gray-900 mb-6 tracking-tighter">Submission Successful!</h2>
        <p className="text-gray-500 max-w-md mx-auto mb-12 text-lg font-medium leading-relaxed">
          Thank you for your {type.toLowerCase()}. We've received your details and our team will review them within 2-3 business days.
        </p>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Redirecting to home</div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-16">
        <div className="flex justify-between items-center mb-8 relative">
          {STEPS.map((step, i) => (
            <div key={step.id} className="flex flex-col items-center gap-3 relative z-10">
              <motion.div 
                initial={false}
                animate={{ 
                  backgroundColor: i <= currentStep ? "#2563eb" : "#f3f4f6",
                  color: i <= currentStep ? "#ffffff" : "#9ca3af",
                  scale: i === currentStep ? 1.1 : 1,
                }}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm transition-all duration-500 ${
                  i <= currentStep ? "shadow-xl shadow-blue-200" : ""
                }`}
              >
                {i < currentStep ? <CheckCircle className="w-6 h-6" /> : i + 1}
              </motion.div>
              <div className="text-center">
                <motion.div 
                  animate={{ 
                    color: i <= currentStep ? "#2563eb" : "#9ca3af",
                    opacity: i <= currentStep ? 1 : 0.5
                  }}
                  className="text-[10px] font-bold uppercase tracking-widest"
                >
                  {step.title}
                </motion.div>
              </div>
            </div>
          ))}
          {/* Connector Lines */}
          <div className="absolute left-0 right-0 top-6 h-0.5 bg-gray-100 -z-0 max-w-4xl mx-auto px-12">
            <motion.div 
              className="h-full bg-blue-600"
              initial={{ width: "0%" }}
              animate={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 lg:p-16 rounded-[64px] shadow-2xl shadow-blue-100/50 border border-gray-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 blur-[100px] -z-0" />
        
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20, filter: "blur(10px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: -20, filter: "blur(10px)" }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10"
          >
            {currentStep === 0 && (
              <div className="space-y-12">
                <div className="space-y-4">
                  <h3 className="text-3xl font-bold text-gray-900 tracking-tighter">Contact Information</h3>
                  <p className="text-gray-500 font-medium">Tell us who you are and where you're located.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Full Name</label>
                    <input
                      {...register("fullName")}
                      className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all font-medium"
                      placeholder="John Doe"
                    />
                    {errors.fullName && <p className="text-xs text-red-500 font-bold">{errors.fullName.message}</p>}
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Email Address</label>
                    <input
                      {...register("email")}
                      className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all font-medium"
                      placeholder="john@example.com"
                    />
                    {errors.email && <p className="text-xs text-red-500 font-bold">{errors.email.message}</p>}
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Phone Number</label>
                    <input
                      {...register("phone")}
                      className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all font-medium"
                      placeholder="+353 8X XXX XXXX"
                    />
                    {errors.phone && <p className="text-xs text-red-500 font-bold">{errors.phone.message}</p>}
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Location</label>
                    <input
                      {...register("location")}
                      className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all font-medium"
                      placeholder="Dublin, Cork, Galway..."
                    />
                    {errors.location && <p className="text-xs text-red-500 font-bold">{errors.location.message}</p>}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-12">
                <div className="space-y-4">
                  <h3 className="text-3xl font-bold text-gray-900 tracking-tighter">Device Details</h3>
                  <p className="text-gray-500 font-medium">What kind of technology are you sharing with us?</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Category</label>
                    <select
                      {...register("category")}
                      className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all font-medium appearance-none"
                    >
                      <option value="">Select Category</option>
                      <option value="Laptop">Laptop</option>
                      <option value="Desktop">Desktop</option>
                      <option value="Phone">Phone</option>
                      <option value="Tablet">Tablet</option>
                      <option value="Monitor">Monitor</option>
                      <option value="Printer">Printer</option>
                      <option value="Accessories">Accessories</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.category && <p className="text-xs text-red-500 font-bold">{errors.category.message}</p>}
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Brand</label>
                    <input
                      {...register("brand")}
                      className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all font-medium"
                      placeholder="Apple, Dell, HP..."
                    />
                    {errors.brand && <p className="text-xs text-red-500 font-bold">{errors.brand.message}</p>}
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Model</label>
                    <input
                      {...register("model")}
                      className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all font-medium"
                      placeholder="MacBook Pro 2019, Latitude 5400..."
                    />
                    {errors.model && <p className="text-xs text-red-500 font-bold">{errors.model.message}</p>}
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Estimated Age</label>
                    <select
                      {...register("estimatedAge")}
                      className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all font-medium appearance-none"
                    >
                      <option value="">Select Age</option>
                      <option value="< 1 year">Less than 1 year</option>
                      <option value="1-3 years">1-3 years</option>
                      <option value="3-5 years">3-5 years</option>
                      <option value="5-8 years">5-8 years</option>
                      <option value="8+ years">8+ years</option>
                    </select>
                    {errors.estimatedAge && <p className="text-xs text-red-500 font-bold">{errors.estimatedAge.message}</p>}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-12">
                <div className="space-y-4">
                  <h3 className="text-3xl font-bold text-gray-900 tracking-tighter">Condition & Logistics</h3>
                  <p className="text-gray-500 font-medium">Help us understand the state of the device and how to get it.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Condition</label>
                    <select
                      {...register("condition")}
                      className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all font-medium appearance-none"
                    >
                      <option value="">Select Condition</option>
                      <option value="Fully working">Fully working</option>
                      <option value="Slow but working">Slow but working</option>
                      <option value="Damaged">Damaged</option>
                      <option value="Needs OS install">Needs OS install</option>
                      <option value="Battery issue">Battery issue</option>
                      <option value="For parts only">For parts only</option>
                      <option value="Unknown">Unknown</option>
                    </select>
                    {errors.condition && <p className="text-xs text-red-500 font-bold">{errors.condition.message}</p>}
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Collection Preference</label>
                    <select
                      {...register("collectionPreference")}
                      className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all font-medium appearance-none"
                    >
                      <option value="">Select Preference</option>
                      <option value="Collection">Request Collection</option>
                      <option value="Drop-off">I will drop it off</option>
                    </select>
                    {errors.collectionPreference && <p className="text-xs text-red-500 font-bold">{errors.collectionPreference.message}</p>}
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Description & Issues</label>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={handleAnalyze}
                      disabled={isAnalyzing}
                      className="flex items-center gap-2 text-[10px] font-bold text-blue-600 uppercase tracking-widest hover:text-blue-700 disabled:opacity-50"
                    >
                      {isAnalyzing ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Sparkles className="w-3 h-3" />
                      )}
                      Analyze with Gemini
                    </motion.button>
                  </div>
                  <textarea
                    {...register("description")}
                    rows={4}
                    className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all font-medium"
                    placeholder="Describe any scratches, missing keys, or performance issues..."
                  />
                  {errors.description && <p className="text-xs text-red-500 font-bold">{errors.description.message}</p>}
                </div>

                <div className="space-y-6">
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Device Images (Max 5)</div>
                  <div className="flex flex-wrap gap-4">
                    <AnimatePresence>
                      {previews.map((preview, i) => (
                        <motion.div
                          key={preview}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="relative w-24 h-24 rounded-2xl overflow-hidden group shadow-lg"
                        >
                          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeImage(i)}
                            className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-6 h-6" />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {previews.length < 5 && (
                      <label className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all group">
                        <Upload className="w-6 h-6 text-gray-400 group-hover:text-blue-600 mb-1" />
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Add</span>
                        <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-12">
                <div className="space-y-4">
                  <h3 className="text-3xl font-bold text-gray-900 tracking-tighter">Review & Confirm</h3>
                  <p className="text-gray-500 font-medium">Please verify your details before submitting.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <div className="bg-gray-50 p-8 rounded-[32px] space-y-4">
                      <div className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Contact</div>
                      <div className="space-y-2">
                        <div className="text-lg font-bold text-gray-900">{formData.fullName}</div>
                        <div className="text-sm text-gray-500 font-medium">{formData.email}</div>
                        <div className="text-sm text-gray-500 font-medium">{formData.phone}</div>
                        <div className="text-sm text-gray-500 font-medium">{formData.location}</div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="bg-gray-50 p-8 rounded-[32px] space-y-4">
                      <div className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Device</div>
                      <div className="space-y-2">
                        <div className="text-lg font-bold text-gray-900">{formData.brand} {formData.model}</div>
                        <div className="text-sm text-gray-500 font-medium">{formData.category} • {formData.estimatedAge}</div>
                        <div className="text-sm text-gray-500 font-medium">Condition: {formData.condition}</div>
                        <div className="text-sm text-gray-500 font-medium">Logistics: {formData.collectionPreference}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-8 rounded-[32px] flex gap-6 items-start">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Info className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <input
                        type="checkbox"
                        {...register("consent")}
                        className="mt-1 w-5 h-5 rounded-lg border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label className="text-sm text-gray-600 font-medium leading-relaxed">
                        I confirm that I am the legal owner of this device and the information provided is accurate. I understand that CompCharity will perform data wiping but I am responsible for backing up any important data.
                      </label>
                    </div>
                    {errors.consent && <p className="text-xs text-red-500 font-bold">{errors.consent.message}</p>}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="mt-16 pt-12 border-t border-gray-100 flex justify-between items-center relative z-10">
          <motion.button
            whileHover={{ x: -5 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={prevStep}
            disabled={currentStep === 0 || isSubmitting}
            className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-sm transition-all ${
              currentStep === 0 ? "opacity-0 pointer-events-none" : "text-gray-400 hover:text-gray-900"
            }`}
          >
            <ChevronLeft className="w-5 h-5" /> Back
          </motion.button>
          
          {currentStep < STEPS.length - 1 ? (
            <motion.button
              whileHover={{ scale: 1.02, x: 5 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={nextStep}
              className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-bold text-sm hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 flex items-center gap-2"
            >
              Continue <ChevronRight className="w-5 h-5" />
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSubmitting}
              className="bg-gray-900 text-white px-12 py-5 rounded-2xl font-bold text-lg hover:bg-blue-600 transition-all shadow-2xl shadow-gray-200 disabled:opacity-50 flex items-center gap-3"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Submit Request <CheckCircle className="w-6 h-6" />
                </>
              )}
            </motion.button>
          )}
        </div>
      </form>
    </div>
  );
}
