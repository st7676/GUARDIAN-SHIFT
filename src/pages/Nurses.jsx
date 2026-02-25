import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Plus, Search, ArrowLeft, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

import NurseCard from '@/components/scheduling/NurseCard';

const EMPTY_NURSE = {
  full_name: '',
  employee_id: '',
  employment_percentage: 100,
  experience_years: 1,
  grade: 3,
  responsibility_score: 5,
  is_shabbat_anchor: false,
  shift_type_preference: 'any',
  phone: '',
  email: '',
  is_active: true,
  notes: ''
};

export default function Nurses() {
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingNurse, setEditingNurse] = useState(null);
  const [formData, setFormData] = useState(EMPTY_NURSE);
  const queryClient = useQueryClient();

  const { data: nurses = [], isLoading } = useQuery({
    queryKey: ['nurses'],
    queryFn: () => base44.entities.Nurse.list('-created_date')
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Nurse.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nurses'] });
      setDialogOpen(false);
      setFormData(EMPTY_NURSE);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Nurse.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nurses'] });
      setDialogOpen(false);
      setEditingNurse(null);
      setFormData(EMPTY_NURSE);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Nurse.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nurses'] });
      setDialogOpen(false);
      setEditingNurse(null);
      setFormData(EMPTY_NURSE);
    }
  });

  const handleEdit = (nurse) => {
    setEditingNurse(nurse);
    setFormData(nurse);
    setDialogOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingNurse) {
      updateMutation.mutate({ id: editingNurse.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const filteredNurses = nurses.filter(nurse => 
    nurse.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    nurse.employee_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeNurses = filteredNurses.filter(n => n.is_active);
  const inactiveNurses = filteredNurses.filter(n => !n.is_active);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to={createPageUrl('Dashboard')}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-slate-800">Nursing Staff</h1>
            <p className="text-slate-500">{activeNurses.length} active nurses</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="bg-sky-600 hover:bg-sky-700 gap-2"
                onClick={() => { setEditingNurse(null); setFormData(EMPTY_NURSE); }}
              >
                <UserPlus className="w-4 h-4" />
                Add Nurse
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingNurse ? 'Edit Nurse' : 'Add New Nurse'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label>Full Name *</Label>
                    <Input
                      value={formData.full_name}
                      onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label>Employee ID *</Label>
                    <Input
                      value={formData.employee_id}
                      onChange={e => setFormData({ ...formData, employee_id: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label>Employment %</Label>
                    <Select 
                      value={String(formData.employment_percentage)}
                      onValueChange={v => setFormData({ ...formData, employment_percentage: Number(v) })}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="100">100%</SelectItem>
                        <SelectItem value="88">88%</SelectItem>
                        <SelectItem value="76">76%</SelectItem>
                        <SelectItem value="66">66%</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Experience (years)</Label>
                    <Input
                      type="number"
                      step="0.5"
                      min="0"
                      value={formData.experience_years}
                      onChange={e => setFormData({ ...formData, experience_years: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label>Grade</Label>
                    <Select 
                      value={String(formData.grade)}
                      onValueChange={v => setFormData({ ...formData, grade: Number(v) })}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Grade 1 (Senior)</SelectItem>
                        <SelectItem value="2">Grade 2</SelectItem>
                        <SelectItem value="3">Grade 3</SelectItem>
                        <SelectItem value="4">Grade 4 (Junior)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Responsibility Score (1-10)</Label>
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      value={formData.responsibility_score}
                      onChange={e => setFormData({ ...formData, responsibility_score: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label>Shift Preference</Label>
                    <Select 
                      value={formData.shift_type_preference}
                      onValueChange={v => setFormData({ ...formData, shift_type_preference: v })}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any Shift</SelectItem>
                        <SelectItem value="morning_only">Morning Only</SelectItem>
                        <SelectItem value="evening_only">Evening Only</SelectItem>
                        <SelectItem value="night_only">Night Only</SelectItem>
                        <SelectItem value="no_nights">No Nights</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input
                      value={formData.phone || ''}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={formData.email || ''}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={formData.is_shabbat_anchor}
                      onCheckedChange={v => setFormData({ ...formData, is_shabbat_anchor: v })}
                    />
                    <Label>Shabbat Anchor</Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={formData.is_active}
                      onCheckedChange={v => setFormData({ ...formData, is_active: v })}
                    />
                    <Label>Active</Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={formData.is_head_nurse}
                      onCheckedChange={v => setFormData({ ...formData, is_head_nurse: v })}
                    />
                    <Label>Head Nurse</Label>
                  </div>
                </div>
                <div className="flex gap-2">
                  {editingNurse && (
                    <Button 
                      type="button"
                      variant="destructive"
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this nurse?')) {
                          deleteMutation.mutate(editingNurse.id);
                        }
                      }}
                      className="flex-1"
                    >
                      Delete
                    </Button>
                  )}
                  <Button type="submit" className="flex-1 bg-sky-600 hover:bg-sky-700">
                    {editingNurse ? 'Save Changes' : 'Add Nurse'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            placeholder="Search by name or ID..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10 bg-white"
          />
        </div>

        {/* Nurses Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeNurses.map(nurse => (
            <NurseCard
              key={nurse.id}
              nurse={nurse}
              onClick={handleEdit}
            />
          ))}
        </div>

        {inactiveNurses.length > 0 && (
          <>
            <h2 className="text-lg font-semibold text-slate-600 mt-8 mb-4">Inactive</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-60">
              {inactiveNurses.map(nurse => (
                <NurseCard
                  key={nurse.id}
                  nurse={nurse}
                  onClick={handleEdit}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}