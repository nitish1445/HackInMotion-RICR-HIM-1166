import React, { useState } from "react";
import {
  FaArrowRight,
  FaBug,
  FaComments,
  FaEnvelope,
  FaLightbulb,
  FaPaperPlane,
  FaQuestionCircle,
  FaShieldAlt,
} from "react-icons/fa";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    type: "General question",
    subject: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log(formData);

    setSubmitted(true);

    setFormData({
      name: "",
      email: "",
      type: "General question",
      subject: "",
      message: "",
    });
  };

  const contactOptions = [
    {
      icon: <FaQuestionCircle size={15} />,
      title: "General questions",
      description:
        "Questions about courses, learning plans, AI assistance, or how EduTech works.",
    },
    {
      icon: <FaBug size={15} />,
      title: "Report a problem",
      description:
        "Something isn't working as expected? Tell us what happened.",
    },
    {
      icon: <FaLightbulb size={15} />,
      title: "Share an idea",
      description:
        "Have an idea that could make studying better? We'd like to hear it.",
    },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* HERO */}
      <section className="relative grid-fade overflow-hidden">
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-14 sm:py-18">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary-50 dark:bg-primary-900/20 px-3 py-1.5 text-[10px] font-mono uppercase tracking-[0.18em] text-primary-600 dark:text-primary-300">
              <FaComments size={10} />
              EduTech support
            </div>

            <h1 className="mt-5 font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-ink-light dark:text-ink-dark">
              Let's make your{" "}
              <span className="text-primary-500">learning better.</span>
            </h1>

            <p className="mt-4 max-w-2xl text-sm sm:text-base leading-7 text-muted-light dark:text-muted-dark">
              Whether you're stuck on a concept, found a problem, or have an
              idea for EduTech, we're here to listen.
            </p>
          </div>
        </div>
      </section>

      {/* CONTACT OPTIONS */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-4">
          {contactOptions.map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-primary-100 dark:border-white/5 bg-white dark:bg-panel-dark p-5 shadow-soft"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-900/30 text-primary-500">
                {item.icon}
              </div>

              <h3 className="mt-4 font-display font-semibold text-ink-light dark:text-ink-dark">
                {item.title}
              </h3>

              <p className="mt-2 text-sm leading-6 text-muted-light dark:text-muted-dark">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* MAIN CONTACT AREA */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid lg:grid-cols-[0.7fr_1.3fr] gap-8">
          {/* LEFT */}
          <div className="rounded-2xl bg-linear-to-br from-dark to-primary-600 p-7 sm:p-8 text-white">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
              <FaEnvelope size={16} />
            </div>

            <h2 className="mt-5 font-display text-2xl font-semibold">
              Have something to tell us?
            </h2>

            <p className="mt-3 text-sm leading-6 text-white/65">
              Send us a message and give us as much context as possible. Whether
              it's a question or a bug report, the more we know, the better we
              can help.
            </p>

            <div className="mt-8 space-y-4">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-wider text-white/40">
                  Support
                </p>

                <a
                  href="mailto:sarainitish@gmail.com"
                  className="mt-1 block text-sm text-white hover:underline"
                >
                  sarainitish@gmail.com
                </a>
              </div>

              <div>
                <p className="text-[10px] font-mono uppercase tracking-wider text-white/40">
                  Product
                </p>

                <p className="mt-1 text-sm text-white/75">
                  AI Learning Assistant
                </p>
              </div>
            </div>

            <div className="mt-10 border-t border-white/10 pt-5">
              <div className="flex gap-3">
                <FaShieldAlt size={14} className="mt-0.5 text-white/60" />

                <p classNaedutechme="text-[11px] leading-5 text-white/50">
                  Never send passwords, authentication codes, or other sensitive
                  account information through this form.
                </p>
              </div>
            </div>
          </div>

          {/* FORM */}
          <div className="rounded-2xl border border-primary-100 dark:border-white/5 bg-white dark:bg-panel-dark p-6 sm:p-8 shadow-soft">
            {submitted ? (
              <div className="min-h-120 flex items-center justify-center text-center">
                <div className="max-w-sm">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-900/30 text-primary-500">
                    <FaPaperPlane size={17} />
                  </div>

                  <h2 className="mt-5 font-display text-xl font-semibold text-ink-light dark:text-ink-dark">
                    Message sent.
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-muted-light dark:text-muted-dark">
                    Thanks for reaching out. Your message has been received by
                    the EduTech team.
                  </p>

                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary-600 dark:text-primary-300 hover:underline"
                  >
                    Send another message
                    <FaArrowRight size={9} />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <p className="text-xs font-mono uppercase tracking-[0.18em] text-primary-500">
                    Send a message
                  </p>

                  <h2 className="mt-1 font-display text-xl sm:text-2xl font-semibold text-ink-light dark:text-ink-dark">
                    How can we help?
                  </h2>

                  <p className="mt-2 text-sm text-muted-light dark:text-muted-dark">
                    We'll use your message to understand what you need.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="mt-7 space-y-5">
                  {/* NAME + EMAIL */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="name"
                        className="mb-1.5 block text-sm font-medium text-ink-light dark:text-ink-dark"
                      >
                        Name
                      </label>

                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Your name"
                        className="w-full rounded-lg border border-primary-200 dark:border-primary-800 bg-white dark:bg-panel-dark px-4 py-2.5 text-sm text-ink-light dark:text-ink-dark placeholder:text-muted-light/60 dark:placeholder:text-muted-dark/60 outline-none focus:border-primary-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="mb-1.5 block text-sm font-medium text-ink-light dark:text-ink-dark"
                      >
                        Email
                      </label>

                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        className="w-full rounded-lg border border-primary-200 dark:border-primary-800 bg-white dark:bg-panel-dark px-4 py-2.5 text-sm text-ink-light dark:text-ink-dark placeholder:text-muted-light/60 dark:placeholder:text-muted-dark/60 outline-none focus:border-primary-500 transition-colors"
                      />
                    </div>
                  </div>

                  {/* TYPE */}
                  <div>
                    <label
                      htmlFor="type"
                      className="mb-1.5 block text-sm font-medium text-ink-light dark:text-ink-dark"
                    >
                      What is this about?
                    </label>

                    <select
                      id="type"
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-primary-200 dark:border-primary-800 bg-white dark:bg-panel-dark px-4 py-2.5 text-sm text-ink-light dark:text-ink-dark outline-none focus:border-primary-500 transition-colors"
                    >
                      <option>General question</option>
                      <option>Report a problem</option>
                      <option>Share an idea</option>
                      <option>AI assistant issue</option>
                      <option>Study plan issue</option>
                      <option>Account issue</option>
                    </select>
                  </div>

                  {/* SUBJECT */}
                  <div>
                    <label
                      htmlFor="subject"
                      className="mb-1.5 block text-sm font-medium text-ink-light dark:text-ink-dark"
                    >
                      Subject
                    </label>

                    <input
                      id="subject"
                      name="subject"
                      type="text"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="Briefly describe the issue"
                      className="w-full rounded-lg border border-primary-200 dark:border-primary-800 bg-white dark:bg-panel-dark px-4 py-2.5 text-sm text-ink-light dark:text-ink-dark placeholder:text-muted-light/60 dark:placeholder:text-muted-dark/60 outline-none focus:border-primary-500 transition-colors"
                    />
                  </div>

                  {/* MESSAGE */}
                  <div>
                    <label
                      htmlFor="message"
                      className="mb-1.5 block text-sm font-medium text-ink-light dark:text-ink-dark"
                    >
                      Message
                    </label>

                    <textarea
                      id="message"
                      name="message"
                      required
                      rows="7"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell us what happened or what you need help with..."
                      className="w-full resize-none rounded-lg border border-primary-200 dark:border-primary-800 bg-white dark:bg-panel-dark px-4 py-3 text-sm text-ink-light dark:text-ink-dark placeholder:text-muted-light/60 dark:placeholder:text-muted-dark/60 outline-none focus:border-primary-500 transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-primary-500 px-6 py-2.5 text-sm font-medium text-white shadow-soft hover:bg-primary-600 transition-colors"
                  >
                    <FaPaperPlane size={11} />
                    Send message
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
