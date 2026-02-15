import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function View() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [content, setContent] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [requirePassword, setRequirePassword] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  /* ================= FETCH CONTENT ================= */

  const fetchContent = async (enteredPassword = "") => {
    try {
      setLoading(true);
      setError("");
      setPasswordError("");

      const res = await axios.post(
        `http://localhost:5000/api/content/${id}`,
        enteredPassword ? { password: enteredPassword } : {}
      );

      setContent(res.data);
      setRequirePassword(false);

    } catch (err) {
      if (err.response?.status === 401) {
        setRequirePassword(true);
      } else if (err.response?.status === 403 || err.response?.status === 410) {
        setError(err.response?.data?.error || "Invalid or expired link");
      } else {
        setError("Content not found or expired.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, [id]);

  /* ================= PASSWORD SUBMIT ================= */

  const handlePasswordSubmit = () => {
    if (!password.trim()) {
      setPasswordError("Password is required");
      return;
    }
    fetchContent(password);
  };

  /* ================= COPY TEXT ================= */

  const handleCopy = () => {
    navigator.clipboard.writeText(content.text);
    alert("Copied to clipboard");
  };

  /* ================= DOWNLOAD FILE ================= */

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = `http://localhost:5000${content.fileUrl}`;
    link.download = content.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /* ================= MANUAL DELETE (FIXED) ================= */

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this content?"
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(
        `http://localhost:5000/api/content/${id}`,
        {
          data: password ? { password } : {}
        }
      );

      alert("Content deleted successfully");
      navigate("/");

    } catch (err) {

      // If password required
      if (err.response?.status === 401) {
        const entered = prompt("Enter password to delete:");

        if (!entered) return;

        try {
          await axios.delete(
            `http://localhost:5000/api/content/${id}`,
            {
              data: { password: entered }
            }
          );

          alert("Content deleted successfully");
          navigate("/");

        } catch (innerErr) {
          alert(innerErr.response?.data?.error || "Delete failed");
        }

      } else {
        alert(err.response?.data?.error || "Delete failed");
      }
    }
  };

  /* ================= VIEW LOGIC ================= */

  const remainingViews =
    content?.maxViews !== null &&
    content?.maxViews !== undefined
      ? content.maxViews - content.viewsUsed
      : null;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-lg text-center">

        <h2 className="text-xl font-bold mb-4">
          Stored Content
        </h2>

        {loading && <p>Loading...</p>}

        {error && !loading && (
          <p className="text-red-500">{error}</p>
        )}

        {/* PASSWORD PROMPT */}
        {requirePassword && !loading && (
          <>
            <p className="mb-3">This content is password protected.</p>

            <input
              type="password"
              placeholder="Enter password"
              className="w-full border rounded-lg p-2 mb-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {passwordError && (
              <p className="text-red-500 text-sm mb-2">
                {passwordError}
              </p>
            )}

            <button
              onClick={handlePasswordSubmit}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
            >
              Unlock
            </button>
          </>
        )}

        {/* METADATA */}
        {content && !requirePassword && (
          <div className="text-sm text-gray-500 mb-4">
            <p>
              Expires At:{" "}
              {new Date(content.expiresAt).toLocaleString()}
            </p>

            {remainingViews !== null ? (
              <p>Remaining Views: {remainingViews}</p>
            ) : (
              <p>Unlimited Views</p>
            )}
          </div>
        )}

        {/* TEXT */}
        {content && content.type === "text" && !requirePassword && (
          <>
            <textarea
              value={content.text}
              readOnly
              className="w-full border rounded-lg p-3 mb-4"
              rows="5"
            />
            <button
              onClick={handleCopy}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition"
            >
              Copy to Clipboard
            </button>
          </>
        )}

        {/* FILE */}
        {content && content.type === "file" && !requirePassword && (
          <button
            onClick={handleDownload}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition"
          >
            Download File
          </button>
        )}

        {/* DELETE */}
        {content && !requirePassword && (
          <button
            onClick={handleDelete}
            className="bg-red-600 text-white px-4 py-2 rounded-lg mt-4 hover:opacity-90 transition"
          >
            Delete Content
          </button>
        )}

      </div>
    </div>
  );
}

export default View;
