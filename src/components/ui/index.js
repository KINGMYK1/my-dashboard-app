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

// Formulaires
export { default as Input, Input as InputComponent } from './Input';
export { default as Label, Label as LabelComponent } from './Label';
export { default as Checkbox, Checkbox as CheckboxComponent } from './Checkbox';

// ✅ CORRECTION: Un seul export pour TextArea (en utilisant le fichier Textarea.jsx)
export { default as TextArea, TextArea as TextAreaComponent } from './Textarea';

// Modals et Dialogs
export { default as Modal, Modal as ModalComponent } from './Modal';
export { default as Dialog } from './Dialog';
export { default as ConfirmationModal } from './ConfirmationModal';

// ✅ CORRECTION: Exports simplifiés
export * from './Dialog';
export * from './Modal';