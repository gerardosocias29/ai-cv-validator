'use client';

import { useState } from 'react';
import { api } from "~/trpc/react";

export default function HomePage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    skills: '',
    experience: '',
    file: null as File | null,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: any) => {
    if (e.target.files?.[0]) {
      setFormData((prev: any) => ({ ...prev, file: e.target.files[0] }));
    }
  };

  const submitCv = api.cv.submitCv.useMutation({
    onSuccess: () => alert("CV submitted successfully!"),
    onError: (err: any) => alert("Error: " + err.message),
  });

  const uploadPdf = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) throw new Error("Upload failed");

    const data = await res.json();
    return data.url;
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.file) return alert("No file selected");

    const pdfUrl = await uploadPdf(formData.file);
    const origin = window.location.origin;
    const uploadedUrl = origin + pdfUrl;
    console.log("Mutating with:", {
      fullName: formData.name,
      email: formData.email,
      phone: formData.phone,
      skills: formData.skills,
      experience: formData.experience,
      uploadedUrl,
    });

    submitCv.mutate({
      fullName: formData.name,
      email: formData.email,
      phone: formData.phone,
      skills: formData.skills,
      experience: formData.experience,
      pdfUrl: uploadedUrl,
    });

    setFormData({
      name: '',
      email: '',
      phone: '',
      skills: '',
      experience: '',
      file: null,
    });

    console.log("Form submitted with data:", {
      fullName: formData.name,
      email: formData.email,
      phone: formData.phone,
      skills: formData.skills,
      experience: formData.experience,
      pdfUrl,
    });
  };

  return (
    <main className="max-w-xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6 text-center">AI CV Validator</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="name"
          placeholder="Full Name"
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded"
          required
        />
        <input
          name="email"
          placeholder="Email"
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded"
          required
        />
        <input
          name="phone"
          placeholder="Phone"
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded"
          required
        />
        <input
          name="skills"
          placeholder="Skills (comma separated)"
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded"
          required
        />
        <textarea
          name="experience"
          placeholder="Experience"
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded"
          required
        />
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="w-full"
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
        >
          Submit
        </button>
      </form>
    </main>
  );
}
