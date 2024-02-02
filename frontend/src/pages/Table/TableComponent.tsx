import React, { useCallback, useEffect, useState } from "react";
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
import { IMarketplace, IProductExtended, Property } from "../../types";
import { ProductExtended, addIsEditedProperty } from "../../utils";
import { Store } from "react-notifications-component";

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
  }, [products, hasSearchFilter, filterValue]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage);

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  // const sortedItems = React.useMemo(() => {
  //   return [...items].sort((a: IProductExtended, b: IProductExtended) => {
  //     const first = a[sortDescriptor.column as keyof IProductExtended] as
  //       | number
  //       | string;
  //     const second = b[sortDescriptor.column as keyof IProductExtended] as
  //       | number
  //       | string;
  //     const cmp = first < second ? -1 : first > second ? 1 : 0;

  //     return sortDescriptor.direction === "descending" ? -cmp : cmp;
  //   });
  // }, [sortDescriptor, items]);

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

  const deleteAndCreateNew = useCallback(
    (productToDelete: IProductExtended) => {
      console.log("ondelete and create new fired");
      console.log(productToDelete);
      setProducts((products) =>
        products.filter(
          (product) => product.intrinsicId !== productToDelete.intrinsicId
        )
      );
    },
    []
  );

  const addAndCreateNew = useCallback((newProduct: IProductExtended) => {
    console.log("onadd and create new fired");
    setProducts((products) => {
      const arrShallowCopy = [...products];
      const productClone = structuredClone(newProduct);
      arrShallowCopy.push(productClone);

      return arrShallowCopy;
    });
  }, []);

  const updateAndCreateNew = useCallback(
    (replacingProduct: IProductExtended) => {
      console.log("onupdate and create new fired");
      setProducts((products) => {
        const arrShallowCopy = [...products];
        const productClone = structuredClone(replacingProduct);

        const index = products.findIndex(
          (product) =>
            String(product.intrinsicId) === String(replacingProduct.intrinsicId)
        );
        arrShallowCopy[index] = productClone;

        return arrShallowCopy;
      });
    },
    []
  );

  const changeIsEdited = useCallback(
    (product: IProductExtended, newIsEditedVal: boolean) => {
      const replacingProduct = structuredClone(product);
      replacingProduct.isEdited = newIsEditedVal;
      updateAndCreateNew(replacingProduct);
    },
    [updateAndCreateNew]
  );

  const changeId = useCallback(
    (product: IProductExtended, newId: string | number) => {
      const replacingProduct = structuredClone(product);
      replacingProduct.id = newId;
      updateAndCreateNew(replacingProduct);
    },
    [updateAndCreateNew]
  );

  const changeName = useCallback(
    (product: IProductExtended, newName: string) => {
      const replacingProduct = structuredClone(product);
      replacingProduct.name = newName;
      updateAndCreateNew(replacingProduct);
    },
    [updateAndCreateNew]
  );

  const addProduct = useCallback(() => {
    console.log("onaddproduct fired");
    const newProduct = new ProductExtended({ isEdited: true }).get();
    addAndCreateNew(newProduct);
  }, [addAndCreateNew]);

  console.log(products);

  const renderCell = React.useCallback(
    (product: IProductExtended, columnKey: React.Key) => {
      function onIdChange(product: IProductExtended, newId: string | number) {
        changeId(product, newId);
      }

      function onNameChange(product: IProductExtended, newName: string) {
        changeName(product, newName);
      }

      async function onSave(product: IProductExtended) {
        const ids = new Set(checkpoint.map((product) => product.id));
        const intrinsicIds = new Set(
          checkpoint.map((product) => product.intrinsicId)
        );
        const names = new Set(checkpoint.map((product) => product.name));

        const marketplaces = product.marketplaces.map((marketplace) => {
          return {
            name: marketplace.name,
            properties: Array.from(marketplace.properties),
          };
        });
        product.marketplaces = marketplaces;

        // id and name shouldn't be empty
        if (product.id && product.name) {
          // if we modify already existing snapshot of the row
          if (intrinsicIds.has(product.intrinsicId)) {
            // check that the new id and the new name are unique among other snapshotted rows
            const hasDuplicateId = checkpoint.some(
              (pr) =>
                pr.intrinsicId !== product.intrinsicId && pr.id === product.id
            );
            const hasDuplicateName = checkpoint.some(
              (pr) =>
                pr.intrinsicId !== product.intrinsicId &&
                pr.name === product.name
            );
            if (hasDuplicateId || hasDuplicateName) {
              console.warn(
                "the row which previously had already existed was assigned a duplicate id or name"
              );
              const text = hasDuplicateId ? "ID" : "name";
              Store.addNotification({
                title: "Couldn't save the product",
                message: `Product with such ${text} already exists`,
                type: "danger",
                insert: "top",
                container: "top-right",
                animationIn: ["animate__animated", "animate__fadeIn"],
                animationOut: ["animate__animated", "animate__fadeOut"],
                dismiss: {
                  duration: 4000,
                  onScreen: true,
                },
              });
              return;
            }
            changeIsEdited(product, false);
            console.log("has existed previously");

            try {
              const res = await fetch("http://localhost:3001/updateProducts", {
                method: "PUT",
                body: JSON.stringify(product),
                headers: {
                  "Content-Type": "application/json;charset=utf-8",
                },
              });
              if (res.ok) {
                console.log("success!");
              } else {
                console.error("server error!");
              }
            } catch (error) {
              console.error("client error!");
            }
            // if the row hasn't existed previously
          } else if (!ids.has(product.id) && !names.has(product.name)) {
            changeIsEdited(product, false);
            console.log("has not existed previously");
            console.log(product);
            try {
              const res = await fetch("http://localhost:3001/addProducts", {
                method: "POST",
                body: JSON.stringify(product),
                headers: {
                  "Content-Type": "application/json;charset=utf-8",
                },
              });
              if (res.ok) {
                console.log("success!");
              } else {
                console.error("server error!");
              }
            } catch (error) {
              console.error("client error!");
            }
          } else {
            console.warn(
              "trying to add row with id or name that already exist"
            );
            const text = ids.has(product.id) ? "ID" : "name";
            Store.addNotification({
              title: "Couldn't save the product",
              message: `Product with such ${text} already exists`,
              type: "danger",
              insert: "top",
              container: "top-right",
              animationIn: ["animate__animated", "animate__fadeIn"],
              animationOut: ["animate__animated", "animate__fadeOut"],
              dismiss: {
                duration: 4000,
                onScreen: true,
              },
            });
          }
        } else {
          console.warn("some fields left empty");
          Store.addNotification({
            title: "Couldn't save the product",
            message: "Please, fill all fields to save the product",
            type: "danger",
            insert: "top",
            container: "top-right",
            animationIn: ["animate__animated", "animate__fadeIn"],
            animationOut: ["animate__animated", "animate__fadeOut"],
            dismiss: {
              duration: 4000,
              onScreen: true,
            },
          });
        }
      }

      async function onCancel(product: IProductExtended) {
        console.log("oncancel fired");
        const checkpointedProduct = checkpoint.find(
          (pr) => pr.intrinsicId === product.intrinsicId
        );
        if (!checkpointedProduct) {
          deleteAndCreateNew(product);
        } else {
          updateAndCreateNew(checkpointedProduct);
        }
      }

      function onView(product: IProductExtended) {
        console.log("onview fired");
        changeIsEdited(product, false);
      }

      function onEdit(product: IProductExtended) {
        console.log("onedit fired");
        changeIsEdited(product, true);
      }
      async function onDelete(product: IProductExtended) {
        console.log("ondelete fired");
        deleteAndCreateNew(product);

        try {
          const res = await fetch("http://localhost:3001/deleteProducts", {
            method: "PUT",
            body: JSON.stringify(product),
            headers: {
              "Content-Type": "application/json;charset=utf-8",
            },
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

      const cellValue = product[columnKey as keyof IProductExtended];
      switch (columnKey) {
        case "marketplaces":
          return (cellValue as IMarketplace[]).map((marketplace) => {
            return (
              <div className="text-dark" key={marketplace.name}>
                <div className="py-2 flex items-center gap-2">
                  <section className="bg-red-400 rounded-xl flex-auto flex items-stretch content-stretch p-3 gap-3">
                    <Chip
                      key={`${product.intrinsicId}, ${marketplace.name}`}
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
                            key={`${product.intrinsicId}, ${marketplace.name}, ${property}`}
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
                    <Button isIconOnly size="sm" variant="light">
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
                onChange={(evt) => {
                  console.log(evt.target.value);
                  if ((columnKey as keyof IProductExtended) === "id") {
                    onIdChange(product, evt.target.value);
                  } else {
                    onNameChange(product, evt.target.value);
                  }
                  evt.target.focus();
                }}
              />
            );
          } else {
            return (
              <div className="text-dark">{cellValue as string | number}</div>
            );
          }
      }
    },
    [
      changeId,
      changeIsEdited,
      changeName,
      checkpoint,
      deleteAndCreateNew,
      updateAndCreateNew,
    ]
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
    products.length,
    onRowsPerPageChange,
    onClear,
    addProduct,
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
  }, [page, pages, onPreviousPage, onNextPage]);

  useEffect(() => {
    async function fetcher() {
      const promise = await fetch("http://localhost:3001/getProducts");
      const res = await promise.json();
      res.forEach(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (row: any) => (row.marketplaces = JSON.parse(row.marketplaces))
      );
      console.log(res);
      setProducts(addIsEditedProperty(res));
      setCheckpoint(addIsEditedProperty(res));
    }
    fetcher();
  }, []);

  return (
    <Table
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
      <TableBody emptyContent={"No results"} items={items}>
        {(product: IProductExtended) => (
          <TableRow
            key={product.intrinsicId}
            className="border-b-1 border-slate-300"
          >
            {(columnKey) => (
              <TableCell key={`${product.intrinsicId}, ${columnKey}`}>
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
