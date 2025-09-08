import React from 'react';
import { DateRange } from 'react-date-range';
import { enUS } from 'date-fns/locale';

function DateRangeFilter({ value, onChange }) {
    const selectionRange = {
        startDate: value.start ? new Date(value.start) : new Date(),
        endDate: value.end ? new Date(value.end) : new Date(),
        key: 'selection',
    };

    function handleSelect(ranges) {
        onChange({
            start: ranges.selection.startDate,
            end: ranges.selection.endDate,
        });
    }

    return (
        <div style={{ minWidth: 280 }}>
            <DateRange
                ranges={[selectionRange]}
                onChange={handleSelect}
                maxDate={new Date()}
                showMonthAndYearPickers={true}
                direction="horizontal"
                rangeColors={['#3b82f6']}
                locale={enUS}
            />
        </div>
    );
}

export default DateRangeFilter;
