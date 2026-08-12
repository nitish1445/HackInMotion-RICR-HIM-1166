import React from "react";
import { Link } from "react-router-dom";
import { FaRegHeart } from "react-icons/fa";
import logo from "../assets/image/logo.png";

const Footer = () => {
  return (
    <footer className="border-t border-primary-100 dark:border-white/5 bg-white dark:bg-panel-dark">
      <div className="mx-auto flex flex-col lg:flex-row justify-between items-center gap-2 px-4 sm:px-6 lg:px-16 py-5">
        {/* Copyright */}

        <p className="text-xs text-muted-light dark:text-muted-dark font-mono">
          © {new Date().getFullYear()} EduTech. All rights reserved.
        </p>

        {/* Right */}

        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
          {/* Privacy */}
          <Link
            to="/privacy"
            className="text-xs font-semibold text-ink-light dark:text-ink-dark hover:text-primary-600 dark:hover:text-primary-300 transition-colors duration-200"
          >
            Privacy
          </Link>

          {/* Divider */}
          <div className="hidden lg:block text-xs text-muted-light dark:text-muted-dark">
            |
          </div>

          {/* Documentation */}
          <Link
            to="/documentation"
            className="text-xs font-semibold text-ink-light dark:text-ink-dark hover:text-primary-600 dark:hover:text-primary-300 transition-colors duration-200"
          >
            Documentation
          </Link>

          {/* Divider */}
          <div className="hidden lg:block text-xs text-muted-light dark:text-muted-dark">
            |
          </div>

          {/* Developed */}
          <span className="text-xs font-normal flex items-center gap-1 text-muted-light dark:text-muted-dark">
            Developed with{" "}
            <span className="text-pink-500">
              <FaRegHeart size={12} />
            </span>{" "}
            for students.
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
