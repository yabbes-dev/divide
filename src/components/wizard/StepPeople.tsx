"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BlurFade } from "@/components/magicui/blur-fade";
import { InlineNotice } from "@/components/ui/inline-notice";
import { PersonAvatarChip } from "@/components/wizard/PersonAvatarChip";
import { WizardAction, WizardActions, wizardButtonClass } from "@/components/wizard/WizardAction";
import { WizardCancelButton } from "@/components/wizard/WizardCancelButton";
import { sameMemberSet } from "@/lib/profile/validation";
import { toTitleCase } from "@/lib/utils/format";
import { cn } from "@/lib/utils";
import type { SavedGroup } from "@/types/profile";

const MIN_PEOPLE = 2;

interface StepPeopleProps {
  people: string[];
  savedGroups?: SavedGroup[];
  onAddPerson: (name: string) => void;
  onSelectGroup: (members: string[]) => void;
  onRemovePerson: (name: string) => void;
  onContinue: () => void;
  onCancel: () => void;
}

export function StepPeople({
  people,
  savedGroups,
  onAddPerson,
  onSelectGroup,
  onRemovePerson,
  onContinue,
  onCancel,
}: StepPeopleProps) {
  const [name, setName] = useState("");
  const [duplicateHint, setDuplicateHint] = useState(false);
  const [newGroup, setNewGroup] = useState(false);
  const canContinue = people.length >= MIN_PEOPLE;
  const showSavedGroups = (savedGroups?.length ?? 0) > 0;
  const showNameField = !showSavedGroups || newGroup;

  function handleSelectGroup(members: string[], selected: boolean) {
    if (selected) {
      setNewGroup(false);
      setName("");
      setDuplicateHint(false);
      onSelectGroup([]);
      return;
    }
    setNewGroup(false);
    setName("");
    setDuplicateHint(false);
    onSelectGroup(members);
  }

  function handleNewGroup() {
    if (newGroup) {
      setNewGroup(false);
      return;
    }
    onSelectGroup([]);
    setName("");
    setDuplicateHint(false);
    setNewGroup(true);
  }

  function handleAdd() {
    const formatted = toTitleCase(name);
    if (!formatted) return;

    if (people.some((p) => p.toLowerCase() === formatted.toLowerCase())) {
      setDuplicateHint(true);
      return;
    }

    setDuplicateHint(false);
    onAddPerson(name);
    setName("");
  }

  return (
    <div className="space-y-4">
      <BlurFade>
        <Card className="border-0 bg-transparent shadow-none">
          <CardContent className="space-y-4 pt-4">
            {showSavedGroups && (
              <div className="flex flex-col items-center gap-2">
                {savedGroups?.map((group) => {
                  const selected = sameMemberSet(group.members, people);
                  return (
                    <Button
                      key={group.id}
                      type="button"
                      variant={selected ? "default" : "outline"}
                      className={cn(
                        wizardButtonClass,
                        "h-auto max-w-full min-h-11 flex-col gap-0.5 whitespace-normal py-2",
                      )}
                      aria-pressed={selected}
                      onClick={() => handleSelectGroup(group.members, selected)}
                    >
                      <span>{group.name}</span>
                      <span
                        className={cn(
                          "max-w-64 truncate text-xs font-normal",
                          selected ? "text-primary-foreground/80" : "text-muted-foreground",
                        )}
                      >
                        {group.members.join(", ")}
                      </span>
                    </Button>
                  );
                })}
                <Button
                  type="button"
                  variant={newGroup ? "default" : "outline"}
                  className={wizardButtonClass}
                  aria-pressed={newGroup}
                  onClick={handleNewGroup}
                >
                  New group
                </Button>
              </div>
            )}

            {showNameField && (
              <div className="space-y-3.5">
                <label htmlFor="person-name" className="block text-sm font-medium">
                  Name
                </label>
                <div className="flex gap-2">
                  <Input
                    id="person-name"
                    placeholder="e.g. Alex"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setDuplicateHint(false);
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                    className="h-11 min-h-11"
                  />
                  <Button
                    type="button"
                    onClick={handleAdd}
                    disabled={!name.trim()}
                    className={cn(wizardButtonClass, "min-h-11")}
                  >
                    Add
                  </Button>
                </div>
              </div>
            )}

            {duplicateHint && (
              <InlineNotice variant="info">Already added.</InlineNotice>
            )}

            {people.length > 0 ? (
              <div className="flex flex-wrap justify-center gap-4 pt-1">
                <AnimatePresence mode="popLayout">
                  {people.map((person, index) => (
                    <motion.div
                      key={person}
                      layout
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.85 }}
                      transition={{ type: "spring", stiffness: 420, damping: 28 }}
                    >
                      <PersonAvatarChip
                        name={person}
                        colorIndex={index}
                        onRemove={() => onRemovePerson(person)}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : null}

            {!canContinue && (
              <p className="text-center text-sm text-muted-foreground">
                Add at least two people.
              </p>
            )}
          </CardContent>
        </Card>
      </BlurFade>

      <WizardActions>
        <BlurFade delay={0.08}>
          <WizardAction disabled={!canContinue} onClick={onContinue}>
            Next — assign items
          </WizardAction>
        </BlurFade>
        <WizardCancelButton onClick={onCancel} />
      </WizardActions>
    </div>
  );
}
