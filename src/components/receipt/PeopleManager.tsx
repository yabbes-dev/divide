"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { SectionCard } from "@/components/layout/SectionCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Person } from "@/types";

interface PeopleManagerProps {
  people: Person[];
  onAddPerson: (name: string) => void;
  onRemovePerson: (personId: string) => void;
}

export function PeopleManager({
  people,
  onAddPerson,
  onRemovePerson,
}: PeopleManagerProps) {
  const [name, setName] = useState("");

  // TODO: Only render when receipt has been reviewed
  // TODO: Prevent duplicate names
  // TODO: Require at least one person before proceeding

  function handleAdd() {
    const trimmed = name.trim();
    if (!trimmed) return;
    onAddPerson(trimmed);
    setName("");
  }

  return (
    <SectionCard
      title="Add People"
      description="Who is splitting this receipt?"
    >
      <div className="mb-4 flex gap-2">
        <Input
          placeholder="Enter a name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        />
        <Button onClick={handleAdd} disabled={!name.trim()}>
          Add
        </Button>
      </div>

      {people.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {people.map((person) => (
            <li key={person.id}>
              <Badge variant="secondary" className="gap-1.5 pr-1.5">
                {person.name}
                <button
                  type="button"
                  onClick={() => onRemovePerson(person.id)}
                  className="rounded-full p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label={`Remove ${person.name}`}
                >
                  <X className="size-3" />
                </button>
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
