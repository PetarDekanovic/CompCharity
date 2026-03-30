import React, { useState, useRef } from "react";
import { Mic, Square, Loader2, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { transcribeAudio } from "../../services/geminiService";
import { toast } from "sonner";

interface VoiceRecorderProps {
  onTranscription: (text: string) => void;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onTranscription }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        
        // Auto-process transcription
        await processTranscription(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setAudioUrl(null);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      toast.error("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const processTranscription = async (blob: Blob) => {
    setIsProcessing(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64Data = (reader.result as string).split(",")[1];
        const transcription = await transcribeAudio(base64Data, "audio/webm");
        if (transcription) {
          onTranscription(transcription);
          toast.success("Voice message transcribed!");
        }
      };
    } catch (err) {
      console.error("Transcription error:", err);
      toast.error("Failed to transcribe audio.");
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setAudioUrl(null);
    chunksRef.current = [];
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
      <div className="flex items-center justify-between">
        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
          {isRecording ? "Recording..." : isProcessing ? "Processing..." : "Voice Message"}
        </div>
        {audioUrl && !isRecording && !isProcessing && (
          <button 
            onClick={reset}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-4">
        {!isRecording ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startRecording}
            disabled={isProcessing}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${
              isProcessing ? "bg-gray-200 text-gray-400" : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-100"
            }`}
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Mic className="w-4 h-4" />
            )}
            {isProcessing ? "Transcribing..." : "Record Voice"}
          </motion.button>
        ) : (
          <motion.button
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            onClick={stopRecording}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 text-white font-bold text-sm hover:bg-red-700 shadow-lg shadow-red-100"
          >
            <Square className="w-4 h-4" />
            Stop Recording
          </motion.button>
        )}

        {audioUrl && (
          <audio src={audioUrl} controls className="h-10 flex-grow" />
        )}
      </div>
      
      <p className="text-[10px] text-gray-400 font-medium italic">
        Tip: Describe your device, condition, and location for collection.
      </p>
    </div>
  );
};

export default VoiceRecorder;
