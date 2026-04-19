import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils';

/**
 * Tag/Badge component seguindo os tokens `card-tag` do wireframe.
 * Usado para status, categorias, etiquetas em cards e tabelas.
 */
const tagVariants = cva(
  'inline-flex items-center rounded px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider',
  {
    variants: {
      variant: {
        teal: 'bg-brif-teal-l text-brif-teal-d',
        amber: 'bg-brif-amber-l text-[#92520A]',
        red: 'bg-brif-red-l text-brif-red',
        blue: 'bg-brif-blue-l text-brif-blue',
        gray: 'bg-brif-surf-2 text-brif-muted',
      },
    },
    defaultVariants: {
      variant: 'gray',
    },
  },
);

export interface TagProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof tagVariants> {}

const Tag = React.forwardRef<HTMLSpanElement, TagProps>(
  ({ className, variant, ...props }, ref) => (
    <span ref={ref} className={cn(tagVariants({ variant, className }))} {...props} />
  ),
);
Tag.displayName = 'Tag';

export { Tag, tagVariants };
