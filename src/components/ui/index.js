// Composants de base existants
export { default as Spinner } from './Spinner';
export { default as Badge } from './Badge';
export { default as Pagination } from './Pagination';
export { default as Select } from './Select';
export { default as DatePicker } from './DatePicker';

// Card - exports multiples CORRIGÉS
export { 
  default as Card, 
  Card as CardComponent, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardFooter 
} from './Card';

// Button - exports multiples
export { default as Button, Button as ButtonComponent } from './Button';

// Tabs
export { default as Tabs } from './Tabs/Tabs';
export { default as Tab } from './Tabs/Tab';

// Nouveaux composants ajoutés avec exports nommés ET par défaut
export * from './Dialog';
export { default as Dialog } from './Dialog';

export { default as Input, Input as InputComponent } from './Input';
export { default as Label, Label as LabelComponent } from './Label';
export { default as Textarea, Textarea as TextareaComponent } from './Textarea';
export { default as Checkbox, Checkbox as CheckboxComponent } from './Checkbox'; // ✅ AJOUT
export { default as ConfirmationModal } from './ConfirmationModal';