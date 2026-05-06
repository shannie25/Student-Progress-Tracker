import type { InputHTMLAttributes } from 'react';

type InputProps = {
  label: string;
} & InputHTMLAttributes<HTMLInputElement>;

const Input = ({ id, label, name, type = 'text', ...inputProps }: InputProps) => {
  const inputId = id || name;

  return (
    <label className="ui-input" htmlFor={inputId}>
      <span>{label}</span>
      <input
        id={inputId}
        name={name}
        type={type}
        {...inputProps}
      />
    </label>
  );
};

export default Input;
