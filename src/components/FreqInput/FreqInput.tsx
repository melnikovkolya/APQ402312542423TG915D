import { Input, Typography } from "antd";
import styles from "./style.module.css";
import { SizeType } from "antd/es/config-provider/SizeContext";
import { ChangeEventHandler, forwardRef } from "react";

interface FreqInputProps {
  label?: string;
  placeholder?: string;
  size?: SizeType;
  name?: string;
  value?: string;
  onChange?: ChangeEventHandler | undefined;
}

export const FreqInput = forwardRef(
  (
    {
      label,
      placeholder,
      size = "small",
      onChange,
      name,
      value,
      ...restProps
    }: FreqInputProps,
    ref: any,
  ) => {
    return (
      <div className={styles.container}>
        {label && <Typography.Text strong>{label}</Typography.Text>}
        <Input
          placeholder={placeholder}
          size={size}
          name={name}
          value={value}
          onChange={onChange}
          {...restProps}
          ref={ref}
        />
      </div>
    );
  },
);
