import React from "react";
import { IMarketplace, IProductExtended, Property } from "../types";
import {
  Button,
  Chip,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  TableCell,
  TableRow,
} from "@nextui-org/react";
import CloseIcon from "@mui/icons-material/Close";
import MoreVertIcon from "@mui/icons-material/MoreVert";

type RowProps = {
  product: IProductExtended;

  onIdChange(product: IProductExtended, newId: string | number): void;
  onNameChange(product: IProductExtended, newName: string): void;

  onSave: (product: IProductExtended) => Promise<void>;
  onCancel: (product: IProductExtended) => Promise<void>;

  onView: (product: IProductExtended) => void;
  onEdit: (product: IProductExtended) => void;
  onDelete: (product: IProductExtended) => Promise<void>;
};

const Row = ({
  product,
  onIdChange,
  onNameChange,
  onSave,
  onCancel,
  onView,
  onEdit,
  onDelete,
}: RowProps) => {
  const renderCell = (product: IProductExtended, columnKey: React.Key) => {
    const cellValue = product[columnKey as keyof IProductExtended];
    switch (columnKey) {
      case "marketplaces":
        return (cellValue as IMarketplace[]).map((marketplace) => {
          return (
            <div className="text-dark" key={marketplace.name}>
              <div className="py-2 flex items-center gap-2">
                <section className="bg-red-400 rounded-xl flex-auto flex items-stretch content-stretch p-3 gap-3">
                  <Chip
                    key={`${product.id}, ${marketplace.name}`}
                    className="font-light"
                    color="danger"
                  >
                    {marketplace.name}
                  </Chip>
                  <div>
                    <Divider
                      orientation="vertical"
                      className="bg-neutral-800"
                    />
                  </div>
                  {Array.from(marketplace.properties).map(
                    (property: Property) => {
                      return (
                        <Chip
                          key={`${product.id}, ${marketplace.name}, ${property}`}
                          className="font-light"
                          color="warning"
                          // onClose={isEdited ? }
                        >
                          {property}
                        </Chip>
                      );
                    }
                  )}
                </section>
                {product.isEdited ? (
                  <Button
                    isIconOnly
                    variant="light"
                    color="danger"
                    className="grow-0"
                  >
                    <CloseIcon />
                  </Button>
                ) : null}
              </div>
              <Divider />
            </div>
          );
        });
      case "actions":
        return (
          <div className="relative flex justify-end items-center gap-2">
            <Dropdown className="text-dark">
              <DropdownTrigger>
                {product.isEdited ? (
                  <div className="flex gap-2">
                    <Button
                      color="primary"
                      size="sm"
                      onClick={() => onSave(product)}
                    >
                      Save
                    </Button>
                    <Button size="sm" onClick={() => onCancel(product)}>
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    data-key={product.id}
                  >
                    <MoreVertIcon className="text-default-400" />
                  </Button>
                )}
              </DropdownTrigger>
              <DropdownMenu>
                <DropdownItem onClick={() => onView(product)} key="view">
                  View
                </DropdownItem>
                <DropdownItem onClick={() => onEdit(product)} key="edit">
                  Edit
                </DropdownItem>
                <DropdownItem
                  className="text-danger"
                  color="danger"
                  onClick={() => onDelete(product)}
                  key="delete"
                >
                  Delete
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        );
      default:
        if (product.isEdited) {
          return (
            <Input
              type="text"
              variant="flat"
              label={String(columnKey)}
              value={
                columnKey === "id"
                  ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (product.id as any)
                  : // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (product.name as any)
              }
              onValueChange={(val) => {
                if ((columnKey as keyof IProductExtended) === "id") {
                  onIdChange(product, val);
                } else {
                  onNameChange(product, val);
                }
              }}
            />
          );
        } else {
          return (
            <div className="text-dark">{cellValue as string | number}</div>
          );
        }
    }
  };
  return (
    <TableRow key={product.id} className="border-2 border-slate-300">
      {(columnKey) => (
        <TableCell key={`${product.id}, ${columnKey}`}>
          {renderCell(product, columnKey)}
        </TableCell>
      )}
    </TableRow>
  );
};

export default Row;
