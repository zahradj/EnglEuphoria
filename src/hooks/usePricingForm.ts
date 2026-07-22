
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useFormValidation } from "@/hooks/useFormValidation";

interface FormData {
  name: string;
  email: string;
}

export const usePricingForm = () => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: ""
  });
  const { toast } = useToast();
  
  const { validateForm } = useFormValidation({
    name: { required: true, minLength: 2 },
    email: { required: true, email: true }
  });

  useEffect(() => {
    // Load pending user data from localStorage
    const pendingUser = localStorage.getItem('pendingUser');
    if (pendingUser) {
      try {
        const userData = JSON.parse(pendingUser);
        setFormData(prev => ({
          ...prev,
          name: userData.name || "",
          email: userData.email || ""
        }));
      } catch (error) {
        console.error('Error loading user data:', error);
      }
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
    // Validate form before proceeding
    if (!validateForm(formData)) {
      toast({
        title: "Please complete your information",
        description: "Fill in all required fields before selecting a plan.",
        variant: "destructive"
      });
      return;
    }

    
    // Save user data for payment process
    localStorage.setItem('pendingUser', JSON.stringify(formData));
    
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
