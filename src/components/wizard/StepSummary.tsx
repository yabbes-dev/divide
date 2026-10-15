"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { useProfile } from "@/components/profile/ProfileProvider";
import { Separator } from "@/components/ui/separator";
import { BlurFade } from "@/components/magicui/blur-fade";
import { NumberTicker } from "@/components/magicui/number-ticker";
import { PersonAvatar } from "@/components/wizard/PersonAvatarChip";
import { WizardAction, WizardActions } from "@/components/wizard/WizardAction";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InlineNotice } from "@/components/ui/inline-notice";
import { Input } from "@/components/ui/input";
import { sameMemberSet } from "@/lib/profile/validation";
import { moneyClass } from "@/lib/utils/format";
import { cn } from "@/lib/utils";

interface StepSummaryProps {
  people: string[];
  personTotals: Record<string, number>;
  onCopySummary: () => void;
  onStartNew: () => void;
}

export function StepSummary({
  people,
  personTotals,
  onCopySummary,
  onStartNew,
}: StepSummaryProps) {
  const { profile, groups, open, setOpen, createGroup } = useProfile();
  const [saveOpen, setSaveOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const wantsSave = useRef(false);
  const entries = Object.entries(personTotals).filter(([, amount]) => amount > 0);
  const alreadySaved = groups.some((group) => sameMemberSet(group.members, people));
  const canSave = people.length >= 2 && !alreadySaved;

  useEffect(() => {
    if (profile && wantsSave.current) {
      wantsSave.current = false;
      setOpen(false);
      setSaveOpen(true);
    }
  }, [profile, setOpen]);

  useEffect(() => {
    if (!open && !profile) wantsSave.current = false;
  }, [open, profile]);

  async function handleSaveGroup(event: React.FormEvent) {
    event.preventDefault();
    if (saving || !groupName.trim()) return;
    setSaving(true);
    setSaveError(null);
    const message = await createGroup(groupName, people);
    setSaving(false);
    if (message) {
      setSaveError(message);
      return;
    }
    setSaveOpen(false);
    setGroupName("");
    toast.success("Group saved.");
  }

  function handleSaveClick() {
    if (!profile) {
      wantsSave.current = true;
      setOpen(true);
      return;
    }
    setSaveError(null);
    setSaveOpen(true);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-center gap-3">
        {entries.map(([person, amount], index) => (
          <BlurFade key={person} delay={index * 0.07}>
            <div className="flex min-w-[7.5rem] flex-1 flex-col items-center gap-1 py-2 text-center sm:max-w-[9.5rem]">
              <PersonAvatar
                name={person}
                colorIndex={index}
                showName={false}
                className="w-auto"
              />
              <p className="mt-1 max-w-full truncate px-1 font-medium leading-tight">
                {person}
              </p>
              <p className="text-xs text-muted-foreground">owes</p>
              <NumberTicker
                value={amount}
                className={cn("mt-1.5 text-xl", moneyClass)}
              />
            </div>
          </BlurFade>
        ))}
      </div>

      <Separator />

      <WizardActions>
        <BlurFade delay={0.15}>
          <WizardAction onClick={onCopySummary}>Share totals</WizardAction>
        </BlurFade>
        {canSave && (
          <WizardAction variant="outline" onClick={handleSaveClick}>
            Add group to profile
          </WizardAction>
        )}
        <WizardAction variant="outline" onClick={onStartNew}>
          Split another receipt
        </WizardAction>
      </WizardActions>

      <Dialog
        open={saveOpen}
        onOpenChange={(next) => {
          if (!next && saving) return;
          setSaveOpen(next);
        }}
      >
        <DialogContent className="max-h-[min(85dvh,40rem)] gap-5 overflow-y-auto rounded-none px-5 py-6 sm:max-w-md">
          <DialogHeader className="items-center gap-1 px-6 text-center">
            <DialogTitle className="text-xl font-semibold tracking-tight">
              Add group to profile
            </DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleSaveGroup} aria-busy={saving}>
            <div className="flex flex-wrap justify-center gap-3">
              {people.map((person, index) => (
                <PersonAvatar key={person} name={person} colorIndex={index} />
              ))}
            </div>
            <label className="flex flex-col gap-3" htmlFor="saved-group-name">
              <span className="text-sm font-medium">Group name</span>
              <Input
                id="saved-group-name"
                value={groupName}
                disabled={saving}
                onChange={(event) => setGroupName(event.target.value)}
                placeholder="e.g. Housemates"
                className="h-11"
              />
            </label>
            {saveError && <InlineNotice variant="error">{saveError}</InlineNotice>}
            <WizardAction type="submit" disabled={saving || !groupName.trim()}>
              {saving ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" />
                  Saving…
                </span>
              ) : (
                "Save group"
              )}
            </WizardAction>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
