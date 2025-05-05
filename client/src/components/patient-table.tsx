import React, { useState, useEffect } from 'react';
import {
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Table,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Filter, Download, ChevronLeft, ChevronRight, Eye, Edit, Trash2 } from 'lucide-react';
import { calculateAge, formatDate, formatPhoneNumber, downloadCsv } from '@/lib/utils';
import { getPatients, searchPatients, filterPatients, deletePatient } from '@/lib/localStorageDb';
import { PatientForm } from './patient-form';
import type { Patient } from '@shared/schema';

export function PatientTable() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Patient; direction: 'asc' | 'desc' } | null>(null);
  
  const patientsPerPage = 10;
  
  useEffect(() => {
    loadPatients();
  }, []);
  
  const loadPatients = async () => {
    try {
      const loadedPatients = await getPatients();
      setPatients(loadedPatients);
      setFilteredPatients(loadedPatients);
    } catch (error) {
      console.error('Error loading patients:', error);
    }
  };
  
  useEffect(() => {
    handleSearch(searchTerm);
  }, [patients, searchTerm]);
  
  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    if (!term.trim()) {
      setFilteredPatients(patients);
      setCurrentPage(1);
      return;
    }
    
    try {
      const results = await searchPatients(term);
      setFilteredPatients(results);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error searching patients:', error);
    }
  };
  
  const handleFilter = async (filters: any) => {
    try {
      const results = await filterPatients(filters);
      setFilteredPatients(results);
      setCurrentPage(1);
      setIsFilterDialogOpen(false);
    } catch (error) {
      console.error('Error filtering patients:', error);
    }
  };
  
  const handleSort = (key: keyof Patient) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    
    setSortConfig({ key, direction });
    
    const sortedPatients = [...filteredPatients].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    
    setFilteredPatients(sortedPatients);
  };
  
  const handleViewPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsViewDialogOpen(true);
  };
  
  const handleEditPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsEditDialogOpen(true);
  };
  
  const handleDeletePatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDeletePatient = async () => {
    if (!selectedPatient) return;
    
    try {
      await deletePatient(selectedPatient.id);
      await loadPatients();
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting patient:', error);
    }
  };
  
  const exportData = () => {
    downloadCsv(filteredPatients, 'patients.csv');
  };
  
  // Calculate pagination
  const totalPages = Math.ceil(filteredPatients.length / patientsPerPage);
  const indexOfLastPatient = currentPage * patientsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
  const currentPatients = filteredPatients.slice(indexOfFirstPatient, indexOfLastPatient);
  
  return (
    <>
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row justify-between mb-6">
            <h2 className="text-xl font-medium mb-4 md:mb-0">Patient Data</h2>
            <div className="flex space-x-2">
              <div className="relative">
                <Input
                  className="pl-10 pr-4"
                  placeholder="Search patients..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
              <Button
                variant="outline"
                className="flex items-center"
                onClick={() => setIsFilterDialogOpen(true)}
              >
                <Filter className="h-4 w-4 mr-2" />
                <span>Filter</span>
              </Button>
              <Button
                variant="outline"
                className="flex items-center"
                onClick={exportData}
              >
                <Download className="h-4 w-4 mr-2" />
                <span>Export</span>
              </Button>
            </div>
          </div>
          
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('id')}
                  >
                    <div className="flex items-center">
                      <span>Patient ID</span>
                      {sortConfig?.key === 'id' && (
                        <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('lastName')}
                  >
                    <div className="flex items-center">
                      <span>Name</span>
                      {sortConfig?.key === 'lastName' && (
                        <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('dob')}
                  >
                    <div className="flex items-center">
                      <span>Date of Birth</span>
                      {sortConfig?.key === 'dob' && (
                        <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('gender')}
                  >
                    <div className="flex items-center">
                      <span>Gender</span>
                      {sortConfig?.key === 'gender' && (
                        <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('phone')}
                  >
                    <div className="flex items-center">
                      <span>Phone</span>
                      {sortConfig?.key === 'phone' && (
                        <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentPatients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-gray-500">
                      No patients found
                    </TableCell>
                  </TableRow>
                ) : (
                  currentPatients.map(patient => (
                    <TableRow key={patient.id}>
                      <TableCell>P{patient.id.toString().padStart(5, '0')}</TableCell>
                      <TableCell>{`${patient.firstName} ${patient.lastName}`}</TableCell>
                      <TableCell>{formatDate(patient.dob)}</TableCell>
                      <TableCell>
                        {patient.gender ? patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1) : '-'}
                      </TableCell>
                      <TableCell>{formatPhoneNumber(patient.phone)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewPatient(patient)}
                          >
                            <Eye className="h-4 w-4 text-primary" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditPatient(patient)}
                          >
                            <Edit className="h-4 w-4 text-primary" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeletePatient(patient)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <div className="text-gray-600 text-sm">
              Showing {filteredPatients.length > 0 ? indexOfFirstPatient + 1 : 0} to{' '}
              {Math.min(indexOfLastPatient, filteredPatients.length)} of {filteredPatients.length} patients
            </div>
            <div className="flex space-x-1">
              <Button
                variant="outline"
                size="icon"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                // Calculate page numbers to show (centered around current page)
                let pageNum = i + 1;
                if (totalPages > 5) {
                  if (currentPage > 3) {
                    pageNum = currentPage - 3 + i;
                  }
                  if (currentPage > totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  }
                }
                
                if (pageNum > 0 && pageNum <= totalPages) {
                  return (
                    <Button
                      key={i}
                      variant={currentPage === pageNum ? 'default' : 'outline'}
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                }
                return null;
              })}
              
              <Button
                variant="outline"
                size="icon"
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* View Patient Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Patient Details</DialogTitle>
          </DialogHeader>
          
          {selectedPatient && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Full Name</h4>
                  <p>{`${selectedPatient.firstName} ${selectedPatient.lastName}`}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Patient ID</h4>
                  <p>P{selectedPatient.id.toString().padStart(5, '0')}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Date of Birth</h4>
                  <p>{formatDate(selectedPatient.dob)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Age</h4>
                  <p>{calculateAge(selectedPatient.dob)} years</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Gender</h4>
                  <p>
                    {selectedPatient.gender 
                      ? selectedPatient.gender.charAt(0).toUpperCase() + selectedPatient.gender.slice(1) 
                      : '-'}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Phone</h4>
                  <p>{formatPhoneNumber(selectedPatient.phone)}</p>
                </div>
                <div className="col-span-2">
                  <h4 className="text-sm font-medium text-gray-500">Email</h4>
                  <p>{selectedPatient.email || '-'}</p>
                </div>
                <div className="col-span-2">
                  <h4 className="text-sm font-medium text-gray-500">Address</h4>
                  <p>{selectedPatient.address || '-'}</p>
                </div>
                <div className="col-span-2">
                  <h4 className="text-sm font-medium text-gray-500">Insurance Provider</h4>
                  <p>{selectedPatient.insuranceProvider || '-'}</p>
                </div>
                <div className="col-span-2">
                  <h4 className="text-sm font-medium text-gray-500">Medical History</h4>
                  <p className="whitespace-pre-line">{selectedPatient.medicalHistory || '-'}</p>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Patient Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Edit Patient</DialogTitle>
          </DialogHeader>
          
          {selectedPatient && (
            <PatientForm 
              patient={selectedPatient} 
              onSuccess={() => {
                setIsEditDialogOpen(false);
                loadPatients();
              }} 
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this patient? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeletePatient} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Filter Dialog */}
      <FilterDialog 
        isOpen={isFilterDialogOpen} 
        onClose={() => setIsFilterDialogOpen(false)}
        onApplyFilters={handleFilter}
      />
    </>
  );
}

interface FilterDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: any) => void;
}

export function FilterDialog({ isOpen, onClose, onApplyFilters }: FilterDialogProps) {
  const [ageMin, setAgeMin] = useState<string>('');
  const [ageMax, setAgeMax] = useState<string>('');
  const [genderMale, setGenderMale] = useState(false);
  const [genderFemale, setGenderFemale] = useState(false);
  const [genderOther, setGenderOther] = useState(false);
  const [registrationDateStart, setRegistrationDateStart] = useState<string>('');
  const [registrationDateEnd, setRegistrationDateEnd] = useState<string>('');
  const [insuranceProvider, setInsuranceProvider] = useState<string>('');
  
  const handleReset = () => {
    setAgeMin('');
    setAgeMax('');
    setGenderMale(false);
    setGenderFemale(false);
    setGenderOther(false);
    setRegistrationDateStart('');
    setRegistrationDateEnd('');
    setInsuranceProvider('');
  };
  
  const handleApply = () => {
    const genders: string[] = [];
    if (genderMale) genders.push('male');
    if (genderFemale) genders.push('female');
    if (genderOther) genders.push('other');
    
    onApplyFilters({
      ageMin: ageMin ? parseInt(ageMin) : undefined,
      ageMax: ageMax ? parseInt(ageMax) : undefined,
      gender: genders.length > 0 ? genders : undefined,
      registrationDateStart: registrationDateStart || undefined,
      registrationDateEnd: registrationDateEnd || undefined,
      insuranceProvider: insuranceProvider || undefined,
    });
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Filter Patients</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">Age Range</label>
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                placeholder="Min"
                value={ageMin}
                onChange={(e) => setAgeMin(e.target.value)}
              />
              <span>to</span>
              <Input
                type="number"
                placeholder="Max"
                value={ageMax}
                onChange={(e) => setAgeMax(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2">Gender</label>
            <div className="flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox text-primary"
                  checked={genderMale}
                  onChange={(e) => setGenderMale(e.target.checked)}
                />
                <span className="ml-2">Male</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox text-primary"
                  checked={genderFemale}
                  onChange={(e) => setGenderFemale(e.target.checked)}
                />
                <span className="ml-2">Female</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox text-primary"
                  checked={genderOther}
                  onChange={(e) => setGenderOther(e.target.checked)}
                />
                <span className="ml-2">Other</span>
              </label>
            </div>
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2">Registration Date</label>
            <div className="flex items-center space-x-2">
              <Input
                type="date"
                value={registrationDateStart}
                onChange={(e) => setRegistrationDateStart(e.target.value)}
              />
              <span>to</span>
              <Input
                type="date"
                value={registrationDateEnd}
                onChange={(e) => setRegistrationDateEnd(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2">Insurance Provider</label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md"
              value={insuranceProvider}
              onChange={(e) => setInsuranceProvider(e.target.value)}
            >
              <option value="">Any Provider</option>
              <option value="blue-cross">Blue Cross</option>
              <option value="aetna">Aetna</option>
              <option value="cigna">Cigna</option>
              <option value="medicare">Medicare</option>
            </select>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleReset}>
            Reset
          </Button>
          <Button onClick={handleApply}>
            Apply Filters
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
