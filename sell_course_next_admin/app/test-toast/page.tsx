"use client";

import { Button } from "../../components/ui/button";
import { toast } from "sonner";

export default function TestToast() {
  const testSuccess = () => {
    toast.success("This is a success toast!");
  };

  const testError = () => {
    toast.error("This is an error toast!");
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Toast Test</h1>
      <div className="space-x-4">
        <Button onClick={testSuccess} className="bg-green-500 hover:bg-green-600">
          Test Success Toast
        </Button>
        <Button onClick={testError} className="bg-red-500 hover:bg-red-600">
          Test Error Toast
        </Button>
      </div>
    </div>
  );
}
