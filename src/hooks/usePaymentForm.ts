
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface FormData {
  name: string;
  email: string;
}

export const usePaymentForm = () => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    // Load pending user data from localStorage
    const pendingUser = localStorage.getItem('pendingUser');
    if (pendingUser) {
      const userData = JSON.parse(pendingUser);
      setFormData(prev => ({
        ...prev,
        name: userData.name || "",
        email: userData.email || ""
      }));
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePlanSelect = (planId: string, gateway: string) => {
    toast({
      title: "Redirecting to Payment",
      description: `Opening ${gateway} payment gateway...`,
    });
  };

  return {
    formData,
    handleInputChange,
    handlePlanSelect
  };
};
