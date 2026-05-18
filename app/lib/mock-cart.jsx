import {createContext, useContext, useEffect, useReducer, useMemo} from 'react';

/**
 * Local mock cart — survives page refresh via localStorage.
 * Lives alongside Hydrogen's real cart so we can demo add-to-bag flows
 * with products that don't exist in Shopify yet.
 *
 * When you move to real Shopify catalog, replace `useMockCart()` calls
 * with Hydrogen's `useOptimisticCart()` and `CartForm` mutations.
 */

const STORAGE_KEY = 'sellanything-mock-cart';

const MockCartContext = createContext(null);

const initialState = {lines: []};

function reducer(state, action) {
  switch (action.type) {
    case 'INIT':
      return action.payload || initialState;

    case 'ADD': {
      const key = lineKey(action.item);
      const existing = state.lines.find((l) => l._key === key);
      if (existing) {
        return {
          ...state,
          lines: state.lines.map((l) =>
            l._key === key
              ? {...l, quantity: l.quantity + action.item.quantity}
              : l,
          ),
        };
      }
      return {...state, lines: [...state.lines, {...action.item, _key: key}]};
    }

    case 'REMOVE':
      return {
        ...state,
        lines: state.lines.filter((l) => l._key !== action.key),
      };

    case 'UPDATE_QTY':
      return {
        ...state,
        lines: state.lines
          .map((l) =>
            l._key === action.key ? {...l, quantity: action.quantity} : l,
          )
          .filter((l) => l.quantity > 0),
      };

    case 'CLEAR':
      return initialState;

    default:
      return state;
  }
}

function lineKey(item) {
  return `${item.id}::${JSON.stringify(item.selectedOptions || {})}`;
}

export function MockCartProvider({children}) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) dispatch({type: 'INIT', payload: JSON.parse(stored)});
    } catch (_) {
      /* ignore corrupted storage */
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (_) {
      /* quota / privacy mode */
    }
  }, [state]);

  const value = useMemo(() => {
    const totalQuantity = state.lines.reduce(
      (sum, l) => sum + l.quantity,
      0,
    );
    const subtotal = state.lines.reduce(
      (sum, l) => sum + l.quantity * Number(l.price.amount),
      0,
    );
    const currencyCode = state.lines[0]?.price?.currencyCode || 'USD';

    return {
      lines: state.lines,
      totalQuantity,
      subtotal: {amount: subtotal.toFixed(2), currencyCode},
      addItem(item) {
        dispatch({type: 'ADD', item});
      },
      removeItem(key) {
        dispatch({type: 'REMOVE', key});
      },
      updateQty(key, quantity) {
        dispatch({type: 'UPDATE_QTY', key, quantity});
      },
      clear() {
        dispatch({type: 'CLEAR'});
      },
    };
  }, [state]);

  return (
    <MockCartContext.Provider value={value}>
      {children}
    </MockCartContext.Provider>
  );
}

export function useMockCart() {
  const ctx = useContext(MockCartContext);
  if (!ctx) {
    // Render-safe fallback during SSR / before provider mounts
    return {
      lines: [],
      totalQuantity: 0,
      subtotal: {amount: '0.00', currencyCode: 'USD'},
      addItem() {},
      removeItem() {},
      updateQty() {},
      clear() {},
    };
  }
  return ctx;
}
