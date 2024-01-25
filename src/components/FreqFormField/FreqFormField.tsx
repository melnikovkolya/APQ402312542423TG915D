import { Control, Controller } from "react-hook-form";
import { cloneElement, ReactElement } from "react";
import styles from "./style.module.css";
import { Typography } from "antd";

interface FreqFormFieldProps {
  name: string;
  control: Control<any>;
  children: ReactElement;
  error?: string;
}

export const FreqFormField = ({
  name,
  control,
  children,
  error,
}: FreqFormFieldProps) => {
  return (
    <div className={styles.container}>
      <Controller
        name={name}
        control={control}
        render={({ field }) =>
          cloneElement(children, {
            ...field,
          })
        }
      />
      <div className={styles.errorContainer}>
        <Typography.Text type="danger">{error}</Typography.Text>
      </div>
    </div>
  );
};
