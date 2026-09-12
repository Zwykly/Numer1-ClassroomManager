import { Popover } from "radix-ui";
import { MonthPicker } from "./MonthPicker";
import { useSelectedDate } from "@/stores/useSelectedDateStore";

export function MonthPickerPopover () {

    const selectedDate = useSelectedDate();

    return (
        <Popover.Root >
            <Popover.Trigger asChild>
                <button className="w-full flex justify-start text-black font-bold">
                    {selectedDate.toLocaleString("en-US", {month: "long"})} {selectedDate.getFullYear()}
                </button>
            </Popover.Trigger>
            <Popover.Content className="w-full flex flex-col bg-white shadow-lg rounded p-4">
                <MonthPicker />
                <Popover.Close className="w-full flex justify-center bg-orange text-white mt-2 font-bold py-2 rounded">
                    Select
                </Popover.Close>
            </Popover.Content>
        </Popover.Root>
    );
};