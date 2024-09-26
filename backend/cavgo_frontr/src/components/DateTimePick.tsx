import React, { useState, useEffect } from 'react';
import CarSelection from './CarSelection';

interface DateTimePickerProps {
  onSetTime: (dateTime: string) => void; // Function to invoke on "Set Time" button click, now returns a string
}

const DateTimePicker: React.FC<DateTimePickerProps> = ({ onSetTime }) => {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]); // Date stored as string
  const [timeOptions, setTimeOptions] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<string>(''); // Display current time in Rwanda

  // Force the date to be in the Rwanda timezone (UTC+2)
  const getRwandaTime = () => {
    const rwandaDate = new Date().toLocaleString('en-US', {
      timeZone: 'Africa/Kigali', // Rwanda's time zone
    });
    return new Date(rwandaDate);
  };

  // Generate time options in 5-minute intervals based on the current time in Rwanda
  const generateTimeOptions = (currentTime: Date) => {
    const options: string[] = [];
    const startHour = currentTime.getHours();
    const startMinute = Math.ceil(currentTime.getMinutes() / 5) * 5;

    // Add 5-minute intervals for the current hour and the next hour
    for (let hour = startHour; hour <= startHour + 1; hour++) {
      const startMin = hour === startHour ? startMinute : 0;
      for (let minute = startMin; minute < 60; minute += 5) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        options.push(time);
      }
    }
    return options;
  };

  // Update time options and selected date/time based on the Rwanda time
  useEffect(() => {
    // Function to update current time and options dynamically
    const updateTime = () => {
      const nowInRwanda = getRwandaTime();
      if (nowInRwanda.getHours() >= 22) {
        nowInRwanda.setDate(nowInRwanda.getDate() + 1); // Default to tomorrow if after 10pm
      }

      const timeOptions = generateTimeOptions(nowInRwanda);
      setTimeOptions(timeOptions);
      setCurrentTime(nowInRwanda.toLocaleTimeString('en-US', { timeZone: 'Africa/Kigali', hour12: false })); // Update displayed time
    };

    updateTime(); // Initial time set when component loads

    const interval = setInterval(updateTime, 60000); // Update time every 60 seconds

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, []);

  // Handle time selection
  const handleTimeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTime(event.target.value);
  };

  // Handle date change
  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(event.target.value); // Update date as string
  };

  // Validate and set date/time as a string
  const handleSetTime = () => {
    if (selectedTime) {
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const dateTime = new Date(selectedDate); // Convert selectedDate string back to Date
      dateTime.setHours(hours);
      dateTime.setMinutes(minutes);

      const nowInRwanda = getRwandaTime();
      if (dateTime < nowInRwanda && dateTime.getDate() === nowInRwanda.getDate()) {
        setError('Selected time must be in the future.');
      } else {
        setError(null);
        const dateTimeString = dateTime.toISOString(); // Convert back to ISO string format
        onSetTime(dateTimeString); // Pass the string back to the parent component
      }
    } else {
      setError('Please select a valid time.');
    }
  };

  return (
    <div>
      <h3>Current Time in Rwanda: {currentTime}</h3> {/* Display current time in Rwanda */}
      <label>
        Date:
        <input
          type="date"
          value={selectedDate}
          onChange={handleDateChange} // Date as string
        />
      </label>
      <label>
        Time:
        <select value={selectedTime} onChange={handleTimeChange}>
          <option value="" disabled>Select time</option>
          {timeOptions.map((time) => (
            <option key={time} value={time}>
              {time}
            </option>
          ))}
        </select>
      </label>
      <button onClick={handleSetTime}>Set Time</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <CarSelection />
    </div>
  );
};

export default DateTimePicker;
