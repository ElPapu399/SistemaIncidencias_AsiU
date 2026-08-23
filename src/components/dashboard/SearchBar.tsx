import { Search } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onSearch: (value: string) => void;
  placeholder?: string;
}

export default function SearchBar({ value, onSearch, placeholder }: SearchBarProps) {

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearch(e.target.value);
  };

  return (
    <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
        <input
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={handleChange}
            className="pl-9 pr-4 py-2 text-sm bg-card border border-border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-colors"
        />
    </div>
  );
}