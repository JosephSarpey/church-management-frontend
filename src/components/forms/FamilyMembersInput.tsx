import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';

export interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
}

interface FamilyMembersInputProps {
  value: FamilyMember[];
  onChange: (members: FamilyMember[]) => void;
}

export function FamilyMembersInput({ value = [], onChange }: FamilyMembersInputProps) {
  const [newMember, setNewMember] = useState<Omit<FamilyMember, 'id'>>({ 
    name: '', 
    relationship: 'spouse' 
  });

  const relationships = [
    { value: 'spouse', label: 'Spouse' },
    { value: 'child', label: 'Child' },
    { value: 'parent', label: 'Parent' },
    { value: 'sibling', label: 'Sibling' },
    { value: 'other', label: 'Other' },
  ];

  const addMember = () => {
    if (!newMember.name.trim()) return;
    
    const member = {
      ...newMember,
      id: Date.now().toString(),
    };
    
    onChange([...value, member]);
    setNewMember({ name: '', relationship: 'spouse' });
  };

  const removeMember = (id: string) => {
    onChange(value.filter(member => member.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Add Family Member(s)</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Name"
            value={newMember.name}
            onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addMember())}
          />
          <Select
            value={newMember.relationship}
            onValueChange={(val) => setNewMember({ ...newMember, relationship: val })}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Relationship" />
            </SelectTrigger>
            <SelectContent>
              {relationships.map((rel) => (
                <SelectItem key={rel.value} value={rel.value}>
                  {rel.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="button" onClick={addMember}>
            Add
          </Button>
        </div>
      </div>

      {value.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium">Added Family Members</div>
          <div className="space-y-2">
            {value.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-2 border rounded">
                <span>
                  {member.name} <span className="text-muted-foreground">({member.relationship})</span>
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeMember(member.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
