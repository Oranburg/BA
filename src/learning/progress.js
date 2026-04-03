import { useEffect, useMemo, useRef, useState } from "react";

const STORAGE_KEY = "ba-learning-progress-v1";

const EMPTY_STORE = {
  modules: {},
  lastVisitedModule: null,
  updatedAt: null,
};

function canUseStorage() {
  return typeof window !== "undefined" && !!window.localStorage;
}

export function readLearningStore() {
  if (!canUseStorage()) return EMPTY_STORE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_STORE;
    const parsed = JSON.parse(raw);
    return {
      modules: parsed.modules || {},
      lastVisitedModule: parsed.lastVisitedModule || null,
      updatedAt: parsed.updatedAt || null,
    };
  } catch {
    return EMPTY_STORE;
  }
}

export function writeLearningStore(nextStore) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      ...EMPTY_STORE,
      ...nextStore,
      updatedAt: new Date().toISOString(),
    })
  );
}

function mergeModuleState(moduleId, statePatch) {
  const store = readLearningStore();
  const currentModuleState = store.modules[moduleId] || {};
  const nextModuleState =
    typeof statePatch === "function" ? statePatch(currentModuleState) : statePatch;

  const nextStore = {
    ...store,
    modules: {
      ...store.modules,
      [moduleId]: {
        ...currentModuleState,
        ...nextModuleState,
      },
    },
    lastVisitedModule: moduleId,
  };
  writeLearningStore(nextStore);
  return nextStore.modules[moduleId];
}

export function useModuleProgress(moduleId, initialState = {}) {
  const initialRef = useRef(initialState);
  const [state, setState] = useState(() => {
    const moduleState = readLearningStore().modules[moduleId] || {};
    return { ...initialState, ...moduleState };
  });

  useEffect(() => {
    mergeModuleState(moduleId, state);
  }, [moduleId, state]);

  useEffect(() => {
    const store = readLearningStore();
    if (store.lastVisitedModule !== moduleId) {
      writeLearningStore({ ...store, lastVisitedModule: moduleId });
    }
  }, [moduleId]);

  const helpers = useMemo(
    () => ({
      patch: (patch) => setState((prev) => ({ ...prev, ...patch })),
      reset: () => setState({ ...initialRef.current }),
      markCompleted: () =>
        setState((prev) => ({
          ...prev,
          completed: true,
          completedAt: new Date().toISOString(),
        })),
    }),
    []
  );

  return { state, setState, ...helpers };
}

export function getModuleCompletion(moduleId) {
  const store = readLearningStore();
  return !!store.modules?.[moduleId]?.completed;
}

export function getLastVisitedModule() {
  return readLearningStore().lastVisitedModule;
}

export function getCourseProgress(moduleIds = []) {
  const store = readLearningStore();
  const completedCount = moduleIds.filter((id) => store.modules?.[id]?.completed).length;
  return {
    completedCount,
    totalCount: moduleIds.length,
    percent: moduleIds.length ? Math.round((completedCount / moduleIds.length) * 100) : 0,
  };
}

export function downloadTextFile(filename, content) {
  if (typeof document === "undefined") return;
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
