import { useSelectedDate, useSelectedDateActions } from '@/stores/useSelectedDateStore';
import { Button } from './Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { se } from 'date-fns/locale';
import { isSameYear } from 'date-fns';



export function MonthPicker () {

    const selectedDate = useSelectedDate();
    const { setSelectedDate } = useSelectedDateActions();
    
    const today = new Date();

    // Function that changes the selected day state in store.
    const changeMonth = (newSelectedDate: Date) => {
        setSelectedDate(newSelectedDate);
    }

    const goBackAYear = () => {
        const newDate = new Date(selectedDate.getFullYear() - 1, selectedDate.getMonth(), selectedDate.getDate());
        setSelectedDate(newDate);
    }
    const goForwardAYear = () => {
        const newDate = new Date(selectedDate.getFullYear() + 1, selectedDate.getMonth(), selectedDate.getDate());
        setSelectedDate(newDate);
    }

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    

    return (
        <div className="w-full flex flex-col items-center gap-2">
            <div className='flex flex-row w-full items-center justify-center'>
                <button className="w-1/6 flex justify-center" onClick={() => goBackAYear()} > <ChevronLeft color='black'/> </button>
                <div className="w-2/3 h-full flex items-center justify-center text-sm text-black font-bold">{selectedDate.getFullYear()}</div>
                <button className="w-1/6 flex justify-center" onClick={() => goForwardAYear()} > <ChevronRight color="black"/> </button>
            </div>
            <div className='w-full'>
                <div className='grid grid-cols-3 grid-rows-4 gap-3 w-full h-auto text-center text-darker-grey font-bold px-2 py-0.5'>
                    {months.map((month, index) => 
                        {
                            const isSelectedMonth = index === selectedDate.getMonth();
                            const isCurrentMonth = isSameYear(selectedDate, today) && today.getMonth() ===  index;

                            let className = [`rounded-sm px-2 py-1`,
                                isSelectedMonth && 'bg-orange text-white',
                                isCurrentMonth && 'ring-2 ring-orange'
                            ].filter(Boolean).join(' ');        
                        
                            return (
                                <button className={className} onClick={() => changeMonth(new Date(selectedDate!.getFullYear(), index, 1))}>{month}</button>
                            );
        
                        })}
                </div>
            </div>
        </div>
    );
}