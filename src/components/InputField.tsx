import { FieldError } from "react-hook-form";
import { Label } from "./ui/label";
import { Input } from "./ui/input";

type InputFieldProps = {
  label: string;
  type?: string;
  register: any;
  control?: any;
  name: string;
  defaultValue?: string;
  error?: FieldError;
  hidden?: boolean;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
};

const InputField = ({
  label,
  type = "text",
  register,
  name,
  control, //
  defaultValue,
  error,
  hidden,
  inputProps,
}: InputFieldProps) => {
  return (
    <div className={hidden ? "hidden" : "flex flex-col gap-2 w-full md:w-1/4"}>
      <Label className="text-xs text-gray-500">{label}</Label>
      <Input
        type={type}
        {...register(name)}
        {...inputProps}
        defaultValue={defaultValue}
      />
      {error?.message && (
        <p className="text-xs text-red-400">{error.message.toString()}</p>
      )}
    </div>
  );
};

export default InputField;
