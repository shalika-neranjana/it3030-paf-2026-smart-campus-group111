import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Clock, Loader2, Search } from 'lucide-react'
import { api } from '../lib/api'

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const BOOKED_STATUSES = new Set(['APPROVED', 'PENDING'])

const isSameDate = (dateA, dateB) =>
  dateA.getFullYear() === dateB.getFullYear()
  && dateA.getMonth() === dateB.getMonth()
  && dateA.getDate() === dateB.getDate()

const toDateSafely = (value) => {
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

const TimetablePage = () => {
  const [facilities, setFacilities] = useState([])
  const [selectedFacilityId, setSelectedFacilityId] = useState('')
  const [bookings, setBookings] = useState([])
  const [loadingFacilities, setLoadingFacilities] = useState(true)
  const [loadingBookings, setLoadingBookings] = useState(false)
  const [error, setError] = useState('')
  const [resourceSearch, setResourceSearch] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const suggestionsRef = useRef(null)
  const [monthCursor, setMonthCursor] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const fetchFacilities = async () => {
      setLoadingFacilities(true)
      setError('')
      try {
        const { data } = await api.get('/api/facilities')
        setFacilities(data)
        if (data.length > 0) {
          setSelectedFacilityId(data[0].id)
          setResourceSearch(data[0].name)
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load resources.')
      } finally {
        setLoadingFacilities(false)
      }
    }

    fetchFacilities()
  }, [])

  useEffect(() => {
    if (!selectedFacilityId) {
      setBookings([])
      return
    }

    const fetchBookings = async () => {
      setLoadingBookings(true)
      setError('')
      try {
        const { data } = await api.get(`/api/bookings/facility/${selectedFacilityId}`)
        const activeBookings = data.filter((booking) => BOOKED_STATUSES.has(booking.status))
        setBookings(activeBookings)
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load timetable.')
      } finally {
        setLoadingBookings(false)
      }
    }

    fetchBookings()
  }, [selectedFacilityId])

  const monthlyBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const bookingDate = toDateSafely(booking.date)
      return bookingDate
        && bookingDate.getFullYear() === monthCursor.getFullYear()
        && bookingDate.getMonth() === monthCursor.getMonth()
    })
  }, [bookings, monthCursor])

  const slotsByDateKey = useMemo(() => {
    const grouped = {}
    monthlyBookings.forEach((booking) => {
      const bookingDate = toDateSafely(booking.date)
      if (!bookingDate) return
      const dayKey = bookingDate.toISOString().slice(0, 10)
      if (!grouped[dayKey]) grouped[dayKey] = []
      grouped[dayKey].push(booking)
    })

    Object.keys(grouped).forEach((dayKey) => {
      grouped[dayKey].sort((a, b) => String(a.startTime).localeCompare(String(b.startTime)))
    })

    return grouped
  }, [monthlyBookings])

  const calendarDays = useMemo(() => {
    const year = monthCursor.getFullYear()
    const month = monthCursor.getMonth()
    const firstDay = new Date(year, month, 1)
    const startOffset = firstDay.getDay()
    const startDate = new Date(year, month, 1 - startOffset)

    return Array.from({ length: 42 }, (_, index) => {
      const current = new Date(startDate)
      current.setDate(startDate.getDate() + index)
      return current
    })
  }, [monthCursor])

  const monthLabel = monthCursor.toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  })

  const filteredFacilities = useMemo(() => {
    const query = resourceSearch.trim().toLowerCase()
    if (!query) return facilities
    return facilities.filter((facility) => facility.name.toLowerCase().includes(query))
  }, [facilities, resourceSearch])

  const selectedFacility = facilities.find((facility) => facility.id === selectedFacilityId)

  return (
    <div className="timetable-page">
      <div className="ui-section-copy">
        <h2>Resource Timetable</h2>
        <p>Select a resource and review booked slots in the monthly calendar.</p>
      </div>

      <div className="timetable-toolbar">
        <div className="timetable-resource-search" ref={suggestionsRef}>
          <label htmlFor="resource-search" className="timetable-label">Resource</label>
          <div className="search-input-wrapper timetable-search-input">
            <Search className="search-icon" size={18} />
            <input
              id="resource-search"
              type="text"
              className="ui-input"
              placeholder="Search resource..."
              value={resourceSearch}
              onChange={(event) => {
                setResourceSearch(event.target.value)
                setSelectedFacilityId('')
                setShowSuggestions(true)
              }}
              onFocus={() => setShowSuggestions(true)}
              disabled={loadingFacilities || facilities.length === 0}
            />
          </div>
          {showSuggestions && (
            <div className="timetable-suggestions-list">
              {filteredFacilities.map((facility) => (
                <button
                  key={facility.id}
                  type="button"
                  className="timetable-suggestion-item"
                  onClick={() => {
                    setSelectedFacilityId(facility.id)
                    setResourceSearch(facility.name)
                    setShowSuggestions(false)
                  }}
                >
                  <span className="suggestion-name">{facility.name}</span>
                  <span className="suggestion-type">{facility.type}</span>
                </button>
              ))}
              {filteredFacilities.length === 0 && (
                <div className="timetable-no-suggestions">No resources found</div>
              )}
            </div>
          )}
        </div>

        <div className="timetable-month-nav">
          <button
            type="button"
            className="view-btn"
            aria-label="Previous month"
            onClick={() => setMonthCursor(new Date(monthCursor.getFullYear(), monthCursor.getMonth() - 1, 1))}
          >
            <ChevronLeft size={16} />
          </button>
          <span className="timetable-month-label">{monthLabel}</span>
          <button
            type="button"
            className="view-btn"
            aria-label="Next month"
            onClick={() => setMonthCursor(new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 1))}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {error && (
        <div className="ui-feedback ui-feedback--error">
          <p>{error}</p>
        </div>
      )}

      {loadingFacilities || loadingBookings ? (
        <div className="ui-feedback">
          <Loader2 className="animate-spin loading-spinner-icon" size={28} />
          <p>Loading timetable...</p>
        </div>
      ) : !selectedFacility ? (
        <div className="ui-feedback ui-feedback-card">
          <p>No resources available to display.</p>
        </div>
      ) : (
        <div className="timetable-calendar-wrap">
          <div className="timetable-calendar-head">
            {WEEK_DAYS.map((day) => (
              <div key={day} className="timetable-weekday">{day}</div>
            ))}
          </div>

          <div className="timetable-calendar-grid">
            {calendarDays.map((dayDate) => {
              const dayKey = dayDate.toISOString().slice(0, 10)
              const daySlots = slotsByDateKey[dayKey] || []
              const isCurrentMonth = dayDate.getMonth() === monthCursor.getMonth()
              const isToday = isSameDate(dayDate, new Date())

              return (
                <div
                  key={dayKey}
                  className={`timetable-day ${isCurrentMonth ? '' : 'muted'} ${isToday ? 'today' : ''}`}
                >
                  <div className="timetable-day-number">{dayDate.getDate()}</div>
                  <div className="timetable-slots">
                    {daySlots.map((slot) => (
                      <div
                        key={slot.id}
                        className={`timetable-slot ${slot.status === 'PENDING' ? 'pending' : 'approved'}`}
                        title={`${slot.startTime} - ${slot.endTime} • ${slot.purpose || 'Booked'}`}
                      >
                        <Clock size={12} />
                        <span>{slot.startTime} - {slot.endTime}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default TimetablePage
