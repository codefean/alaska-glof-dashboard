import React, { useMemo, useState } from "react";
import emailjs from "@emailjs/browser";
import "./feedback.css";

/**
 * NOTES:
 * - Make sure your EmailJS template includes variables named exactly:
 *   {{to_email}}, {{subject}}, {{from_name}}, {{reply_to}},
 *   {{reportType}}, {{lat}}, {{lon}}, {{description}},
 *   {{reporterName}}, {{reporterEmail}}, {{okToContact}}
 * - In the EmailJS template, set the "To" field to {{to_email}} so the dynamic address is used.
 * - Use a verified sender for the service; the user's email goes in reply_to.
 */

const INITIAL = {
  reportType: "lake",
  lat: "",
  lon: "",
  description: "",
  reporterName: "",
  reporterEmail: "",
  okToContact: true,
  company: "" // honeypot (renamed; some bots fill business fields)
};

const SERVICE_ID = "service_pg8rqjs";
const TEMPLATE_ID = "template_990owcz";
const PUBLIC_KEY = "BWYbS8fXhgHn4moTc"; // EmailJS v4: pass as { publicKey: ... }
const TEAM_EMAIL = "UAS-GLOF-info@alaska.edu";

const isValidEmail = (v) => /^\S+@\S+\.\S+$/.test(v);

const Feedback = () => {
  const [form, setForm] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ state: "idle", msg: "" });

  const title = useMemo(
    () =>
      form.reportType === "lake"
        ? "Share a Glacial Lake Location"
        : "Share a Property Downstream of a Glacial Lake",
    [form.reportType]
  );

  // Clear the specific field's error as the user edits
  const update = (key) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((errs) => ({ ...errs, [key]: undefined }));
    setStatus((s) => (s.state === "error" ? { state: "idle", msg: "" } : s));
  };

  const validate = () => {
    const e = {};
    const lat = parseFloat(form.lat);
    const lon = parseFloat(form.lon);
    if (!Number.isFinite(lat) || lat < -90 || lat > 90) e.lat = "Latitude must be between -90 and 90.";
    if (!Number.isFinite(lon) || lon < -180 || lon > 180) e.lon = "Longitude must be between -180 and 180.";
    if (!form.description.trim()) e.description = "Please add a short location description.";
    if (form.reporterEmail && !isValidEmail(form.reporterEmail))
      e.reporterEmail = "Enter a valid email (or leave blank).";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      setStatus({ state: "error", msg: "Please fix the highlighted fields and try again." });
      return;
    }

    // Honeypot: if filled, treat as success but do nothing
    if (form.company) {
      console.warn("Honeypot triggered; not sending.");
      setStatus({ state: "success", msg: "Thanks! Your report was emailed to the team." });
      setForm(INITIAL);
      return;
    }

    setStatus({ state: "loading", msg: "Sending…" });

    try {
      const templateParams = {
        // Must match {{to_email}} in your EmailJS template's "To" field
        to_email: TEAM_EMAIL,

        // Strongly recommended for deliverability
        subject: `[GLOF Report] ${form.reportType === "lake" ? "Glacial Lake" : "Downstream Property"}`,
        from_name: "GLOF Web Form",
        reply_to: isValidEmail(form.reporterEmail) ? form.reporterEmail : undefined,

        // Payload
        reportType: form.reportType,
        lat: form.lat,
        lon: form.lon,
        description: form.description,
        reporterName: form.reporterName || "(not provided)",
        reporterEmail: isValidEmail(form.reporterEmail) ? form.reporterEmail : "",
        okToContact: form.okToContact ? "Yes" : "No",
      };

      // EmailJS v4 signature
      await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, { publicKey: PUBLIC_KEY });

      setStatus({ state: "success", msg: "Thanks! Your report was emailed to the team." });
      setForm(INITIAL);
    } catch (err) {
      // Surface as much detail as possible in dev; keep the fallback friendly.
      console.error("EmailJS error:", err);
      setStatus({
        state: "error",
        msg:
          `Couldn’t send from the site. You can still email ${TEAM_EMAIL} directly with your details.` +
          (err?.text || err?.message ? ` (${err.text || err.message})` : "")
      });
    } finally {
      // Guard against being stuck in loading if we ever add more async steps above.
      setStatus((s) => (s.state === "loading" ? { state: "idle", msg: s.msg } : s));
    }
  };

  return (
    <div className="feedback-container">
      <h2 className="feedback-title">Community Submitted Data</h2>
      <h3 className="feedback-subheading">{title}</h3>

      <div className="about-feedback">
        <p>
          Direct us to places to look at potential glacial lakes or properties downstream of existing or potential glacial lakes. Your submissions will be reviewed by the research team and may be included in future updates to the Glacial Lake Map.
        </p>
      </div>

      <form
        className="report-card"
        onSubmit={onSubmit}
        noValidate
        aria-busy={status.state === "loading"}
      >
        {/* Accessible honeypot:
            - Off-screen (not display:none) to avoid some autofill bots
            - Tabbable false
        */}
        <label
          htmlFor="company"
          style={{
            position: "absolute",
            left: "-10000px",
            top: "auto",
            width: "1px",
            height: "1px",
            overflow: "hidden"
          }}
          aria-hidden="true"
        >
          Company (leave blank)
        </label>
        <input
          id="company"
          type="text"
          name="company"
          value={form.company}
          onChange={update("company")}
          tabIndex={-1}
          autoComplete="off"
          style={{
            position: "absolute",
            left: "-10000px",
            top: "auto",
            width: "1px",
            height: "1px",
            overflow: "hidden"
          }}
          aria-hidden="true"
        />

        <fieldset className="report-fieldset">
          <legend className="report-legend">I’m reporting</legend>
          <div className="report-type-toggle" role="radiogroup" aria-label="Report type">
            <label className={`toggle-pill ${form.reportType === "lake" ? "active" : ""}`}>
              <input
                type="radio"
                name="reportType"
                value="lake"
                checked={form.reportType === "lake"}
                onChange={update("reportType")}
              />
              Glacial Lake
            </label>
            <label className={`toggle-pill ${form.reportType === "property" ? "active" : ""}`}>
              <input
                type="radio"
                name="reportType"
                value="property"
                checked={form.reportType === "property"}
                onChange={update("reportType")}
              />
              Property Downstream
            </label>
          </div>
        </fieldset>

        <div className="grid-2">
          <div className="form-group">
            <label htmlFor="lat">Latitude</label>
            <input
              id="lat"
              type="number"
              step="any"
              min={-90}
              max={90}
              placeholder="e.g., 58.3019"
              value={form.lat}
              onChange={update("lat")}
              aria-invalid={!!errors.lat}
              required
              inputMode="decimal"
              autoComplete="off"
            />
            {errors.lat && <span className="form-error">{errors.lat}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="lon">Longitude</label>
            <input
              id="lon"
              type="number"
              step="any"
              min={-180}
              max={180}
              placeholder="e.g., -134.4197"
              value={form.lon}
              onChange={update("lon")}
              aria-invalid={!!errors.lon}
              required
              inputMode="decimal"
              autoComplete="off"
            />
            {errors.lon && <span className="form-error">{errors.lon}</span>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="description">Location description</label>
          <textarea
            id="description"
            rows={4}
            placeholder="Nearest river/valley, access notes, how you identified it…"
            value={form.description}
            onChange={update("description")}
            aria-invalid={!!errors.description}
            required
            autoComplete="off"
          />
          {errors.description && <span className="form-error">{errors.description}</span>}
        </div>

        <div className="grid-2">
          <div className="form-group">
            <label htmlFor="reporterName">Your name (optional)</label>
            <input
              id="reporterName"
              type="text"
              value={form.reporterName}
              onChange={update("reporterName")}
              autoComplete="name"
            />
          </div>
          <div className="form-group">
            <label htmlFor="reporterEmail">Your email (optional)</label>
            <input
              id="reporterEmail"
              type="email"
              value={form.reporterEmail}
              onChange={update("reporterEmail")}
              aria-invalid={!!errors.reporterEmail}
              autoComplete="email"
              inputMode="email"
              placeholder="you@example.edu"
            />
            {errors.reporterEmail && <span className="form-error">{errors.reporterEmail}</span>}
          </div>
        </div>

        <label className="checkbox">
          <input
            type="checkbox"
            checked={form.okToContact}
            onChange={update("okToContact")}
          />
          The research team may contact me for clarification.
        </label>

        <div className="actions">
          <button className="btn-primary" disabled={status.state === "loading"}>
            {status.state === "loading" ? "Sending…" : "Submit report"}
          </button>
          {status.msg && (
            <p
              className="small-muted"
              role={status.state === "error" ? "alert" : "status"}
              aria-live="polite"
            >
              {status.msg}
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

export default Feedback;
