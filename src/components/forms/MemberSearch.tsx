"use client";

import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/Input';
import { membersApi } from '@/lib/api';
import type { Member } from '@/lib/api/members/types';

interface Props {
  onSelect: (member: Member) => void;
  defaultQuery?: string;
  placeholder?: string;
}

export function MemberSearch({ onSelect, defaultQuery = '', placeholder = 'Search member...' }: Props) {
  const [query, setQuery] = useState(defaultQuery);
  const [results, setResults] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handle = setTimeout(() => {
      const run = async () => {
        if (!query || query.trim().length < 1) {
          setResults([]);
          return;
        }
        try {
          setLoading(true);
          const res = await membersApi.searchMembers(query, 0, 10);
          setResults(res.data || []);
        } catch (err) {
          console.error('Member search failed', err);
        } finally {
          setLoading(false);
        }
      };
      run();
    }, 300);

    return () => clearTimeout(handle);
  }, [query]);

  const handleSelect = (m: Member) => {
    setQuery(`${m.firstName} ${m.lastName}`);
    setShow(false);
    onSelect(m);
  };

  return (
    <div className="relative">
      <Input
        value={query}
        onChange={(e) => { setQuery(e.target.value); setShow(true); }}
        placeholder={placeholder}
      />

      {show && results.length > 0 && (
        <ul className="absolute z-50 left-0 right-0 bg-popover border rounded-md mt-1 max-h-56 overflow-auto">
          {results.map((m) => (
            <li
              key={m.id}
              className="px-3 py-2 cursor-pointer hover:bg-muted"
              onClick={() => handleSelect(m)}
            >
              <div className="font-medium">{m.firstName} {m.lastName}</div>
              <div className="text-sm text-muted-foreground">{m.memberNumber || m.email || m.phone}</div>
            </li>
          ))}
        </ul>
      )}

      {loading && <div className="absolute right-2 top-2 text-sm">Searching...</div>}
    </div>
  );
}

export default MemberSearch;
