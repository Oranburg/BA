import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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
  const debounceRef = useRef(null);
  const lastPersistedRef = useRef("");
  const [state, setState] = useState(() => {
    const moduleState = readLearningStore().modules[moduleId] || {};
    return { ...initialState, ...moduleState };
  });

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      const serialized = JSON.stringify(state);
      if (serialized === lastPersistedRef.current) return;
      mergeModuleState(moduleId, state);
      lastPersistedRef.current = serialized;
    }, 200);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [moduleId, state]);

  useEffect(() => {
    const store = readLearningStore();
    if (store.lastVisitedModule !== moduleId) {
      writeLearningStore({ ...store, lastVisitedModule: moduleId });
    }
  }, [moduleId]);

  const patch = useCallback((nextPatch) => {
    setState((prev) => {
      const next = { ...prev, ...nextPatch };
      return JSON.stringify(next) === JSON.stringify(prev) ? prev : next;
    });
  }, []);

  const reset = useCallback(() => {
    setState({ ...initialRef.current });
  }, []);

  const markCompleted = useCallback(() => {
    setState((prev) => ({
      ...prev,
      completed: true,
      completedAt: new Date().toISOString(),
    }));
  }, []);

  const helpers = useMemo(() => ({ patch, reset, markCompleted }), [patch, reset, markCompleted]);

  return { state, setState, ...helpers };
}

export function getModuleCompletion(moduleId) {
  const store = readLearningStore();
  return !!store.modules?.[moduleId]?.completed;
}

export function getModuleStarted(moduleId) {
  const store = readLearningStore();
  return !!store.modules?.[moduleId];
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
