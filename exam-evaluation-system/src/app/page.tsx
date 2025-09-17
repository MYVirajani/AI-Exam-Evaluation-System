"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Brain,
  CheckCircle,
  ArrowRight,
  Users,
  BookOpen,
  Award,
  BarChart3,
  Clock,
  Shield,
} from "lucide-react";
import SignInPopup from "@/components/SignInPopup";
import SignupPopup from "@/components/SignupPopup";
import { siteConfig } from "@/config/site";

export default function Home() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Welcome Section */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-4xl font-bold text-gray-800 mb-4">
              Welcome to
            </h3>
            <h3 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 leading-snug mb-6">
              Smart Learning Management System
            </h3>

            <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto">
              {siteConfig.title} is an AI-powered exam evaluation and learning
              management platform designed for universities and educational
              institutions. Empower educators to streamline assessments,
              automate grading, and deliver insightful analytics all within a
              secure and scalable environment.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => setIsLoginOpen(true)}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 flex items-center space-x-2 font-semibold"
              >
                <span>Get Started</span>
                <ArrowRight className="w-5 h-5" />
              </button>
               <button
                onClick={() => router.push("/pricing-plans")}
                className="px-8 py-4 border-2 border-blue-200 text-blue-700 rounded-xl hover:bg-blue-50 transition-all duration-300 font-semibold"
              >
                System Guide
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-blue-50 rounded-xl">
              <Users className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <div className="text-lg font-semibold text-gray-800 mb-2">
                Role-Based Access
              </div>
              <div className="text-gray-600 text-sm">
                Secure login for educators and students based on their assigned
                roles
              </div>
            </div>
            <div className="text-center p-6 bg-green-50 rounded-xl">
              <BookOpen className="w-8 h-8 text-green-600 mx-auto mb-3" />
              <div className="text-lg font-semibold text-gray-800 mb-2">
                Exam Processing
              </div>
              <div className="text-gray-600 text-sm">
                Automated evaluation of various exam formats and types
              </div>
            </div>
            <div className="text-center p-6 bg-purple-50 rounded-xl">
              <Award className="w-8 h-8 text-purple-600 mx-auto mb-3" />
              <div className="text-lg font-semibold text-gray-800 mb-2">
                Multi-Module Support
              </div>
              <div className="text-gray-600 text-sm">
                Designed to support diverse programs, courses, and academic
                structures across institutions
              </div>
            </div>

            <div className="text-center p-6 bg-orange-50 rounded-xl">
              <Clock className="w-8 h-8 text-orange-600 mx-auto mb-3" />
              <div className="text-lg font-semibold text-gray-800 mb-2">
                Time Efficient
              </div>
              <div className="text-gray-600 text-sm">
                Significantly reduce grading time and workload
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* System Features */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-800 mb-4">
              System Capabilities
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Built to meet the academic needs of universities and institutions,
              {siteConfig.title} supports intelligent grading, insightful
              analytics, and secure assessment workflows.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <Brain className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="text-xl font-bold text-gray-800 mb-4">
                Intelligent Grading
              </h4>
              <p className="text-gray-600 leading-relaxed">
                AI-powered evaluation system trained on university's grading
                standards and rubrics. Consistent assessment across all
                departments and courses.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="text-xl font-bold text-gray-800 mb-4">
                Actionable Analytics
              </h4>
              <p className="text-gray-600 leading-relaxed">
                Comprehensive performance tracking and analytics for each
                module. Monitor student progress and identify areas for
                curriculum improvement.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="text-xl font-bold text-gray-800 mb-4">
                Secure & Private
              </h4>
              <p className="text-gray-600 leading-relaxed">
                Student data and exam results are securely stored within the
                institution’s infrastructure, ensuring privacy, compliance, and
                data integrity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* For Faculty Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold text-gray-800 mb-6">
                For Your University
              </h3>
              <p className="text-lg text-gray-600 mb-8">
                Simplify and enhance your evaluation workflow with tools built
                specifically for academic institutions from automated
                assessments to analytics and integrations.
              </p>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">
                      Department-Specific Rubrics
                    </h4>
                    <p className="text-gray-600 text-sm">
                      Pre-configured evaluation criteria for each department and
                      course type within your university.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">
                      Gradebook Integration
                    </h4>
                    <p className="text-gray-600 text-sm">
                      Seamless integration with your existing student
                      information system and gradebook platforms.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">
                      Review & Human Validation
                    </h4>
                    <p className="text-gray-600 text-sm">
                      Empowers lecturers to review, modify, and validate
                      AI-generated assessments, ensuring academic accuracy,
                      transparency, and human oversight in the grading process.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <button
                  onClick={() => setIsSignupOpen(true)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Get Your Access
                </button>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden shadow-lg">
              <img
                src="/images/HomePageImage.jpg"
                alt="Faculty using system"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Popups */}
      <SignInPopup
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSwitchToSignUp={() => {
          setIsLoginOpen(false);
          setIsSignupOpen(true);
        }}
      />
      <SignupPopup
        isOpen={isSignupOpen}
        onClose={() => setIsSignupOpen(false)}
        onSwitchToSignIn={() => {
          setIsSignupOpen(false);
          setIsLoginOpen(true);
        }}
      />
    </div>
  );
}
