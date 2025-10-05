import { UseFormRegister } from 'react-hook-form';
import { X } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input, Select } from '../../../components/ui/form';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../../components/ui/tooltip';
import { InvoiceFormValues } from '../pages/InvoiceCreate';

interface ItemRowProps {
  index: number;
  field: InvoiceFormValues['lineItems'][number];
  register: UseFormRegister<InvoiceFormValues>;
  onRemove: () => void;
  onUpdate: (values: Partial<InvoiceFormValues['lineItems'][number]>) => void;
}

export const ItemRow = ({ index, field, register, onRemove, onUpdate }: ItemRowProps) => (
  <div className="grid items-center gap-3 rounded-2xl bg-white/70 p-4 shadow-sm dark:bg-slate-900/60 md:grid-cols-[2fr_repeat(5,_1fr)]">
    <div className="md:col-span-2">
      <Input
        {...register(`lineItems.${index}.description`)}
        defaultValue={field.description}
        placeholder="Description"
        onBlur={(event) => onUpdate({ description: event.target.value })}
      />
    </div>
    <Input
      type="number"
      step="0.01"
      defaultValue={field.qty}
      {...register(`lineItems.${index}.qty`, { valueAsNumber: true })}
      onBlur={(event) => onUpdate({ qty: Number(event.target.value) })}
    />
    <Input
      type="number"
      step="0.01"
      defaultValue={field.unitPrice}
      {...register(`lineItems.${index}.unitPrice`, { valueAsNumber: true })}
      onBlur={(event) => onUpdate({ unitPrice: Number(event.target.value) })}
    />
    <Select
      defaultValue={field.discountType ?? 'percent'}
      {...register(`lineItems.${index}.discountType`)}
      onChange={(event) => onUpdate({ discountType: event.target.value as 'amount' | 'percent' | null })}
    >
      <option value="percent">% off</option>
      <option value="amount">₹ off</option>
      <option value="">None</option>
    </Select>
    <Input
      type="number"
      step="0.01"
      defaultValue={field.discountValue ?? 0}
      {...register(`lineItems.${index}.discountValue`, { valueAsNumber: true })}
      onBlur={(event) => onUpdate({ discountValue: Number(event.target.value) })}
    />
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Input
            type="number"
            step="0.01"
            defaultValue={field.taxRate ?? 0}
            {...register(`lineItems.${index}.taxRate`, { valueAsNumber: true })}
            onBlur={(event) => onUpdate({ taxRate: Number(event.target.value) })}
          />
        </TooltipTrigger>
        <TooltipContent>GST rate %</TooltipContent>
      </Tooltip>
    </TooltipProvider>
    <Button type="button" size="icon" variant="ghost" onClick={onRemove}>
      <X className="h-4 w-4" />
    </Button>
  </div>
);
