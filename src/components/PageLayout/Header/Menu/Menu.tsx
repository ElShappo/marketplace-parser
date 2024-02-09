import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/react";
import ListAltIcon from "@mui/icons-material/ListAlt";
import StackedLineChartIcon from "@mui/icons-material/StackedLineChart";
import InfoIcon from "@mui/icons-material/Info";
import MenuIcon from "@mui/icons-material/Menu";

const Menu = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleOpen = () => {
    onOpen();
  };
  return (
    <>
      <section className="flex items-center justify-evenly flex-auto max-lg:hidden gap-2">
        <Button
          className="xl:px-12 max-lg:px-10 py-6"
          color="primary"
          variant="shadow"
          startContent={<ListAltIcon />}
        >
          Products
        </Button>
        <Button
          className="xl:px-12 max-lg:px-10 py-6"
          color="primary"
          variant="shadow"
          startContent={<StackedLineChartIcon />}
        >
          Charts
        </Button>
        <Button
          className="xl:px-12 max-lg:px-10 py-6"
          color="primary"
          variant="shadow"
          startContent={<InfoIcon />}
          onPress={() => handleOpen()}
        >
          Info
        </Button>
      </section>

      <Modal backdrop="blur" isOpen={isOpen} onClose={onClose}>
        <ModalContent className="text-black">
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Parse details
              </ModalHeader>
              <ModalBody>
                <p className="pb-5">
                  Latest parse date:
                  {" " + localStorage.getItem("latestParseDate") || (
                    <span className="text-gray-500 italic"> no info</span>
                  )}
                </p>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                {localStorage.getItem("latestParseDate") ? (
                  <Button color="primary" onPress={onClose}>
                    Get last export
                  </Button>
                ) : null}
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <section className="lg:hidden flex items-center">
        <Dropdown backdrop="blur">
          <DropdownTrigger>
            <Button variant="shadow" color="primary" className="py-4">
              <MenuIcon />
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            variant="shadow"
            aria-label="Static Actions"
            color="success"
            className="text-black"
          >
            <DropdownItem key="new" startContent={<ListAltIcon />}>
              Products
            </DropdownItem>
            <DropdownItem key="copy" startContent={<StackedLineChartIcon />}>
              Charts
            </DropdownItem>
            <DropdownItem
              key="edit"
              startContent={<InfoIcon />}
              onPress={() => handleOpen()}
            >
              Info
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </section>
    </>
  );
};

export default Menu;
