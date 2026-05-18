import {createContext, useContext, useState} from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '~/components/ui/sheet';

/**
 * Drawer system built on shadcn <Sheet> (Radix Dialog under the hood).
 * Same external API as before — `useAside()`, `<Aside type="..." heading="...">`,
 * `Aside.Provider` — so all existing consumers (Header, MockCartDrawer,
 * product detail page, search) keep working unchanged.
 *
 * @param {{
 *   children?: React.ReactNode;
 *   type: AsideType;
 *   heading: React.ReactNode;
 * }}
 */
export function Aside({children, heading, type}) {
  const {type: activeType, close} = useAside();
  const expanded = type === activeType;

  return (
    <Sheet
      open={expanded}
      onOpenChange={(open) => {
        if (!open) close();
      }}
    >
      <SheetContent
        side="right"
        className="w-full sm:w-[420px] sm:max-w-[420px] p-0 flex flex-col"
      >
        <SheetHeader className="border-b border-border px-5 py-4">
          <SheetTitle className="text-sm font-medium tracking-[0.2em] uppercase">
            {heading}
          </SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-hidden">{children}</div>
      </SheetContent>
    </Sheet>
  );
}

const AsideContext = createContext(null);

Aside.Provider = function AsideProvider({children}) {
  const [type, setType] = useState('closed');

  return (
    <AsideContext.Provider
      value={{
        type,
        open: setType,
        close: () => setType('closed'),
      }}
    >
      {children}
    </AsideContext.Provider>
  );
};

export function useAside() {
  const aside = useContext(AsideContext);
  if (!aside) {
    throw new Error('useAside must be used within an AsideProvider');
  }
  return aside;
}

/** @typedef {'search' | 'cart' | 'mobile' | 'closed'} AsideType */
