interface InputBoxProps {
  label?: string;
  type?: string;
  placeholder?: string;
  name?: string;
  value?: string;
  readOnly?: boolean;
}

const InputBox = ({ label, type = 'text', placeholder, name, value, readOnly = false }: InputBoxProps) => {
  return (
    <div className="flex flex-col gap-1 mb-4">
      {label && <label className="text-xl font-bold">{label}</label>}
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        readOnly={readOnly}
        className="w-full bg-slate-950/80 border border-slate-700 rounded-xl py-3 px-4 pl-10.5 pr-12"
      />
    </div>
  );
};

export default InputBox;
