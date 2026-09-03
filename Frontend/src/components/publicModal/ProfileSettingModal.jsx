import React, { useEffect, useRef, useState } from "react";
import { FaCamera, FaSave, FaUser } from "react-icons/fa";
import api from "../../config/Api.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { RxCross2 } from "react-icons/rx";
import { MdError } from "react-icons/md";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";

const ProfileSettingsModal = ({ onClose }) => {
  const { user, setUser } = useAuth();

  const [form, setForm] = useState({
    fullName: user?.fullName || "",
    mobileNumber: user?.mobileNumber || "",
    bio:
      user?.bio ||
      "Full-stack developer in progress - Learn. Practice. Progress.",
  });

  const [profileImage, setProfileImage] = useState(
    user?.profileImage?.url || "",
  );

  const [formMessage, setFormMessage] = useState({
    type: "",
    text: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const modalContentRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    setForm({
      fullName: user.fullName || "",
      mobileNumber: user.mobileNumber || "",
      bio:
        user.bio ||
        "Full-stack developer in progress - Learn. Practice. Progress.",
    });

    setProfileImage(user.profileImage?.url || "");
  }, [user]);

  // Handle input
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle image
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Profile image must be less than 2MB.");
      return;
    }

    setImageFile(file);

    const preview = URL.createObjectURL(file);
    setProfileImage(preview);
  };

  // Save profile
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (modalContentRef.current) {
      modalContentRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }

    setFormMessage({
      type: "",
      text: "",
    });

    if (!form.fullName.trim()) {
      setFormMessage({
        type: "error",
        text: "Full name is required.",
      });
      return;
    }

    if (form.mobileNumber && !/^[6-9]\d{9}$/.test(form.mobileNumber)) {
      setFormMessage({
        type: "error",
        text: "Please enter a valid Indian mobile number.",
      });
      return;
    }

    if (form.bio.length > 250) {
      setFormMessage({
        type: "error",
        text: "Bio cannot exceed 250 characters.",
      });
      return;
    }

    try {
      setIsSaving(true);

      const formData = new FormData();

      formData.append("fullName", form.fullName.trim());
      formData.append("mobileNumber", form.mobileNumber.trim());
      formData.append("bio", form.bio.trim());

      if (imageFile) {
        formData.append("profileImage", imageFile);
      }

      const res = await api.put("/user/profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const updatedUser = res?.data?.data;

      if (updatedUser) {
        setUser(updatedUser);
      }

      setImageFile(null);

      setFormMessage({
        type: "success",
        text: res?.data?.message || "Profile updated successfully.",
      });

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error("Profile update error:", error);

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Unable to update profile.";

      setFormMessage({
        type: "error",
        text: message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        ref={modalContentRef}
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-lg bg-white shadow-xl dark:bg-panel-dark"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-primary-100 px-5 py-4 dark:border-white/5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary-500 dark:bg-primary-900/20">
              <FaUser size={13} />
            </div>

            <h2 className=" text-lg font-semibold text-ink-light dark:text-ink-dark">
              Edit profile
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-muted-light transition-colors hover:bg-primary-100 dark:bg-white/5 dark:text-muted-dark dark:hover:bg-white/10 cursor-pointer"
            aria-label="Close Change Password"
          >
            <RxCross2 className="text-red-500" size={17} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6">
          {/* Error or Success Message  */}

          {formMessage.text && (
            <div
              className={`flex items-center justify-center gap-3 mb-4 rounded-lg border px-3 py-2.5 text-xs ${
                formMessage.type === "success"
                  ? "border-green-200 bg-green-50 text-green-600 dark:border-green-500/20 dark:bg-green-500/10 dark:text-green-400"
                  : "border-red-200 bg-red-50 text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400"
              }`}
            >
              <span>
                {formMessage.type === "success" ? (
                  <IoMdCheckmarkCircleOutline size={13} />
                ) : (
                  <MdError size={13} />
                )}
              </span>
              {formMessage.text}
            </div>
          )}

          {/* Profile Image */}
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 shrink-0">
              <div className="h-16 w-16 overflow-hidden rounded-full border border-primary-200 bg-primary-50 dark:border-white/10 dark:bg-white/5">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt={form.fullName || "Profile"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-primary-500">
                    {form.fullName?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                )}
              </div>

              <label
                htmlFor="profile-image"
                className="absolute bottom-0 right-0 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-primary-500 text-white shadow-md hover:bg-primary-600"
                title="Change profile photo"
              >
                <FaCamera size={8} />
              </label>

              <input
                id="profile-image"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>

            <div>
              <p className="text-xs font-medium text-ink-light dark:text-ink-dark">
                Profile photo
              </p>

              <p className="mt-1 text-[10px] text-muted-light dark:text-muted-dark">
                JPG, PNG or WEBP. Maximum 2MB.
              </p>
            </div>
          </div>

          {/* Full name */}
          <div className="mt-5">
            <label className="mb-1.5 block text-xs font-medium text-ink-light dark:text-ink-dark">
              Full name
            </label>

            <input
              name="fullName"
              type="text"
              value={form.fullName}
              onChange={handleChange}
              className="w-full rounded-lg border border-primary-200 bg-white px-4 py-2.5 text-sm text-ink-light outline-none focus:border-primary-500 dark:border-primary-800 dark:bg-panel-dark dark:text-ink-dark"
            />
          </div>

          {/* Email - READ ONLY */}
          <div className="mt-4">
            <label className="mb-1.5 block text-xs font-medium text-ink-light dark:text-ink-dark">
              Email
            </label>

            <input
              type="email"
              value={user?.email || ""}
              disabled
              className="w-full cursor-not-allowed rounded-lg border border-primary-200 bg-primary-50 px-4 py-2.5 text-sm text-muted-light outline-none dark:border-primary-800 dark:bg-white/5 dark:text-muted-dark"
            />

            <p className="mt-1.5 text-[10px] text-warn">
              Your registered email cannot be changed.
            </p>
          </div>

          {/* Mobile */}
          <div className="mt-4">
            <label className="mb-1.5 block text-xs font-medium text-ink-light dark:text-ink-dark">
              Mobile number
            </label>

            <input
              name="mobileNumber"
              type="tel"
              value={form.mobileNumber}
              onChange={handleChange}
              maxLength={10}
              placeholder="9876543210"
              className="w-full rounded-lg border border-primary-200 bg-white px-4 py-2.5 text-sm text-ink-light outline-none focus:border-primary-500 dark:border-primary-800 dark:bg-panel-dark dark:text-ink-dark"
            />
          </div>

          {/* Bio */}
          <div className="mt-4">
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-xs font-medium text-ink-light dark:text-ink-dark">
                Bio
              </label>

              <span className="text-[10px] text-muted-light dark:text-muted-dark">
                {form.bio.length}/250
              </span>
            </div>

            <textarea
              name="bio"
              rows={3}
              maxLength={250}
              value={form.bio}
              onChange={handleChange}
              className="w-full resize-none rounded-lg border border-primary-200 bg-white px-4 py-2.5 text-sm text-ink-light outline-none focus:border-primary-500 dark:border-primary-800 dark:bg-panel-dark dark:text-ink-dark"
            />
          </div>

          {/* Actions */}
          <div className="mt-5 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-primary-200 px-4 py-2.5 text-xs font-medium text-ink-light transition-colors hover:bg-primary-50 dark:border-primary-800 dark:text-ink-dark dark:hover:bg-white/5 cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary-500 px-4 py-2.5 text-xs font-medium text-white transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
            >
              <FaSave size={10} />
              {isSaving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileSettingsModal;
