import React, { useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Chip,
  Pagination,
  SortDescriptor,
  Divider,
} from "@nextui-org/react";
import AddIcon from "@mui/icons-material/Add";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import { columns } from "../../data";
import {
  IMarketplace,
  IProduct,
  IProductExtended,
  Property,
} from "../../types";
import {
  ProductExtended,
  addAndCreateNew,
  addIsEditedProperty,
  changeId,
  changeIsEdited,
  changeName,
  deleteAndCreateNew,
  updateAndCreateNew,
} from "../../utils";

const TableComponent = () => {
  const [filterValue, setFilterValue] = React.useState("");
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [sortDescriptor, setSortDescriptor] = React.useState<SortDescriptor>({
    column: "id",
    direction: "ascending",
  });
  const [products, setProducts] = useState<IProductExtended[]>([]); // resembles current rows state on the frontend
  const [checkpoint, setCheckpoint] = useState<IProductExtended[]>([]); // resembles db rows state on the backend
  const [page, setPage] = React.useState(1);
  const hasSearchFilter = Boolean(filterValue);

  const filteredItems = React.useMemo(() => {
    let filteredUsers = [...products];

    if (hasSearchFilter) {
      filteredUsers = filteredUsers.filter((user) =>
        user.name.toLowerCase().includes(filterValue.toLowerCase())
      );
    }
    return filteredUsers;
  }, [products, filterValue]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage);

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = React.useMemo(() => {
    return [...items].sort((a: IProductExtended, b: IProductExtended) => {
      const first = a[sortDescriptor.column as keyof IProductExtended] as
        | number
        | string;
      const second = b[sortDescriptor.column as keyof IProductExtended] as
        | number
        | string;
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  // const handleClose = (marketplaceToRemove: IMarketplace) => {
  //   setMarketplacesLabels(
  //     martketplacesLabels.filter(
  //       (marketplace) => marketplace !== marketplaceToRemove
  //     )
  //   );
  //   if (martketplacesLabels.length === 1) {
  //     setMarketplacesLabels(initialMarketplacesLabels);
  //   }
  // };

  async function onSave(product: IProductExtended) {
    const ids = new Set(products.map((product) => product.id));
    const names = new Set(products.map((product) => product.name));

    if (
      product.id &&
      product.name &&
      !ids.has(product.id) &&
      !names.has(product.name)
    ) {
      changeIsEdited(products, product.intrinsicId, false);
    }
    try {
      const res = await fetch("http://localhost:3001/addProducts", {
        method: "POST",
        body: JSON.stringify(product),
      });
      if (res.ok) {
        console.log("success!");
      } else {
        console.error("server error!");
      }
    } catch (error) {
      console.error("client error!");
    }
  }

  async function onCancel(product: IProductExtended) {
    console.log("oncancel fired");
    const checkpointedProduct = checkpoint.find(
      (pr) => pr.intrinsicId === product.intrinsicId
    )!;
    updateAndCreateNew(products, checkpointedProduct);
  }

  function onView(product: IProductExtended) {
    console.log("onview fired");
    setProducts(changeIsEdited(products, product.intrinsicId, false));
  }

  function onEdit(product: IProductExtended) {
    console.log("onedit fired");
    setProducts(changeIsEdited(products, product.intrinsicId, true));
  }
  function onDelete(product: IProductExtended) {
    console.log("ondelete fired");
    setProducts(deleteAndCreateNew(products, product));
  }

  function addProduct() {
    console.log("onaddproduct fired");
    const newProduct = new ProductExtended({ isEdited: true }).get();
    setProducts(() => addAndCreateNew(products, newProduct));
  }

  console.log(products);

  const renderCell = React.useCallback(
    (product: IProductExtended, columnKey: React.Key) => {
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
                  <DropdownItem onClick={() => onView(product)}>
                    View
                  </DropdownItem>
                  <DropdownItem onClick={() => onEdit(product)}>
                    Edit
                  </DropdownItem>
                  <DropdownItem onClick={() => onDelete(product)}>
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
                // value={}
                onValueChange={(val) => {
                  // console.log(product);
                  console.log(products);
                  if ((columnKey as keyof IProductExtended) === "id") {
                    console.log(products);
                    setProducts(changeId(products, product.intrinsicId, val));
                  } else {
                    setProducts(changeName(products, product.intrinsicId, val));
                  }
                }}
                // classNames={{
                //   input: ["bg-dark"],
                //   innerWrapper: "bg-dark",
                //   inputWrapper: ["bg-dark"],
                //   mainWrapper: ["bg-dark"],
                //   base: ["bg-dark"],
                //   helperWrapper: ["bg-dark"],
                // }}
              />
            );
          } else {
            return (
              <div className="text-dark">{cellValue as string | number}</div>
            );
          }
      }
    },
    [products]
  );

  const onNextPage = React.useCallback(() => {
    if (page < pages) {
      setPage(page + 1);
    }
  }, [page, pages]);

  const onPreviousPage = React.useCallback(() => {
    if (page > 1) {
      setPage(page - 1);
    }
  }, [page]);

  const onRowsPerPageChange = React.useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setRowsPerPage(Number(e.target.value));
      setPage(1);
    },
    []
  );

  const onSearchChange = React.useCallback((value?: string) => {
    if (value) {
      setFilterValue(value);
      setPage(1);
    } else {
      setFilterValue("");
    }
  }, []);

  const onClear = React.useCallback(() => {
    setFilterValue("");
    setPage(1);
  }, []);

  const topContent = React.useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3 items-end">
          <Input
            isClearable
            className="w-full sm:max-w-[44%] text-dark"
            placeholder="Search by name..."
            startContent={<SearchIcon />}
            value={filterValue}
            onClear={() => onClear()}
            onValueChange={onSearchChange}
          />
          <div className="flex gap-3">
            <Button
              color="primary"
              endContent={<AddIcon />}
              onClick={() => addProduct()}
            >
              Add New
            </Button>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">
            Total {products.length} products
          </span>
          <label className="flex items-center text-default-400 text-small">
            Rows per page:
            <select
              className="bg-transparent outline-none text-default-400 text-small"
              onChange={onRowsPerPageChange}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
            </select>
          </label>
        </div>
      </div>
    );
  }, [
    filterValue,
    onSearchChange,
    onRowsPerPageChange,
    products.length,
    hasSearchFilter,
  ]);

  const bottomContent = React.useMemo(() => {
    return (
      <div className="py-2 px-2 flex flex-wrap justify-between items-center">
        <Pagination
          isCompact
          showControls
          showShadow
          color="primary"
          page={page}
          total={pages}
          onChange={setPage}
        />
        <div className="hidden sm:flex w-[30%] justify-end gap-2">
          <Button
            isDisabled={pages === 1}
            size="sm"
            variant="flat"
            onPress={onPreviousPage}
          >
            Previous
          </Button>
          <Button
            isDisabled={pages === 1}
            size="sm"
            variant="flat"
            onPress={onNextPage}
          >
            Next
          </Button>
        </div>
      </div>
    );
  }, [items.length, page, pages, hasSearchFilter]);

  useEffect(() => {
    async function fetcher() {
      const promise = await fetch("http://localhost:3001/getProducts");
      const res = (await promise.json()) as IProduct[];
      setProducts(addIsEditedProperty(res));
      setCheckpoint(addIsEditedProperty(res));
    }
    fetcher();
  }, []);

  return (
    <Table
      // isStriped
      radius="md"
      className="p-20"
      aria-label="Table of products"
      isHeaderSticky
      bottomContent={bottomContent}
      bottomContentPlacement="outside"
      classNames={{
        wrapper: "max-h-[382px]",
      }}
      sortDescriptor={sortDescriptor}
      topContent={topContent}
      topContentPlacement="outside"
      onSortChange={setSortDescriptor}
    >
      <TableHeader columns={columns}>
        {(column) => (
          <TableColumn
            key={column.uid}
            align={column.uid === "actions" ? "center" : "start"}
            allowsSorting={column.sortable}
          >
            {column.name}
          </TableColumn>
        )}
      </TableHeader>
      <TableBody
        emptyContent={"No results"}
        items={sortedItems as unknown as IProductExtended[]}
      >
        {(product: IProductExtended) => (
          <TableRow key={product.id} className="border-2 border-slate-300">
            {(columnKey) => (
              <TableCell key={`${product.id}, ${columnKey}`}>
                {renderCell(product, columnKey)}
              </TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default TableComponent;
