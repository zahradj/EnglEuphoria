
import { useState, useEffect } from "react";
import { TeacherProfile } from "@/types/teacher-discovery";

export const useTeacherFilters = (teachers: TeacherProfile[]) => {
  const [filteredTeachers, setFilteredTeachers] = useState<TeacherProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState("all-specializations");
  const [selectedAccent, setSelectedAccent] = useState("all-accents");


  useEffect(() => {
    filterTeachers();
  }, [teachers, searchTerm, selectedSpecialization, selectedAccent]);

  const filterTeachers = () => {
    let filtered = [...teachers];

    if (searchTerm) {
      filtered = filtered.filter(teacher =>
        teacher.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.bio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.specializations.some(spec => 
          spec.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    if (selectedSpecialization && selectedSpecialization !== "all-specializations") {
      filtered = filtered.filter(teacher =>
        teacher.specializations.includes(selectedSpecialization)
      );
    }

    if (selectedAccent && selectedAccent !== "all-accents") {
      filtered = filtered.filter(teacher =>
        teacher.accent === selectedAccent
      );
    }

    setFilteredTeachers(filtered);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedSpecialization("all-specializations");
    setSelectedAccent("all-accents");
  };

  return {
    filteredTeachers,
    searchTerm,
    setSearchTerm,
    selectedSpecialization,
    setSelectedSpecialization,
    selectedAccent,
    setSelectedAccent,
    clearFilters,
  };
};
