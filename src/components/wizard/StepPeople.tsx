"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BlurFade } from "@/components/magicui/blur-fade";
import { WizardAction, WizardActions, wizardButtonClass } from "@/components/wizard/WizardAction";
import { WizardCancelButton } from "@/components/wizard/WizardCancelButton";

const MIN_PEOPLE = 2;

interface StepPeopleProps {
  people: string[];
  onAddPerson: (name: string) => void;
  onRemovePerson: (name: string) => void;
  onContinue: () => void;
  onCancel: () => void;
}

export function StepPeople({
  people,
  onAddPerson,
  onRemovePerson,
  onContinue,
  onCancel,
}: StepPeopleProps) {
  const [name, setName] = useState("");
  const canContinue = people.length >= MIN_PEOPLE;

  function handleAdd() {
    onAddPerson(name);
    setName("");
  }

  return (
    <div className="space-y-4">
      <BlurFade>
        <Card>
          <CardContent className="space-y-4 pt-4">
            <div className="flex gap-2">
              <Input
                placeholder="Add person"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                className="h-11"
              />
              <Button
                type="button"
                onClick={handleAdd}
                disabled={!name.trim()}
                className={wizardButtonClass}
              >
                Add
              </Button>
            </div>

            {people.length > 0 ? (
              <div className="flex flex-wrap justify-center gap-2">
                <AnimatePresence mode="popLayout">
                  {people.map((person) => (
                    <motion.div
                      key={person}
                      layout
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.85 }}
                      transition={{ type: "spring", stiffness: 420, damping: 28 }}
                    >
                      <Badge
                        variant="secondary"
                        className="h-9 gap-1.5 px-3 text-sm"
                      >
                        {person}
                        <button
                          type="button"
                          onClick={() => onRemovePerson(person)}
                          className="p-0.5 hover:bg-muted"
                          aria-label={`Remove ${person}`}
                        >
                          <X className="size-3.5" />
                        </button>
                      </Badge>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : null}

            {!canContinue && (
              <p className="text-center text-sm text-muted-foreground">
                Add at least two people to continue.
              </p>
            )}
          </CardContent>
        </Card>
      </BlurFade>

      <WizardActions>
        <BlurFade delay={0.08}>
          <WizardAction disabled={!canContinue} onClick={onContinue}>
            Continue
          </WizardAction>
        </BlurFade>
        <WizardCancelButton onClick={onCancel} />
      </WizardActions>
    </div>
  );
}
