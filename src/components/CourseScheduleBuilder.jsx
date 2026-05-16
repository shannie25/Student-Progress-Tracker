import {
  createCourseScheduleSlot,
  formatCourseSchedule,
  getScheduleDateForChoice,
  scheduleDateOptions,
  scheduleDayOptions,
  scheduleHourOptions,
  scheduleMinuteOptions,
  schedulePeriodOptions,
} from '../utils/courseSchedule';
import './CourseScheduleBuilder.css';

const CourseScheduleBuilder = ({
  rows,
  onChange,
  disabled = false,
  showHeader = true,
  showDateControls = true,
  allowMultiple = true,
}) => {
  const scheduleRows = Array.isArray(rows) && rows.length ? rows : [createCourseScheduleSlot()];
  const visibleRows = allowMultiple ? scheduleRows : scheduleRows.slice(0, 1);
  const schedulePreview = formatCourseSchedule(visibleRows);

  const updateRows = (updater) => {
    const nextRows = updater(scheduleRows);
    onChange(nextRows);
  };

  const updateSlot = (clientId, changes) => {
    updateRows((currentRows) => currentRows.map((row) => (
      row.clientId === clientId ? { ...row, customLabel: '', ...changes } : row
    )));
  };

  const toggleDay = (clientId, day) => {
    updateRows((currentRows) => currentRows.map((row) => {
      if (row.clientId !== clientId) {
        return row;
      }

      const days = row.days.includes(day)
        ? row.days.filter((currentDay) => currentDay !== day)
        : [...row.days, day];

      return { ...row, days, customLabel: '' };
    }));
  };

  const handleDateChoiceChange = (clientId, value) => {
    updateSlot(clientId, {
      dateMode: value,
      date: value === 'specific' ? '' : getScheduleDateForChoice(value),
    });
  };

  const addScheduleRow = () => {
    onChange([...scheduleRows, createCourseScheduleSlot({}, scheduleRows.length)]);
  };

  const removeScheduleRow = (clientId) => {
    if (scheduleRows.length === 1) {
      return;
    }

    onChange(scheduleRows.filter((row) => row.clientId !== clientId));
  };

  return (
    <section className="course-schedule-builder">
      {visibleRows.map((row, index) => (
        <div className="course-schedule-slot" key={row.clientId}>
          {showHeader && (
            <div className="course-schedule-slot-header">
              <strong>Meeting Time {index + 1}</strong>
              {allowMultiple && scheduleRows.length > 1 && (
                <button type="button" onClick={() => removeScheduleRow(row.clientId)} disabled={disabled}>
                  Remove
                </button>
              )}
            </div>
          )}

          {row.customLabel && (
            <p className="course-schedule-current">Current saved schedule: {row.customLabel}</p>
          )}

          <div className="course-schedule-days" aria-label={`Meeting Time ${index + 1} days`}>
            {scheduleDayOptions.map((day) => (
              <button
                type="button"
                key={day.value}
                className={row.days.includes(day.value) ? 'active' : ''}
                aria-pressed={row.days.includes(day.value)}
                onClick={() => toggleDay(row.clientId, day.value)}
                disabled={disabled}
              >
                {day.label}
              </button>
            ))}
          </div>

          {showDateControls && (
            <div className="course-schedule-date-grid">
              <label>
                <span>Date Option</span>
                <select value={row.dateMode} onChange={(event) => handleDateChoiceChange(row.clientId, event.target.value)} disabled={disabled}>
                  {scheduleDateOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </label>
              <label>
                <span>Calendar Date</span>
                <input
                  type="date"
                  value={row.date}
                  onChange={(event) => updateSlot(row.clientId, { date: event.target.value, dateMode: 'specific' })}
                  disabled={disabled || row.dateMode === 'weekly' || row.dateMode === 'today' || row.dateMode === 'tomorrow'}
                />
              </label>
            </div>
          )}

          <div className="course-schedule-time-grid">
            <span>Start Time</span>
            <select aria-label="Start hour" value={row.startHour} onChange={(event) => updateSlot(row.clientId, { startHour: event.target.value })} disabled={disabled}>
              {scheduleHourOptions.map((hour) => <option key={hour} value={hour}>{hour}</option>)}
            </select>
            <select aria-label="Start minute" value={row.startMinute} onChange={(event) => updateSlot(row.clientId, { startMinute: event.target.value })} disabled={disabled}>
              {scheduleMinuteOptions.map((minute) => <option key={minute} value={minute}>{minute}</option>)}
            </select>
            <select aria-label="Start period" value={row.startPeriod} onChange={(event) => updateSlot(row.clientId, { startPeriod: event.target.value })} disabled={disabled}>
              {schedulePeriodOptions.map((period) => <option key={period} value={period}>{period}</option>)}
            </select>

            <span>End Time</span>
            <select aria-label="End hour" value={row.endHour} onChange={(event) => updateSlot(row.clientId, { endHour: event.target.value })} disabled={disabled}>
              {scheduleHourOptions.map((hour) => <option key={hour} value={hour}>{hour}</option>)}
            </select>
            <select aria-label="End minute" value={row.endMinute} onChange={(event) => updateSlot(row.clientId, { endMinute: event.target.value })} disabled={disabled}>
              {scheduleMinuteOptions.map((minute) => <option key={minute} value={minute}>{minute}</option>)}
            </select>
            <select aria-label="End period" value={row.endPeriod} onChange={(event) => updateSlot(row.clientId, { endPeriod: event.target.value })} disabled={disabled}>
              {schedulePeriodOptions.map((period) => <option key={period} value={period}>{period}</option>)}
            </select>
          </div>
        </div>
      ))}

      {allowMultiple && (
        <button type="button" className="course-schedule-add" onClick={addScheduleRow} disabled={disabled}>
          Add Another Meeting Time
        </button>
      )}

      {schedulePreview && <output className="course-schedule-preview">Schedule: {schedulePreview}</output>}
    </section>
  );
};

export default CourseScheduleBuilder;
