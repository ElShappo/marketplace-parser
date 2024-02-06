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
  Pagination,
  SortDescriptor,
  Link,
} from "@nextui-org/react";
import AddIcon from "@mui/icons-material/Add";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SearchIcon from "@mui/icons-material/Search";
import UploadIcon from "@mui/icons-material/Upload";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import PlayCircleFilledWhiteIcon from "@mui/icons-material/PlayCircleFilledWhite";
import EditIcon from "@mui/icons-material/Edit";
import { columns } from "../../data";
import { IProductInMarketplace, IProductRecord } from "../../types";
import { OzonParser, ProductRecord, addIsEditedProperty } from "../../utils";
import { Store } from "react-notifications-component";
import Excel from "exceljs";
import Loader from "../../components/Loader";

const TableComponent = () => {
  const [filterValue, setFilterValue] = React.useState("");
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [sortDescriptor, setSortDescriptor] = React.useState<SortDescriptor>({
    column: "id",
    direction: "ascending",
  });
  const [products, setProducts] = useState<IProductRecord[]>([]); // resembles current rows state on the frontend
  const [checkpoint, setCheckpoint] = useState<IProductRecord[]>([]); // resembles db rows state on the backend
  const [page, setPage] = React.useState(1);
  const hasSearchFilter = Boolean(filterValue);
  const [hasFinishedParsing, setHasFinishedParsing] = useState(true);

  const filteredItems = React.useMemo(() => {
    let filteredProducts = [...products];

    if (hasSearchFilter) {
      filteredProducts = filteredProducts.filter((pr) =>
        pr.searchedName.toLowerCase().includes(filterValue.toLowerCase())
      );
    }
    return filteredProducts;
  }, [products, hasSearchFilter, filterValue]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage);

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  // const sortedItems = React.useMemo(() => {
  //   return [...items].sort((a: IProductRecord, b: IProductRecord) => {
  //     const first = a[sortDescriptor.column as keyof IProductRecord] as
  //       | number
  //       | string;
  //     const second = b[sortDescriptor.column as keyof IProductRecord] as
  //       | number
  //       | string;
  //     const cmp = first < second ? -1 : first > second ? 1 : 0;

  //     return sortDescriptor.direction === "descending" ? -cmp : cmp;
  //   });
  // }, [sortDescriptor, items]);

  const deleteAndCreateNew = useCallback((productToDelete: IProductRecord) => {
    console.log("ondelete and create new fired");
    console.log(productToDelete);
    setProducts((products) =>
      products.filter(
        (product) => product.recordId !== productToDelete.recordId
      )
    );
  }, []);

  const addAndCreateNew = useCallback((newProduct: IProductRecord) => {
    console.log("onadd and create new fired");
    setProducts((products) => {
      const arrShallowCopy = [...products];
      const productClone = structuredClone(newProduct);
      arrShallowCopy.push(productClone);

      return arrShallowCopy;
    });
  }, []);

  const updateAndCreateNew = useCallback((replacingProduct: IProductRecord) => {
    console.log("onupdate and create new fired");
    setProducts((products) => {
      const arrShallowCopy = [...products];
      const productClone = structuredClone(replacingProduct);

      const index = products.findIndex(
        (product) =>
          String(product.recordId) === String(replacingProduct.recordId)
      );
      arrShallowCopy[index] = productClone;

      return arrShallowCopy;
    });
  }, []);

  const changeIsEdited = useCallback(
    (product: IProductRecord, newIsEditedVal: boolean) => {
      const replacingProduct = structuredClone(product);
      replacingProduct.isEdited = newIsEditedVal;
      updateAndCreateNew(replacingProduct);
    },
    [updateAndCreateNew]
  );

  const changeId = useCallback(
    (product: IProductRecord, newId: string) => {
      const replacingProduct = structuredClone(product);
      replacingProduct.productId = newId;
      updateAndCreateNew(replacingProduct);
    },
    [updateAndCreateNew]
  );

  const changeName = useCallback(
    (product: IProductRecord, newName: string) => {
      const replacingProduct = structuredClone(product);
      replacingProduct.searchedName = newName;
      updateAndCreateNew(replacingProduct);
    },
    [updateAndCreateNew]
  );

  const addProduct = useCallback(() => {
    console.log("onaddproduct fired");
    const newProduct = new ProductRecord({ isEdited: true }).get();
    addAndCreateNew(newProduct);
  }, [addAndCreateNew]);

  console.log(products);

  const renderCell = React.useCallback(
    (product: IProductRecord, columnKey: React.Key) => {
      function onIdChange(product: IProductRecord, newId: string) {
        changeId(product, newId);
      }

      function onNameChange(product: IProductRecord, newName: string) {
        changeName(product, newName);
      }

      async function onSave(product: IProductRecord) {
        const ids = new Set(checkpoint.map((product) => product.productId));
        const intrinsicIds = new Set(
          checkpoint.map((product) => product.recordId)
        );
        const names = new Set(
          checkpoint.map((product) => product.searchedName)
        );

        // id and name shouldn't be empty
        if (product.productId && product.searchedName) {
          // if we modify already existing snapshot of the row
          if (intrinsicIds.has(product.recordId)) {
            // check that the new id and the new name are unique among other snapshotted rows
            const hasDuplicateId = checkpoint.some(
              (pr) =>
                pr.recordId !== product.recordId &&
                pr.productId === product.productId
            );
            const hasDuplicateName = checkpoint.some(
              (pr) =>
                pr.recordId !== product.recordId &&
                pr.searchedName === product.searchedName
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
            setCheckpoint((checkpoint) => {
              const newCheckpoint = [...checkpoint];
              const index = newCheckpoint.findIndex(
                (pr) => pr.recordId === product.recordId
              );
              newCheckpoint[index] = product;
              newCheckpoint[index].isEdited = false;
              return newCheckpoint;
            });
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
          } else if (
            !ids.has(product.productId) &&
            !names.has(product.searchedName)
          ) {
            setCheckpoint((checkpoint) => [
              ...checkpoint,
              { ...product, isEdited: false },
            ]);
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
            const text = ids.has(product.productId) ? "ID" : "name";
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

      async function onCancel(product: IProductRecord) {
        console.log("oncancel fired");
        const checkpointedProduct = checkpoint.find(
          (pr) => pr.recordId === product.recordId
        );
        console.log(checkpointedProduct);
        if (!checkpointedProduct) {
          deleteAndCreateNew(product);
        } else {
          console.log("updating...");
          updateAndCreateNew(checkpointedProduct);
        }
      }

      function onView(product: IProductRecord) {
        console.log("onview fired");
        changeIsEdited(product, false);
      }

      function onEdit(product: IProductRecord) {
        console.log("onedit fired");
        changeIsEdited(product, true);
      }
      async function onDelete(product: IProductRecord) {
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

      const cellValue = product[columnKey as keyof IProductRecord];
      switch (columnKey) {
        case "marketplaces":
          // eslint-disable-next-line no-case-declarations
          const filteredMarketplaces = (
            cellValue as IProductInMarketplace[]
          ).filter((marketplace) => marketplace.result.productLink);
          return (
            <div className="flex gap-4">
              {!filteredMarketplaces.length ? (
                <p className="italic text-slate-400">No info</p>
              ) : (
                filteredMarketplaces.map((marketplace) => {
                  return (
                    <Link
                      href={
                        marketplace.result.productLink
                          ? marketplace.result.productLink
                          : "#"
                      }
                      target="_blank"
                      underline="always"
                    >
                      {marketplace.marketplaceName}
                    </Link>
                  );
                })
              )}
            </div>
          );
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
                  <DropdownItem
                    onClick={() => onView(product)}
                    key="view"
                    startContent={<VisibilityIcon />}
                  >
                    View
                  </DropdownItem>
                  <DropdownItem
                    onClick={() => onEdit(product)}
                    key="edit"
                    startContent={<EditIcon />}
                  >
                    Edit
                  </DropdownItem>
                  <DropdownItem
                    className="text-danger"
                    color="danger"
                    onClick={() => onDelete(product)}
                    key="delete"
                    startContent={<DeleteIcon />}
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
                size="sm"
                type="text"
                variant="flat"
                label={String(columnKey)}
                value={
                  columnKey === "productId"
                    ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      (product.productId as any)
                    : // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      (product.searchedName as any)
                }
                onChange={(evt) => {
                  console.log(evt.target.value);
                  if ((columnKey as keyof IProductRecord) === "productId") {
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

  const handleImport = React.useCallback(async function (evt: InputEvent) {
    const inputElement = evt.target as HTMLInputElement;
    const files = inputElement.files;

    if (files) {
      const file = files[0];
      const workbook = new Excel.Workbook();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await workbook.xlsx.load(file as any);
      console.log(workbook);

      const worksheet = workbook.getWorksheet("Лист1");
      console.log(worksheet);

      const rows: IProductRecord[] = [];

      worksheet?.eachRow((row, rowNumber) => {
        if (rowNumber > 1) {
          const curr = new ProductRecord({}).get();
          row.eachCell((cell, cellNumber) => {
            cellNumber === 1
              ? (curr.productId = cell.value!.toString())
              : (curr.searchedName = cell.value!.toString());
          });
          rows.push(curr);
        }
      });
      console.log(rows);

      try {
        const promiseDelete = await fetch("http://localhost:3001/deleteAll", {
          method: "PUT",
        });

        if (promiseDelete.ok) {
          console.log("products deletion successful");
        } else {
          throw new Error("couldn't delete products");
        }

        const promiseAdd = await fetch("http://localhost:3001/addProducts", {
          method: "POST",
          body: JSON.stringify(rows),
          headers: {
            "Content-Type": "application/json;charset=utf-8",
          },
        });

        if (promiseAdd.ok) {
          console.log("products were successfully added");
        } else {
          throw new Error("couldn't add products");
        }

        setProducts(() => rows);
        setCheckpoint(() => rows);
      } catch (error) {
        console.error(error);
      }
    }
  }, []);

  const topContent = React.useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3 items-end flex-wrap">
          <Input
            isClearable
            className="w-full sm:max-w-[44%] text-dark"
            placeholder="Search by name..."
            startContent={<SearchIcon />}
            value={filterValue}
            onClear={() => onClear()}
            onValueChange={onSearchChange}
          />
          <div className="flex flex-wrap items-center justify-center gap-3">
            <label
              htmlFor="excel"
              className="text-center flex-initial max-sm:pt-2"
            >
              Import XLSX
            </label>
            <Input
              className="w-auto"
              id="excel"
              size="sm"
              color="primary"
              endContent={<UploadIcon />}
              type="file"
              accept=".xlsx"
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onInput={handleImport as any}
            ></Input>

            <Button
              className="flex-initial"
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
    handleImport,
    filterValue,
    onSearchChange,
    products.length,
    onRowsPerPageChange,
    onClear,
    addProduct,
  ]);

  const handleParse = React.useCallback(async () => {
    const productNames = checkpoint.map((pr) => pr.searchedName);
    const ozonParser = new OzonParser();
    const resArray = [];

    setHasFinishedParsing(false);

    for (const productName of productNames) {
      console.log(productName);
      const delay = new Promise((resolve) => {
        setTimeout(resolve, 200);
      });
      await delay;
      const res = await ozonParser.parseProduct(productName);
      console.log(res);
      resArray.push(res);
    }
    console.log(resArray);
    const newProducts = [...checkpoint];
    for (let i = 0; i < newProducts.length; ++i) {
      const marketplaces = newProducts[i].marketplaces;

      const ozon = marketplaces.find((mp) => mp.marketplaceName === "ozon");
      ozon!.result = {
        productName: resArray[i].name,
        productLink: resArray[i].link,
        productPriceHistory: [
          ...ozon!.result.productPriceHistory,
          resArray[i].price,
        ],
      };
    }
    console.log(JSON.stringify(newProducts));
    setProducts(newProducts);
    setCheckpoint(newProducts);

    try {
      const response = await fetch("http://localhost:3001/updateProducts", {
        method: "PUT",
        body: JSON.stringify(newProducts),
        headers: {
          "Content-Type": "application/json;charset=utf-8",
        },
      });
      if (response.ok) {
        console.log("success!");
      } else {
        console.error("server error!");
      }
    } catch (error) {
      console.error("client error!");
    }

    setHasFinishedParsing(true);
  }, [checkpoint]);

  const bottomContent = React.useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
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
        <div className="flex justify-center">
          <Button
            color="warning"
            endContent={<PlayCircleFilledWhiteIcon />}
            size="lg"
            className="font-bold uppercase"
            onClick={handleParse}
          >
            Parse
          </Button>
        </div>
      </div>
    );
  }, [page, pages, onPreviousPage, onNextPage, handleParse]);

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
    <div className="h-full">
      {hasFinishedParsing ? (
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
            {(product: IProductRecord) => (
              <TableRow
                key={product.recordId}
                className="border-b-1 border-slate-300"
              >
                {(columnKey) => (
                  <TableCell key={`${product.recordId}, ${columnKey}`}>
                    {renderCell(product, columnKey)}
                  </TableCell>
                )}
              </TableRow>
            )}
          </TableBody>
        </Table>
      ) : (
        <Loader label={"Parsing marketplaces..."} />
      )}
    </div>
  );
};

export default TableComponent;
