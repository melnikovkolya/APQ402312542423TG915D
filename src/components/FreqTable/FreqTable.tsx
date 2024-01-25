import { Pagination, Table } from "antd";
import styles from "./style.module.css";

interface FreqTableProps {
  total: number;
  dataSource: any[];
  columns: any[];
  pageSize: number;
  onPaginationChange: (page: number, pageSize: number) => void;
  isLoading: boolean;
  totalLabel?: (total: number, range: [number, number]) => string;
  current?: number;
}

export const FreqTable = ({
  total,
  dataSource,
  columns,
  pageSize,
  onPaginationChange,
  isLoading,
  totalLabel,
  current,
}: FreqTableProps) => (
  <div className={styles.container}>
    <div className={styles.paginationContainer}>
      {total ? (
        <Pagination
          onChange={onPaginationChange}
          showSizeChanger={false}
          defaultCurrent={1}
          pageSize={pageSize}
          total={total}
          showTotal={totalLabel}
          current={current}
        />
      ) : null}
    </div>
    <Table
      dataSource={dataSource}
      columns={columns}
      pagination={{ position: ["none"] }}
      loading={isLoading}
    />
  </div>
);
