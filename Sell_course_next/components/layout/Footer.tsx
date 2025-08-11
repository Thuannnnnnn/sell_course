"use client";
import React from "react";
import logo from "../../public/logo.png";
import Image from "next/image";
import { CertificateVerifyDialog } from "../certificates/CertificateVerifyDialog";
export function Footer() {
  return (
    <footer className="w-full py-12 md:py-16 lg:py-20 border-t bg-background flex items-start justify-center">
      <div className="container px-4 md:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 justify-items-start text-left max-w-4xl mx-auto">
          <div className="flex flex-col space-y-4 text-start">
            <div className="flex items-center gap-2 justify-start">
              <Image
                src={logo}
                alt="Course Master Logo"
                width={100}
                height={100}
                className="h-10 w-10 rounded-full"
              />
              <span className="font-bold text-xl">Course Master</span>
            </div>
            <p className="text-muted-foreground max-w-xs text-start mx-auto">
              Empowering learners worldwide with quality education and expert
              instruction.
            </p>
          </div>
          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-base">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="/"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="/courses"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Courses
                </a>
              </li>
              <li>
                <a
                  href="/about"
                  className="text-muted-foreground hover:text-foreground"
                >
                  About Us
                </a>
              </li>
              <li>
          <CertificateVerifyDialog />
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-semibold text-base">Policies</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Refund Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Cookie Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground"
                >
                  FAQ
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-6 border-t text-center text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} Course Master. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
