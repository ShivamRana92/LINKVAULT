import { useState } from "react";
import axios from "axios";

function Upload() {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [link, setLink] = useState("");
  const [expiry, setExpiry] = useState("");
  const [maxViews, setMaxViews] = useState("");
  const [oneTime, setOneTime] = useState(false);
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!text && !file) {
      return alert("Enter text or select a file");
    }

    if (text && text.length > 5000) {
      return alert("Text exceeds 5000 characters");
    }

    if (expiry) {
      const selectedDate = new Date(expiry);
      if (selectedDate <= new Date()) {
        return alert("Expiry date cannot be in the past");
      }
    }

    if (!oneTime && maxViews && Number(maxViews) <= 0) {
      return alert("Maximum views must be greater than 0");
    }

    try {
      setLoading(true);

      const formData = new FormData();

      if (text) formData.append("text", text);
      if (file) formData.append("file", file);

      if (expiry) {
        formData.append("expiryDateTime", expiry);
      }

      if (oneTime) {
        formData.append("maxViews", 1);
      } else if (maxViews) {
        formData.append("maxViews", maxViews);
      }

      if (password.trim() !== "") {
        formData.append("password", password);
      }

      const res = await axios.post(
        "http://localhost:5000/api/content/upload",
        formData
      );

      setLink(res.data.link);
      setCopied(false);

      // 🔥 Reset form after success
      setText("");
      setFile(null);
      setExpiry("");
      setMaxViews("");
      setOneTime(false);
      setPassword("");

    } catch (err) {
      alert(err.response?.data?.error || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-lg">
        <h1 className="text-2xl font-bold mb-4 text-center">
          LinkVault
        </h1>

        {/* TEXT INPUT */}
        <textarea
          className="w-full border rounded-lg p-3 mb-1"
          rows="5"
          maxLength={5000}
          placeholder="Enter text to store..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        {/* Character Counter */}
        {text && (
          <p className="text-xs text-gray-500 mb-3 text-right">
            {text.length}/5000 characters
          </p>
        )}

        {/* FILE INPUT */}
        <input
          type="file"
          className="w-full mb-4"
          onChange={(e) => setFile(e.target.files[0])}
        />

        {/* EXPIRY INPUT */}
        <label className="block mb-1 font-medium">
          Optional Expiry Date & Time
        </label>
        <input
          type="datetime-local"
          className="w-full border rounded-lg p-2 mb-1"
          value={expiry}
          onChange={(e) => setExpiry(e.target.value)}
        />

        <p className="text-sm text-gray-500 mb-4">
          If no expiry is selected, content expires after <strong>10 minutes</strong>.
        </p>

        {/* PASSWORD FIELD */}
        <label className="block mb-1 font-medium">
          Optional Password Protection
        </label>
        <input
          type="password"
          placeholder="Protect this link"
          className="w-full border rounded-lg p-2 mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* ONE-TIME VIEW CHECKBOX */}
        <div className="flex items-center mb-3">
          <input
            type="checkbox"
            className="mr-2"
            checked={oneTime}
            onChange={(e) => {
              setOneTime(e.target.checked);
              if (e.target.checked) {
                setMaxViews("");
              }
            }}
          />
          <label>One-Time View Link</label>
        </div>

        {/* MAX VIEWS INPUT */}
        <label className="block mb-1 font-medium">
          Optional Maximum Views
        </label>
        <input
          type="number"
          min="1"
          disabled={oneTime}
          placeholder="Leave empty for unlimited"
          className={`w-full border rounded-lg p-2 mb-4 ${
            oneTime ? "bg-gray-200 cursor-not-allowed" : ""
          }`}
          value={maxViews}
          onChange={(e) => setMaxViews(e.target.value)}
        />

        {/* SUBMIT BUTTON */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`w-full py-3 rounded-lg font-semibold transition ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:opacity-90"
          }`}
        >
          {loading ? "Generating..." : "Generate Link"}
        </button>

        {/* GENERATED LINK */}
        {link && (
          <div className="mt-4 p-4 bg-gray-100 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Your Link:</p>

            <div className="flex items-center gap-2">
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 break-all flex-1"
              >
                {link}
              </a>

              <button
                onClick={handleCopy}
                className="bg-gray-800 text-white px-3 py-1 rounded-md text-sm hover:bg-gray-700 transition"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Upload;
