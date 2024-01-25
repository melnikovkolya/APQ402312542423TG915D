import { InputNumber, Typography } from "antd";
import styles from "./style.module.css";
import { SizeType } from "antd/es/config-provider/SizeContext";
import { forwardRef } from "react";

interface FreqInputNumberProps {
  label?: string;
  placeholder?: string;
  size?: SizeType;
  min?: number;
  max?: number;
  value?: number | null;
  defaultValue?: number;
  onChange?: (value: number | null) => void;
  name?: string;
  disabled?: boolean;
}

export const FreqInputNumber = forwardRef(
  (
    {
      label,
      placeholder,
      size = "small",
      min = 0,
      max,
      value,
      defaultValue,
      onChange,
      name,
      disabled,
      ...restProps
    }: FreqInputNumberProps,
    ref: any,
  ) => {
    return (
      <div className={styles.container}>
        {label && <Typography.Text strong>{label}</Typography.Text>}
        <InputNumber
          placeholder={placeholder}
          size={size}
          min={min}
          max={max}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          disabled={disabled}
          {...restProps}
          ref={ref}
        />
      </div>
    );
  },
);
