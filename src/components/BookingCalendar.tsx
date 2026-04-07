'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

interface BookingCalendarProps {
  selectedDate: Date | null
  selectedTime: string
  onDateSelect: (date: Date) => void
  onTimeSelect: (time: string) => void
}

const MONTH_NAMES: Record<string, string[]> = {
  en: [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ],
  es: [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ],
}

const DAY_ABBR: Record<string, string[]> = {
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  es: ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'],
}

const CALENDAR_LABELS: Record<string, Record<string, string>> = {
  en: {
    selectDate: 'Select a date',
    selectTime: 'Select a time',
    available: 'Available',
    closed: 'Closed',
    shorterHours: 'Shorter hours',
    today: 'Today',
    previousMonth: 'Previous month',
    nextMonth: 'Next month',
  },
  es: {
    selectDate: 'Seleccione una fecha',
    selectTime: 'Seleccione una hora',
    available: 'Disponible',
    closed: 'Cerrado',
    shorterHours: 'Horario reducido',
    today: 'Hoy',
    previousMonth: 'Mes anterior',
    nextMonth: 'Mes siguiente',
  },
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function generateWeekdaySlots(): string[] {
  // Mon-Fri: 8 AM to 5 PM (last slot 5 PM, business closes at 6 PM)
  const slots: string[] = []
  for (let h = 8; h <= 17; h++) {
    const hour12 = h > 12 ? h - 12 : h === 0 ? 12 : h
    const suffix = h >= 12 ? 'PM' : 'AM'
    slots.push(`${hour12}:00 ${suffix}`)
  }
  return slots
}

function generateSaturdaySlots(): string[] {
  // Saturday: 8 AM to 2 PM (last slot 2 PM, closes at 3 PM)
  const slots: string[] = []
  for (let h = 8; h <= 14; h++) {
    const hour12 = h > 12 ? h - 12 : h === 0 ? 12 : h
    const suffix = h >= 12 ? 'PM' : 'AM'
    slots.push(`${hour12}:00 ${suffix}`)
  }
  return slots
}

const WEEKDAY_SLOTS = generateWeekdaySlots()
const SATURDAY_SLOTS = generateSaturdaySlots()

function parseSlotHour(slot: string): number {
  const match = slot.match(/^(\d+):00\s+(AM|PM)$/i)
  if (!match) return 0
  let hour = parseInt(match[1], 10)
  const period = match[2].toUpperCase()
  if (period === 'PM' && hour !== 12) hour += 12
  if (period === 'AM' && hour === 12) hour = 0
  return hour
}

export default function BookingCalendar({
  selectedDate,
  selectedTime,
  onDateSelect,
  onTimeSelect,
}: BookingCalendarProps) {
  const { locale } = useLanguage()
  const lang = locale === 'es' ? 'es' : 'en'
  const labels = CALENDAR_LABELS[lang]

  const today = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  const [viewMonth, setViewMonth] = useState(
    selectedDate ? selectedDate.getMonth() : today.getMonth()
  )
  const [viewYear, setViewYear] = useState(
    selectedDate ? selectedDate.getFullYear() : today.getFullYear()
  )

  const calendarRef = useRef<HTMLDivElement>(null)
  const timeSectionRef = useRef<HTMLDivElement>(null)

  // Focus the time section when a date is picked
  useEffect(() => {
    if (selectedDate && timeSectionRef.current) {
      timeSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [selectedDate])

  // Navigation
  const canGoPrev = useMemo(() => {
    if (viewYear > today.getFullYear()) return true
    if (viewYear === today.getFullYear() && viewMonth > today.getMonth()) return true
    return false
  }, [viewYear, viewMonth, today])

  const goToPrevMonth = useCallback(() => {
    if (!canGoPrev) return
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear((y) => y - 1)
    } else {
      setViewMonth((m) => m - 1)
    }
  }, [canGoPrev, viewMonth])

  const goToNextMonth = useCallback(() => {
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear((y) => y + 1)
    } else {
      setViewMonth((m) => m + 1)
    }
  }, [viewMonth])

  // Build the calendar grid
  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1)
    const startDay = firstDay.getDay() // 0=Sun
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
    const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate()

    const days: Array<{
      date: Date
      inMonth: boolean
      isPast: boolean
      isSunday: boolean
      isSaturday: boolean
      isToday: boolean
    }> = []

    // Previous month fill
    for (let i = startDay - 1; i >= 0; i--) {
      const d = new Date(viewYear, viewMonth - 1, prevMonthDays - i)
      days.push({
        date: d,
        inMonth: false,
        isPast: d < today,
        isSunday: d.getDay() === 0,
        isSaturday: d.getDay() === 6,
        isToday: false,
      })
    }

    // Current month
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(viewYear, viewMonth, day)
      days.push({
        date: d,
        inMonth: true,
        isPast: d < today,
        isSunday: d.getDay() === 0,
        isSaturday: d.getDay() === 6,
        isToday: isSameDay(d, today),
      })
    }

    // Next month fill
    const remaining = 7 - (days.length % 7)
    if (remaining < 7) {
      for (let i = 1; i <= remaining; i++) {
        const d = new Date(viewYear, viewMonth + 1, i)
        days.push({
          date: d,
          inMonth: false,
          isPast: d < today,
          isSunday: d.getDay() === 0,
          isSaturday: d.getDay() === 6,
          isToday: false,
        })
      }
    }

    return days
  }, [viewYear, viewMonth, today])

  // Time slots for selected date
  const availableSlots = useMemo(() => {
    if (!selectedDate) return []
    const dayOfWeek = selectedDate.getDay()
    if (dayOfWeek === 0) return [] // Sunday closed
    if (dayOfWeek === 6) return SATURDAY_SLOTS // Saturday
    return WEEKDAY_SLOTS // Weekday
  }, [selectedDate])

  // Filter out past time slots for today
  const filteredSlots = useMemo(() => {
    if (!selectedDate || !isSameDay(selectedDate, today)) return availableSlots
    const now = new Date()
    const currentHour = now.getHours()
    return availableSlots.filter((slot) => parseSlotHour(slot) > currentHour)
  }, [selectedDate, today, availableSlots])

  const handleDayClick = useCallback(
    (day: (typeof calendarDays)[0]) => {
      if (!day.inMonth || day.isPast || day.isSunday) return
      onDateSelect(day.date)
      // Clear time when selecting a new date
      onTimeSelect('')
    },
    [onDateSelect, onTimeSelect]
  )

  const handleDayKeyDown = useCallback(
    (e: React.KeyboardEvent, day: (typeof calendarDays)[0]) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        handleDayClick(day)
      }
    },
    [handleDayClick]
  )

  return (
    <div className="space-y-6">
      {/* Calendar */}
      <div
        ref={calendarRef}
        className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
        role="group"
        aria-label={labels.selectDate}
      >
        {/* Month/Year Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
          <button
            type="button"
            onClick={goToPrevMonth}
            disabled={!canGoPrev}
            className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-label={labels.previousMonth}
          >
            <ChevronLeft className="w-5 h-5" aria-hidden="true" />
          </button>
          <h3 className="text-lg font-semibold text-gray-900" aria-live="polite">
            {MONTH_NAMES[lang][viewMonth]} {viewYear}
          </h3>
          <button
            type="button"
            onClick={goToNextMonth}
            className="p-2 rounded-lg hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-label={labels.nextMonth}
          >
            <ChevronRight className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-gray-100" role="row">
          {DAY_ABBR[lang].map((abbr, idx) => (
            <div
              key={abbr}
              className={`py-2 text-center text-xs font-semibold uppercase tracking-wider ${
                idx === 0 ? 'text-red-400' : 'text-gray-500'
              }`}
              role="columnheader"
              aria-label={abbr}
            >
              {abbr}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7" role="grid" aria-label={labels.selectDate}>
          {calendarDays.map((day, idx) => {
            const isSelected =
              selectedDate && day.inMonth && isSameDay(day.date, selectedDate)
            const isDisabled = !day.inMonth || day.isPast || day.isSunday
            const isSat = day.isSaturday && day.inMonth && !day.isPast

            let cellClass =
              'relative flex items-center justify-center h-11 sm:h-12 text-sm transition-all duration-150 '

            if (isSelected) {
              cellClass +=
                'bg-primary-500 text-white font-bold rounded-lg ring-2 ring-primary-300 ring-offset-1 '
            } else if (isDisabled) {
              cellClass += 'text-gray-300 cursor-default '
            } else if (isSat) {
              cellClass +=
                'text-gray-700 hover:bg-amber-50 hover:text-amber-700 cursor-pointer rounded-lg font-medium '
            } else {
              cellClass +=
                'text-gray-700 hover:bg-primary-50 hover:text-primary-700 cursor-pointer rounded-lg font-medium '
            }

            return (
              <div
                key={idx}
                role="gridcell"
                tabIndex={isDisabled ? -1 : 0}
                aria-selected={isSelected || false}
                aria-disabled={isDisabled}
                aria-label={
                  day.inMonth
                    ? `${day.date.getDate()} ${MONTH_NAMES[lang][day.date.getMonth()]}${
                        day.isSunday ? ` (${labels.closed})` : ''
                      }${isSat ? ` (${labels.shorterHours})` : ''}`
                    : undefined
                }
                className={cellClass}
                onClick={() => handleDayClick(day)}
                onKeyDown={(e) => handleDayKeyDown(e, day)}
              >
                {day.date.getDate()}
                {/* Today dot indicator */}
                {day.isToday && day.inMonth && (
                  <span
                    className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${
                      isSelected ? 'bg-white' : 'bg-primary-500'
                    }`}
                    aria-hidden="true"
                  />
                )}
                {/* Saturday indicator */}
                {isSat && !isSelected && (
                  <span
                    className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-amber-400"
                    aria-hidden="true"
                  />
                )}
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 px-4 py-3 border-t border-gray-100 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary-500" aria-hidden="true" />
            {labels.today}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" aria-hidden="true" />
            {labels.shorterHours}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-gray-300 rounded" aria-hidden="true" />
            {labels.closed}
          </span>
        </div>
      </div>

      {/* Time Slots */}
      {selectedDate && (
        <div
          ref={timeSectionRef}
          className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
          role="group"
          aria-label={labels.selectTime}
        >
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              {labels.selectTime}
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">
              {selectedDate.getDate()} {MONTH_NAMES[lang][selectedDate.getMonth()]}{' '}
              {selectedDate.getFullYear()}
              {selectedDate.getDay() === 6 ? ` - ${labels.shorterHours}` : ''}
            </p>
          </div>

          <div className="p-4">
            {filteredSlots.length === 0 ? (
              <p className="text-center text-gray-500 py-4" role="status">
                {selectedDate.getDay() === 0
                  ? labels.closed
                  : lang === 'en'
                  ? 'No available slots for this date'
                  : 'No hay horarios disponibles para esta fecha'}
              </p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2" role="radiogroup" aria-label={labels.selectTime}>
                {filteredSlots.map((slot) => {
                  const isActive = selectedTime === slot
                  return (
                    <button
                      key={slot}
                      type="button"
                      role="radio"
                      aria-checked={isActive}
                      onClick={() => onTimeSelect(slot)}
                      className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 ${
                        isActive
                          ? 'bg-primary-500 text-white shadow-sm'
                          : 'bg-gray-100 text-gray-700 hover:bg-primary-50 hover:text-primary-700'
                      }`}
                    >
                      {slot}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
