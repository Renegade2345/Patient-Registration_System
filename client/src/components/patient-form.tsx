import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { X, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { createPatient, updatePatient, createAllergy, deleteAllergy, getAllergiesByPatientId } from '@/lib/localStorageDb';
import { useToast } from '@/hooks/use-toast';
import type { Patient, Allergy } from '@shared/schema';

const patientFormSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  dob: z.string().min(1, 'Date of birth is required'),
  gender: z.string().optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  address: z.string().optional(),
  insuranceProvider: z.string().optional(),
  medicalHistory: z.string().optional(),
});

type PatientFormData = z.infer<typeof patientFormSchema>;

interface PatientFormProps {
  patient?: Patient | null;
  onSuccess: () => void;
}

export function PatientForm({ patient, onSuccess }: PatientFormProps) {
  const { toast } = useToast();
  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [newAllergy, setNewAllergy] = useState<string>('');
  const [showAllergyInput, setShowAllergyInput] = useState<boolean>(false);

  const form = useForm<PatientFormData>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: {
      firstName: patient?.firstName || '',
      lastName: patient?.lastName || '',
      dob: patient?.dob ? new Date(patient.dob).toISOString().substring(0, 10) : '',
      gender: patient?.gender || '',
      email: patient?.email || '',
      phone: patient?.phone || '',
      address: patient?.address || '',
      insuranceProvider: patient?.insuranceProvider || '',
      medicalHistory: patient?.medicalHistory || '',
    },
  });

  useEffect(() => {
    // Fetch patient allergies if we have a patient
    if (patient?.id) {
      loadAllergies();
    }
  }, [patient?.id]);

  const loadAllergies = async () => {
    if (!patient?.id) return;
    try {
      const patientAllergies = await getAllergiesByPatientId(patient.id);
      setAllergies(patientAllergies);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load patient allergies',
        variant: 'destructive',
      });
    }
  };

  const onSubmit = async (data: PatientFormData) => {
    console.log('Form submitted with data:', data);
    
    // Create a cleaned version of the data
    const cleanedData = {
      ...data,
      // Ensure dob is formatted correctly for the database
      dob: data.dob,
      // Make sure optional fields are handled properly
      gender: data.gender || null,
      email: data.email || null,
      address: data.address || null,
      insuranceProvider: data.insuranceProvider || null,
      medicalHistory: data.medicalHistory || null
    };
    
    console.log('Cleaned form data:', cleanedData);
    
    try {
      if (patient?.id) {
        // Update existing patient
        console.log('Updating patient ID:', patient.id);
        const updatedPatient = await updatePatient(patient.id, cleanedData);
        console.log('Update result:', updatedPatient);
        
        toast({
          title: 'Success',
          description: 'Patient updated successfully',
        });
      } else {
        // Create new patient
        console.log('Creating new patient');
        const newPatient = await createPatient(cleanedData);
        console.log('New patient created:', newPatient);
        
        // Add any allergies to the new patient
        if (allergies.length > 0) {
          console.log('Adding allergies for new patient');
          for (const allergy of allergies) {
            await createAllergy({
              patientId: newPatient.id,
              name: allergy.name,
              severity: allergy.severity,
            });
          }
        }
        
        toast({
          title: 'Success',
          description: 'Patient registered successfully',
        });
      }
      
      onSuccess();
      
      if (!patient) {
        // Reset form if this is a new patient registration
        console.log('Resetting form');
        form.reset({
          firstName: '',
          lastName: '',
          dob: '',
          gender: '',
          email: '',
          phone: '',
          address: '',
          insuranceProvider: '',
          medicalHistory: '',
        });
        setAllergies([]);
      }
      
    } catch (error) {
      console.error('Error saving patient information:', error);
      toast({
        title: 'Error',
        description: 'Failed to save patient information. Please check console for details.',
        variant: 'destructive',
      });
    }
  };

  const handleAddAllergy = async () => {
    if (!newAllergy.trim()) return;
    
    if (patient?.id) {
      // Add allergy to existing patient
      try {
        await createAllergy({
          patientId: patient.id,
          name: newAllergy,
          severity: null,
        });
        await loadAllergies();
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to add allergy',
          variant: 'destructive',
        });
      }
    } else {
      // Add allergy to local list for new patient
      setAllergies([
        ...allergies,
        {
          id: Date.now(), // Temporary ID
          patientId: 0, // Will be replaced when patient is created
          name: newAllergy,
          severity: null,
          createdAt: new Date(),
        }
      ]);
    }
    
    setNewAllergy('');
    setShowAllergyInput(false);
  };

  const handleRemoveAllergy = async (allergyId: number) => {
    if (patient?.id) {
      // Remove allergy from existing patient
      try {
        await deleteAllergy(allergyId);
        await loadAllergies();
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to remove allergy',
          variant: 'destructive',
        });
      }
    } else {
      // Remove allergy from local list
      setAllergies(allergies.filter(allergy => allergy.id !== allergyId));
    }
  };

  const handleResetForm = () => {
    form.reset({
      firstName: patient?.firstName || '',
      lastName: patient?.lastName || '',
      dob: patient?.dob ? new Date(patient.dob).toISOString().substring(0, 10) : '',
      gender: patient?.gender || '',
      email: patient?.email || '',
      phone: patient?.phone || '',
      address: patient?.address || '',
      insuranceProvider: patient?.insuranceProvider || '',
      medicalHistory: patient?.medicalHistory || '',
    });
    
    if (!patient) {
      setAllergies([]);
    } else {
      loadAllergies();
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <h2 className="text-xl font-medium mb-4">
          {patient ? 'Edit Patient' : 'Patient Registration'}
        </h2>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="dob"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                        <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input type="tel" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="insuranceProvider"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Insurance Provider</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="medicalHistory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Medical History</FormLabel>
                  <FormControl>
                    <Textarea rows={4} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div>
              <FormLabel>Allergies</FormLabel>
              <div className="flex flex-wrap gap-2 mt-2">
                {allergies.map((allergy) => (
                  <div key={allergy.id} className="inline-flex items-center px-3 py-1 bg-gray-100 rounded-full">
                    <span>{allergy.name}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 ml-1 text-gray-500 hover:text-destructive"
                      onClick={() => handleRemoveAllergy(allergy.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                
                {showAllergyInput ? (
                  <div className="flex gap-1">
                    <Input
                      className="w-40 h-8"
                      placeholder="Allergy name"
                      value={newAllergy}
                      onChange={(e) => setNewAllergy(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddAllergy();
                        }
                      }}
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleAddAllergy}
                    >
                      Add
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="inline-flex items-center px-3 py-1 bg-gray-100 rounded-full text-primary hover:bg-gray-200"
                    onClick={() => setShowAllergyInput(true)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    <span>Add Allergy</span>
                  </Button>
                )}
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleResetForm}
              >
                Reset
              </Button>
              <Button type="submit">
                {patient ? 'Update Patient' : 'Register Patient'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
