"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { parseReceiptImage } from "@/lib/api/parse-receipt";
import {
  calculatePersonTotals,
  formatSummaryText,
} from "@/lib/calculations/wizard-splits";
import { formatCurrency, toTitleCase } from "@/lib/utils/format";
import type { WizardItem, WizardReceipt, WizardStep } from "@/types/wizard";

const INITIAL_RECEIPT: WizardReceipt = {
  items: [],
  people: [],
};

export function useSplitWizard() {
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState<WizardStep>(0);
  const [receipt, setReceipt] = useState<WizardReceipt>(INITIAL_RECEIPT);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const parseGenerationRef = useRef(0);

  const personTotals = useMemo(
    () => calculatePersonTotals(receipt.items, receipt.people),
    [receipt.items, receipt.people],
  );

  const allItemsAssigned = receipt.items.every(
    (item) => item.assignedTo.length > 0,
  );

  const setImageFile = useCallback((file: File) => {
    setSelectedFile(file);
    setParseError(null);
    setImagePreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  }, []);

  const goToStep = useCallback((next: WizardStep) => {
    setStep(next);
  }, []);

  const nextStep = useCallback(() => {
    setStep((s) => Math.min(s + 1, 5) as WizardStep);
  }, []);

  const prevStep = useCallback(() => {
    setStep((current) => {
      if (current === 2) return 0;
      if (current > 0) return (current - 1) as WizardStep;
      return current;
    });
  }, []);

  const canGoBack = step >= 2 && step <= 5;

  const updateItem = useCallback(
    (id: string, updates: Partial<Pick<WizardItem, "name" | "price">>) => {
      setReceipt((prev) => ({
        ...prev,
        items: prev.items.map((item) =>
          item.id === id ? { ...item, ...updates } : item,
        ),
      }));
    },
    [],
  );

  const updateStore = useCallback((store: string) => {
    setReceipt((prev) => ({ ...prev, store }));
  }, []);

  const addPerson = useCallback((name: string) => {
    const formatted = toTitleCase(name);
    if (!formatted) return;
    setReceipt((prev) => {
      if (prev.people.includes(formatted)) return prev;
      return { ...prev, people: [...prev.people, formatted] };
    });
  }, []);

  const startWizard = useCallback(() => {
    setStarted(true);
    setStep(0);
  }, []);

  const removePerson = useCallback((name: string) => {
    setReceipt((prev) => ({
      ...prev,
      people: prev.people.filter((p) => p !== name),
      items: prev.items.map((item) => ({
        ...item,
        assignedTo: item.assignedTo.filter((p) => p !== name),
      })),
    }));
  }, []);

  const toggleAssignment = useCallback((itemId: string, person: string) => {
    setReceipt((prev) => ({
      ...prev,
      items: prev.items.map((item) => {
        if (item.id !== itemId) return item;
        const isAssigned = item.assignedTo.includes(person);
        return {
          ...item,
          assignedTo: isAssigned
            ? item.assignedTo.filter((p) => p !== person)
            : [...item.assignedTo, person],
        };
      }),
    }));
  }, []);

  const parseReceipt = useCallback(async () => {
    if (!selectedFile) return;

    const generation = ++parseGenerationRef.current;

    setStep(1);
    setIsProcessing(true);
    setParseError(null);

    const result = await parseReceiptImage(selectedFile);

    if (generation !== parseGenerationRef.current) return;

    setIsProcessing(false);

    if (!result.success || !result.data) {
      setParseError(result.error ?? "Failed to parse receipt");
      setStep(0);
      return;
    }

    setReceipt((prev) => ({
      ...prev,
      store: result.data!.store,
      items: result.data!.items,
    }));
    setStep(2);
  }, [selectedFile]);

  const reset = useCallback(() => {
    setStarted(false);
    setStep(0);
    setReceipt(INITIAL_RECEIPT);
    setSelectedFile(null);
    setImagePreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setIsProcessing(false);
    setParseError(null);
  }, []);

  const cancel = useCallback(() => {
    parseGenerationRef.current += 1;
    setIsProcessing(false);
    reset();
  }, [reset]);

  const copySummary = useCallback(async () => {
    const text = formatSummaryText(personTotals, formatCurrency);
    await navigator.clipboard.writeText(text);
  }, [personTotals]);

  return {
    started,
    step,
    receipt,
    imagePreview,
    isProcessing,
    parseError,
    personTotals,
    allItemsAssigned,
    setImageFile,
    goToStep,
    nextStep,
    prevStep,
    canGoBack,
    startWizard,
    parseReceipt,
    updateItem,
    updateStore,
    addPerson,
    removePerson,
    toggleAssignment,
    reset,
    cancel,
    copySummary,
  };
}

export type SplitWizard = ReturnType<typeof useSplitWizard>;
