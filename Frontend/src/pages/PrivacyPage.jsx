import React from "react";
import { Link } from "react-router-dom";
import {
  FaArrowLeft,
  FaShieldAlt,
  FaUserShield,
  FaDatabase,
  FaLock,
  FaCookieBite,
  FaEnvelope,
  FaUserEdit,
  FaBalanceScale,
  FaSlideshare,
  FaInfoCircle,
} from "react-icons/fa";

const PrivacyPage = () => {
  return (
    <main className="min-h-screen bg-white dark:bg-panel-dark">
      {/* Hero */}

      <section className="border-b border-primary-100 dark:border-white/5 bg-primary-100 dark:bg-primary-900/20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 dark:text-primary-300 hover:gap-3 transition-all duration-200"
          >
            <FaArrowLeft size={13} />
            Back to home
          </Link>

          <div className="mt-6">
            <div className="flex items-baseline gap-2 text-sm font-mono uppercase tracking-[0.18em] text-warn">
              <FaShieldAlt size={13} />
              Documentation
            </div>

            <h1 className="mt-2 font-display text-3xl sm:text-4xl font-bold text-ink-light dark:text-ink-dark">
              Privacy Policy
            </h1>

            <p className="mt-3 max-w-2xl text-sm sm:text-base text-muted-light dark:text-muted-dark">
              Learn how EduTech collects, uses, stores, and protects information
              when you use our learning platform.
            </p>

            <p className="mt-4 text-xs font-mono text-muted-light dark:text-muted-dark">
              Last updated: August 10, 2026
            </p>
          </div>
        </div>
      </section>

      {/* Privacy Description */}

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        <article className="">
          {/* Overview */}
          <section id="overview" className="scroll-mt-24">
            <div className="flex items-center gap-3">
              <FaShieldAlt className="text-primary-500" size={17} />

              <h2 className="font-display text-xl sm:text-2xl font-semibold text-ink-light dark:text-ink-dark">
                Overview
              </h2>
            </div>

            <p className="mt-4 text-sm sm:text-base leading-7 text-muted-light dark:text-muted-dark">
              This Privacy Policy explains how EduTech handles information
              associated with your use of the platform. EduTech is designed to
              provide courses, coding practice, tests, and other developer
              learning experiences in one workspace.
            </p>

            <p className="mt-4 text-sm sm:text-base leading-7 text-muted-light dark:text-muted-dark">
              By using EduTech, you acknowledge that information may be collected
              and processed as necessary to provide and improve the platform.
            </p>
          </section>

          <div className="my-10 h-px bg-primary-100 dark:bg-white/5" />

          {/* Information */}
          <section id="information" className="scroll-mt-24">
            <div className="flex items-center gap-3">
              <FaDatabase className="text-primary-500" size={17} />

              <h2 className="font-display text-xl sm:text-2xl font-semibold text-ink-light dark:text-ink-dark">
                Information We Collect
              </h2>
            </div>

            <p className="mt-4 text-sm sm:text-base leading-7 text-muted-light dark:text-muted-dark">
              Depending on how you use EduTech, we may collect information that
              helps us provide your account and learning experience.
            </p>

            <div className="mt-5 space-y-3">
              {[
                [
                  "Account information",
                  "Information such as your name and email address when you create or manage an account.",
                ],
                [
                  "Learning activity",
                  "Course progress, completed lessons, practice activity, test results, and related learning information.",
                ],
                [
                  "Technical information",
                  "Basic information about your browser, device, and interactions with the platform may be collected to maintain and improve the service.",
                ],
              ].map(([title, description]) => (
                <div
                  key={title}
                  className="rounded-xl border border-primary-100 dark:border-white/5 bg-primary-50/40 dark:bg-white/2 p-4"
                >
                  <h3 className="text-sm font-semibold text-ink-light dark:text-ink-dark">
                    {title}
                  </h3>

                  <p className="mt-1.5 text-sm leading-6 text-muted-light dark:text-muted-dark">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <div className="my-10 h-px bg-primary-100 dark:bg-white/5" />

          {/* Usage */}
          <section id="usage" className="scroll-mt-24">
            <div className="flex items-center gap-3">
              <FaInfoCircle className="text-primary-500" size={17} />

              <h2 className="font-display text-xl sm:text-2xl font-semibold text-ink-light dark:text-ink-dark">
                How We use Information
              </h2>
            </div>

            <p className="mt-4 text-sm sm:text-base leading-7 text-muted-light dark:text-muted-dark">
              Information may be used to operate your account, provide course
              and practice functionality, maintain learning progress, improve
              platform performance, and communicate important account or service
              information.
            </p>

            <ul className="mt-5 space-y-3">
              {[
                "Provide and maintain EduTech features.",
                "Save and display your learning progress.",
                "Personalize your learning experience.",
                "Improve platform functionality and reliability.",
                "Protect the platform against misuse or unauthorized activity.",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-sm leading-6 text-muted-light dark:text-muted-dark"
                >
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-500" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <div className="my-10 h-px bg-primary-100 dark:bg-white/5" />

          {/* Storage */}
          <section id="storage" className="scroll-mt-24">
            <div className="flex items-center gap-3">
              <FaLock className="text-primary-500" size={16} />

              <h2 className="font-display text-xl sm:text-2xl font-semibold text-ink-light dark:text-ink-dark">
                Data Storage & Security
              </h2>
            </div>

            <p className="mt-4 text-sm sm:text-base leading-7 text-muted-light dark:text-muted-dark">
              We take reasonable measures to protect information used by the
              platform. Access controls, authentication mechanisms, and
              appropriate technical safeguards may be used to reduce the risk of
              unauthorized access, alteration, or disclosure.
            </p>

            <div className="mt-5 rounded-xl bg-primary-50 dark:bg-primary-900/20 p-5">
              <p className="text-sm font-medium text-ink-light dark:text-ink-dark">
                Security note
              </p>

              <p className="mt-2 text-sm leading-6 text-muted-light dark:text-muted-dark">
                No online service can guarantee absolute security. Users should
                also take reasonable steps to protect their account credentials.
              </p>
            </div>
          </section>

          <div className="my-10 h-px bg-primary-100 dark:bg-white/5" />

          {/* Cookies */}
          <section id="cookies" className="scroll-mt-24">
            <div className="flex items-center gap-3">
              <FaCookieBite className="text-primary-500" size={17} />

              <h2 className="font-display text-xl sm:text-2xl font-semibold text-ink-light dark:text-ink-dark">
                Cookies & Local Storage
              </h2>
            </div>

            <p className="mt-4 text-sm sm:text-base leading-7 text-muted-light dark:text-muted-dark">
              EduTech may use browser storage technologies such as cookies, local
              storage, or session storage for authentication, preferences, and
              maintaining parts of your learning experience.
            </p>

            <p className="mt-4 text-sm sm:text-base leading-7 text-muted-light dark:text-muted-dark">
              The specific technologies used may vary depending on the features
              and authentication methods implemented on the platform.
            </p>
          </section>

          <div className="my-10 h-px bg-primary-100 dark:bg-white/5" />

          {/* Sharing */}
          <section id="sharing" className="scroll-mt-24">
            <div className="flex items-center gap-3">
              <FaSlideshare Scale className="text-primary-500" size={17} />

              <h2 className="font-display text-xl sm:text-2xl font-semibold text-ink-light dark:text-ink-dark">
                Data Sharing
              </h2>
            </div>

            <p className="mt-4 text-sm sm:text-base leading-7 text-muted-light dark:text-muted-dark">
              EduTech does not intend to sell your personal information.
              Information may be shared with service providers when necessary to
              operate specific platform functionality, maintain infrastructure,
              provide authentication, or deliver other requested services.
            </p>

            <p className="mt-4 text-sm sm:text-base leading-7 text-muted-light dark:text-muted-dark">
              Information may also be disclosed when required by applicable law
              or when reasonably necessary to protect the rights, security, and
              integrity of the platform.
            </p>
          </section>

          <div className="my-10 h-px bg-primary-100 dark:bg-white/5" />

          {/* Rights */}
          <section id="rights" className="scroll-mt-24">
            <div className="flex items-center gap-3">
              <FaBalanceScale className="text-primary-500" size={17} />

              <h2 className="font-display text-xl sm:text-2xl font-semibold text-ink-light dark:text-ink-dark">
                Your Privacy Rights
              </h2>
            </div>

            <p className="mt-4 text-sm sm:text-base leading-7 text-muted-light dark:text-muted-dark">
              Depending on applicable law, you may have rights regarding the
              personal information associated with your account. These may
              include requesting access, correction, deletion, or information
              about how your data is processed.
            </p>

            <p className="mt-4 text-sm sm:text-base leading-7 text-muted-light dark:text-muted-dark">
              To make a privacy-related request, contact us using the
              information provided below.
            </p>
          </section>

          <div className="my-10 h-px bg-primary-100 dark:bg-white/5" />

          {/* Changes */}
          <section id="changes" className="scroll-mt-24">
            <div className="flex items-center gap-3">
              <FaUserEdit className="text-primary-500" size={17} />

              <h2 className="font-display text-xl sm:text-2xl font-semibold text-ink-light dark:text-ink-dark">
                Changes to This Policy
              </h2>
            </div>

            <p className="mt-4 text-sm sm:text-base leading-7 text-muted-light dark:text-muted-dark">
              This Privacy Policy may be updated as EduTech evolves. When changes
              are made, the updated version will be posted on this page along
              with a revised update date.
            </p>
          </section>

          <div className="my-10 h-px bg-primary-100 dark:bg-white/5" />

          {/* Acknowlegement */}
          <section id="contact" className="scroll-mt-24">
            <div className="rounded-2xl border border-primary-100 dark:border-white/5 bg-primary-50/50 dark:bg-primary-900/10 p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-500 text-white">
                <FaUserShield size={17} />
              </div>

              <h2 className="mt-4 font-display text-xl font-semibold text-ink-light dark:text-ink-dark">
                Your privacy matters
              </h2>

              <p className="mt-2 text-sm leading-6 text-muted-light dark:text-muted-dark">
                We aim to keep your learning experience secure, transparent, and
                trustworthy while giving you control over your account and
                personal information.
              </p>
            </div>
          </section>

          {/* Footer note */}
          <p className="mt-10 text-xs leading-5 text-muted-light dark:text-muted-dark">
            This page is intended to explain EduTech's general privacy practices.
            Update the policy with your actual data practices, legal
            requirements, and contact information before using it as a formal
            legal document.
          </p>
        </article>
      </div>
    </main>
  );
};

export default PrivacyPage;
