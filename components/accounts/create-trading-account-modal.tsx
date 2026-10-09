"use client";

import { Button, Form, Modal, Select } from "antd";

import { useCreateTradingAccount } from "@/hooks/useAccounts";
import type {
  CreateTradingAccountRequest,
  TradingCurrency,
  TradingPlatform,
} from "@/types/accounts";

type CreateTradingAccountModalProps = {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
};

const platformOptions: Array<{
  label: string;
  value: TradingPlatform;
}> = [
  { label: "MetaTrader 4 (MT4)", value: "MT4" },
  { label: "MetaTrader 5 (MT5)", value: "MT5" },
];

const currencyOptions: Array<{
  label: string;
  value: TradingCurrency;
}> = [
  { label: "US Dollar (USD)", value: "USD" },
  { label: "Euro (EUR)", value: "EUR" },
];

export function CreateTradingAccountModal({
  open,
  onClose,
  onCreated,
}: CreateTradingAccountModalProps) {
  const [form] = Form.useForm<CreateTradingAccountRequest>();
  const createAccount = useCreateTradingAccount();

  const handleSubmit = (values: CreateTradingAccountRequest) => {
    createAccount.mutate(values, {
      onSuccess: () => {
        form.resetFields();
        onCreated();
      },
    });
  };

  const handleClose = () => {
    if (!createAccount.isPending) {
      form.resetFields();
      onClose();
    }
  };

  return (
    <Modal
      title="Open New Trading Account"
      open={open}
      onCancel={handleClose}
      footer={null}
      width={500}
      centered
      closable={!createAccount.isPending}
      maskClosable={!createAccount.isPending}
      destroyOnHidden
    >
      <p className="mb-6 mt-1 text-sm leading-6 text-slate-500">
        Choose your trading platform and account currency to create a new
        trading account.
      </p>

      <Form<CreateTradingAccountRequest>
        form={form}
        layout="vertical"
        requiredMark={false}
        preserve={false}
        onFinish={handleSubmit}
      >
        <Form.Item
          label="Trading Platform"
          name="platform"
          rules={[{ required: true, message: "Please select a platform" }]}
        >
          <Select
            placeholder="Select MT4 or MT5"
            options={platformOptions}
            className="!h-12"
            disabled={createAccount.isPending}
          />
        </Form.Item>

        <Form.Item
          label="Account Currency"
          name="currency"
          rules={[{ required: true, message: "Please select a currency" }]}
        >
          <Select
            placeholder="Select USD or EUR"
            options={currencyOptions}
            className="!h-12"
            disabled={createAccount.isPending}
          />
        </Form.Item>

        <div className="mt-7 flex justify-end gap-3">
          <Button
            onClick={handleClose}
            disabled={createAccount.isPending}
            className="!h-11 !rounded-lg !px-6"
          >
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={createAccount.isPending}
            className="!h-11 !rounded-lg !px-6 !font-semibold"
          >
            Create Account
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
