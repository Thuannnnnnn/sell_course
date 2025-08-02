"use client";
import React from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Facebook, Twitter, Instagram, Linkedin, Youtube } from "lucide-react";
import logo from "../../public/logo.png";
import Image from "next/image";
export function Footer() {
  return (
    <footer className="w-full py-12 md:py-16 lg:py-20 border-t bg-background flex items-center justify-center">
      <div className="container px-4 md:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center gap-2">
              <Image
                src={logo}
                alt="Course Master Logo"
                width={100}
                height={100}
                className="h-10 w-10 rounded-full"
              />
              <span className="font-bold text-xl">Course Master</span>
            </div>
            <p className="text-muted-foreground">
              Empowering learners worldwide with quality education and expert
              instruction.
            </p>
            <div className="flex space-x-3">
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground"
              >
                <Facebook size={20} />
                <span className="sr-only">Facebook</span>
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground"
              >
                <Twitter size={20} />
                <span className="sr-only">Twitter</span>
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground"
              >
                <Instagram size={20} />
                <span className="sr-only">Instagram</span>
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground"
              >
                <Linkedin size={20} />
                <span className="sr-only">LinkedIn</span>
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground"
              >
                <Youtube size={20} />
                <span className="sr-only">YouTube</span>
              </a>
            </div>
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
            </ul>
          </div>
          {/* Policies */}
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
          {/* Newsletter */}
          <div className="space-y-4">
            <h4 className="font-semibold text-base">
              Subscribe to our Newsletter
            </h4>
            <p className="text-muted-foreground">
              Get the latest updates and offers
            </p>
            <div className="flex space-x-2">
              <Input
                type="email"
                placeholder="Your email"
                className="max-w-[220px]"
              />
              <Button type="submit">Subscribe</Button>
            </div>
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
