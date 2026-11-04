// shadcn/ui Radix composition, adapted to CareTwin CSS and Phosphor icons.
// Sources: ui.shadcn.com/docs/components/radix/{accordion,sheet,tabs,button}
// Original shadcn/ui source is MIT licensed. See THIRD-PARTY.md.
import React from 'react';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { Slot } from '@radix-ui/react-slot';
import { CaretDown, X } from '@phosphor-icons/react';
import { clsx } from 'clsx';
export function Button({asChild=false,variant='primary',className,...props}){const Comp=asChild?Slot:'button';return <Comp className={clsx('button',`button-${variant}`,className)} {...props}/>}
export const Accordion=AccordionPrimitive.Root;
export function AccordionItem({className,...props}){return <AccordionPrimitive.Item data-slot="accordion-item" className={clsx('accordion-item',className)} {...props}/>}
export function AccordionTrigger({children,...props}){return <AccordionPrimitive.Header className="accordion-header"><AccordionPrimitive.Trigger data-slot="accordion-trigger" className="accordion-trigger" {...props}>{children}<CaretDown size={20} aria-hidden="true"/></AccordionPrimitive.Trigger></AccordionPrimitive.Header>}
export function AccordionContent({children,...props}){return <AccordionPrimitive.Content data-slot="accordion-content" className="accordion-content" {...props}><div>{children}</div></AccordionPrimitive.Content>}
export const Tabs=TabsPrimitive.Root;
export function TabsList({className,...props}){return <TabsPrimitive.List data-slot="tabs-list" className={clsx('tabs-list',className)} {...props}/>}
export function TabsTrigger({className,...props}){return <TabsPrimitive.Trigger data-slot="tabs-trigger" className={clsx('tabs-trigger',className)} {...props}/>}
export function TabsContent({className,...props}){return <TabsPrimitive.Content data-slot="tabs-content" className={clsx('tabs-content',className)} {...props}/>}
export const Sheet=DialogPrimitive.Root;
export const SheetTrigger=DialogPrimitive.Trigger;
export const SheetClose=DialogPrimitive.Close;
export const SheetTitle=DialogPrimitive.Title;
export const SheetDescription=DialogPrimitive.Description;
export function SheetContent({children}){return <DialogPrimitive.Portal><DialogPrimitive.Overlay className="sheet-overlay"/><DialogPrimitive.Content className="sheet-content">{children}<DialogPrimitive.Close className="icon-button sheet-x" aria-label="Fechar menu"><X size={22}/></DialogPrimitive.Close></DialogPrimitive.Content></DialogPrimitive.Portal>}
