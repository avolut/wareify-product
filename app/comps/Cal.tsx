import dayjs from "dayjs";
import { ColorKeys, DatepickerType, Period } from "lib/comps/custom/Datepicker";
import Calendar from "lib/comps/custom/Datepicker/components/Calendar";
import {
  COLORS,
  DATE_FORMAT,
  DEFAULT_COLOR,
  LANGUAGE,
} from "lib/comps/custom/Datepicker/constants";
import DatepickerContext from "lib/comps/custom/Datepicker/contexts/DatepickerContext";
import {
  formatDate,
  nextMonth,
  previousMonth,
} from "lib/comps/custom/Datepicker/helpers";
import useOnClickOutside from "lib/comps/custom/Datepicker/hooks";
import { useLocal } from "lib/utils/use-local";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const DCalender: React.FC<DatepickerType> = ({
  primaryColor = "blue",
  value = null,
  onChange,
  useRange = true,
  showFooter = false,
  showShortcuts = false,
  configs = undefined,
  asSingle = false,
  placeholder = null,
  separator = "~",
  startFrom = null,
  i18n = LANGUAGE,
  disabled = false,
  inputClassName = null,
  containerClassName = null,
  toggleClassName = null,
  toggleIcon = undefined,
  displayFormat = DATE_FORMAT,
  readOnly = false,
  minDate = null,
  maxDate = null,
  dateLooking = "forward",
  disabledDates = null,
  inputId,
  inputName,
  startWeekOn = "sun",
  classNames = undefined,
  popoverDirection = undefined,
  mode = "daily",
  onMark,
  onLoad,
  style,
}) => {
  const local = useLocal({ open: false });
  // Ref
  const containerRef = useRef<HTMLDivElement | null>(null);
  const calendarContainerRef = useRef<HTMLDivElement | null>(null);
  const arrowRef = useRef<HTMLDivElement | null>(null);

  // State
  const [firstDate, setFirstDate] = useState<dayjs.Dayjs>(
    startFrom && dayjs(startFrom).isValid() ? dayjs(startFrom) : dayjs()
  );
  const [secondDate, setSecondDate] = useState<dayjs.Dayjs>(
    nextMonth(firstDate)
  );
  const [period, setPeriod] = useState<Period>({
    start: null,
    end: null,
  });
  const [dayHover, setDayHover] = useState<string | null>(null);
  const [inputText, setInputText] = useState<string>("");
  const [inputRef, setInputRef] = useState(React.createRef<HTMLInputElement>());

  // Custom Hooks use
  useOnClickOutside(calendarContainerRef, () => {
    const container = calendarContainerRef.current;
    if (container) {
      hideDatepicker();
    }
  });
  useEffect(() => {
    if (typeof onLoad === "function") onLoad(new Date());
  }, []);
  // Functions
  const hideDatepicker = useCallback(() => {
    local.open = false;
    local.render();
  }, []);

  /* Start First */
  const firstGotoDate = useCallback(
    (date: dayjs.Dayjs) => {
      const newDate = dayjs(formatDate(date));
      const reformatDate = dayjs(formatDate(secondDate));
      if (newDate.isSame(reformatDate) || newDate.isAfter(reformatDate)) {
        setSecondDate(nextMonth(date));
      }
      setFirstDate(date);
    },
    [secondDate]
  );

  const previousMonthFirst = useCallback(() => {
    if (typeof onLoad === "function") {
      const res = onLoad(dayjs(formatDate(previousMonth(firstDate))).toDate());
      if (res instanceof Promise) {
        res.then(() => {
          firstGotoDate(previousMonth(firstDate));
        });
      } else {
        firstGotoDate(previousMonth(firstDate));
      }
    } else {
      firstGotoDate(previousMonth(firstDate));
    }
  }, [firstDate]);

  const nextMonthFirst = useCallback(() => {
    if (typeof onLoad === "function") {
      const res = onLoad(dayjs(formatDate(nextMonth(firstDate))).toDate());
      if (res instanceof Promise) {
        res.then(() => {
          firstGotoDate(nextMonth(firstDate));
        });
      } else {
        firstGotoDate(nextMonth(firstDate));
      }
    } else {
      firstGotoDate(nextMonth(firstDate));
    }
  }, [firstDate, firstGotoDate]);

  const changeFirstMonth = useCallback(
    (month: number) => {
      firstGotoDate(
        dayjs(`${firstDate.year()}-${month < 10 ? "0" : ""}${month}-01`)
      );
    },
    [firstDate, firstGotoDate]
  );

  const changeFirstYear = useCallback(
    (year: number) => {
      firstGotoDate(dayjs(`${year}-${firstDate.month() + 1}-01`));
    },
    [firstDate, firstGotoDate]
  );
  /* End First */

  /* Start Second */
  const secondGotoDate = useCallback(
    (date: dayjs.Dayjs) => {
      const newDate = dayjs(formatDate(date, displayFormat));
      const reformatDate = dayjs(formatDate(firstDate, displayFormat));
      if (newDate.isSame(reformatDate) || newDate.isBefore(reformatDate)) {
        setFirstDate(previousMonth(date));
      }
      setSecondDate(date);
    },
    [firstDate, displayFormat]
  );

  const previousMonthSecond = useCallback(() => {
    secondGotoDate(previousMonth(secondDate));
  }, [secondDate, secondGotoDate]);

  const nextMonthSecond = useCallback(() => {
    setSecondDate(nextMonth(secondDate));
  }, [secondDate]);

  const changeSecondMonth = useCallback(
    (month: number) => {
      secondGotoDate(
        dayjs(`${secondDate.year()}-${month < 10 ? "0" : ""}${month}-01`)
      );
    },
    [secondDate, secondGotoDate]
  );

  const changeSecondYear = useCallback(
    (year: number) => {
      secondGotoDate(dayjs(`${year}-${secondDate.month() + 1}-01`));
    },
    [secondDate, secondGotoDate]
  );
  /* End Second */

  // UseEffects & UseLayoutEffect
  useEffect(() => {
    const container = containerRef.current;
    const calendarContainer = calendarContainerRef.current;
    const arrow = arrowRef.current;

    if (container && calendarContainer && arrow) {
      const detail = container.getBoundingClientRect();
      const screenCenter = window.innerWidth / 2;
      const containerCenter = (detail.right - detail.x) / 2 + detail.x;

      if (containerCenter > screenCenter) {
        arrow.classList.add("c-right-0");
        arrow.classList.add("c-mr-3.5");
        calendarContainer.classList.add("c-right-0");
      }
    }
  }, []);

  useEffect(() => {
    if (value && value.startDate && value.endDate) {
      const startDate = dayjs(value.startDate);
      const endDate = dayjs(value.endDate);
      const validDate = startDate.isValid() && endDate.isValid();
      const condition =
        validDate && (startDate.isSame(endDate) || startDate.isBefore(endDate));
      if (condition) {
        setPeriod({
          start: formatDate(startDate),
          end: formatDate(endDate),
        });
        setInputText(
          `${formatDate(startDate, displayFormat)}${
            asSingle
              ? ""
              : ` ${separator} ${formatDate(endDate, displayFormat)}`
          }`
        );
      }
    }

    if (value && value.startDate === null && value.endDate === null) {
      setPeriod({
        start: null,
        end: null,
      });
      setInputText("");
    }
  }, [asSingle, value, displayFormat, separator]);

  useEffect(() => {
    if (startFrom && dayjs(startFrom).isValid()) {
      const startDate = value?.startDate;
      const endDate = value?.endDate;
      if (startDate && dayjs(startDate).isValid()) {
        setFirstDate(dayjs(startDate));
        if (!asSingle) {
          if (
            endDate &&
            dayjs(endDate).isValid() &&
            dayjs(endDate).startOf("month").isAfter(dayjs(startDate))
          ) {
            setSecondDate(dayjs(endDate));
          } else {
            setSecondDate(nextMonth(dayjs(startDate)));
          }
        }
      } else {
        setFirstDate(dayjs(startFrom));
        setSecondDate(nextMonth(dayjs(startFrom)));
      }
    }
  }, [asSingle, startFrom, value]);

  // Variables
  const safePrimaryColor = useMemo(() => {
    if (COLORS.includes(primaryColor)) {
      return primaryColor as ColorKeys;
    }
    return DEFAULT_COLOR;
  }, [primaryColor]);
  const contextValues = useMemo(() => {
    return {
      asSingle,
      primaryColor: safePrimaryColor,
      configs,
      calendarContainer: calendarContainerRef,
      arrowContainer: arrowRef,
      hideDatepicker,
      period,
      changePeriod: (newPeriod: Period) => setPeriod(newPeriod),
      dayHover,
      changeDayHover: (newDay: string | null) => setDayHover(newDay),
      inputText,
      changeInputText: (newText: string) => setInputText(newText),
      updateFirstDate: (newDate: dayjs.Dayjs) => firstGotoDate(newDate),
      changeDatepickerValue: onChange,
      showFooter,
      placeholder,
      separator,
      i18n,
      value,
      disabled,
      inputClassName,
      containerClassName,
      toggleClassName,
      toggleIcon,
      readOnly,
      displayFormat,
      minDate,
      maxDate,
      dateLooking,
      disabledDates,
      inputId,
      inputName,
      startWeekOn,
      classNames,
      onChange,
      input: inputRef,
      popoverDirection,
    };
  }, [
    asSingle,
    safePrimaryColor,
    configs,
    hideDatepicker,
    period,
    dayHover,
    inputText,
    onChange,
    showFooter,
    placeholder,
    separator,
    i18n,
    value,
    disabled,
    inputClassName,
    containerClassName,
    toggleClassName,
    toggleIcon,
    readOnly,
    displayFormat,
    minDate,
    maxDate,
    dateLooking,
    disabledDates,
    inputId,
    inputName,
    startWeekOn,
    classNames,
    inputRef,
    popoverDirection,
    firstGotoDate,
  ]);

  const containerClassNameOverload = useMemo(() => {
    const defaultContainerClassName = "c-relative c-w-full c-text-gray-700";
    return typeof containerClassName === "function"
      ? containerClassName(defaultContainerClassName)
      : typeof containerClassName === "string" && containerClassName !== ""
      ? containerClassName
      : defaultContainerClassName;
  }, [containerClassName]);

  return (
    <DatepickerContext.Provider value={contextValues}>
      <Calendar
        date={firstDate}
        onClickPrevious={previousMonthFirst}
        onClickNext={nextMonthFirst}
        changeMonth={changeFirstMonth}
        changeYear={changeFirstYear}
        mode={mode}
        minDate={minDate}
        maxDate={maxDate}
        onMark={onMark}
        style={style}
      />
    </DatepickerContext.Provider>
  );
};

export default DCalender;
