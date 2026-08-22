//añadido onchange para guardar valores del formulario
interface InputBoxProps {
  label?: string;
  type?: string;
  placeholder?: string;
  name?: string;
  value?: string;
  readOnly?: boolean;

  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const InputBox = ({ label, type = 'text', placeholder, name, value, readOnly = false, onChange }: InputBoxProps) => {
  return (
    <div className="flex flex-col gap-1 mb-4">
      {label && <label className="text-xl font-bold">{label}</label>}
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        readOnly={readOnly}
        onChange={onChange}
        className="w-full bg-white border border-slate-700 rounded-xl py-3 px-4 pl-10.5 pr-12"
      />
    </div>
  );
};

export default InputBox;
