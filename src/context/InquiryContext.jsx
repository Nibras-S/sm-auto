import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";

const STORAGE_KEY = "sparemec_inquiry_v1";

const InquiryContext = createContext(null);

const init = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

function reducer(state, action) {
  switch (action.type) {
    case "ADD": {
      const existing = state.find((i) => i.slug === action.item.slug);
      if (existing) {
        return state.map((i) =>
          i.slug === action.item.slug
            ? { ...i, qty: i.qty + (action.item.qty || 1) }
            : i
        );
      }
      return [...state, { ...action.item, qty: action.item.qty || 1 }];
    }
    case "REMOVE":
      return state.filter((i) => i.slug !== action.slug);
    case "SET_QTY":
      return state
        .map((i) =>
          i.slug === action.slug
            ? { ...i, qty: Math.max(1, action.qty) }
            : i
        )
        .filter(Boolean);
    case "CLEAR":
      return [];
    default:
      return state;
  }
}

export function InquiryProvider({ children }) {
  const [items, dispatch] = useReducer(reducer, undefined, init);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items]);

  const addItem = useCallback((product, qty = 1) => {
    dispatch({
      type: "ADD",
      item: {
        slug: product.slug,
        name: product.name,
        partNumber: product.partNumber,
        brand: product.brand,
        imageKey: product.imageKey,
        qty,
      },
    });
  }, []);

  const removeItem = useCallback((slug) => dispatch({ type: "REMOVE", slug }), []);
  const setQty = useCallback(
    (slug, qty) => dispatch({ type: "SET_QTY", slug, qty }),
    []
  );
  const clear = useCallback(() => dispatch({ type: "CLEAR" }), []);

  const openDrawer = useCallback(() => setIsOpen(true), []);
  const closeDrawer = useCallback(() => setIsOpen(false), []);

  const count = useMemo(
    () => items.reduce((sum, i) => sum + (i.qty || 1), 0),
    [items]
  );
  const has = useCallback((slug) => items.some((i) => i.slug === slug), [items]);

  const value = useMemo(
    () => ({
      items,
      count,
      has,
      addItem,
      removeItem,
      setQty,
      clear,
      isOpen,
      openDrawer,
      closeDrawer,
    }),
    [items, count, has, addItem, removeItem, setQty, clear, isOpen, openDrawer, closeDrawer]
  );

  return (
    <InquiryContext.Provider value={value}>{children}</InquiryContext.Provider>
  );
}

export const useInquiry = () => {
  const ctx = useContext(InquiryContext);
  if (!ctx) throw new Error("useInquiry must be used within InquiryProvider");
  return ctx;
};

export default InquiryContext;
