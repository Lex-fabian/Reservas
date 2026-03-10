import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface CalendarioReservasProps {
  onSelectDate: (date: Date) => void;
  selectedDate?: Date;
  reservedDates?: string[]; 
  minDate?: Date;
  maxDate?: Date;
}

export default function CalendarioReservas({
  onSelectDate,
  selectedDate,
  reservedDates = [],
  minDate = new Date(),
  maxDate,
}: CalendarioReservasProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(selectedDate);

  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    const days: (Date | null)[] = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const formatDateKey = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const isSameDay = (date1: Date, date2: Date | undefined): boolean => {
    if (!date2) return false;
    return formatDateKey(date1) === formatDateKey(date2);
  };

  const isReserved = (date: Date): boolean => {
    return reservedDates.includes(formatDateKey(date));
  };

  const isPastDate = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    return date < today;
  };

  const isDisabled = (date: Date): boolean => {
    if (isPastDate(date)) return true;
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  const handleDayPress = (date: Date) => {
    if (isDisabled(date)) return;
    setSelectedDay(date);
    onSelectDate(date);
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const canGoPrevious = () => {
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    return firstDayOfMonth >= minDate;
  };

  const canGoNext = () => {
    if (!maxDate) return true;
    const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    return lastDayOfMonth <= maxDate;
  };

  const days = getDaysInMonth(currentMonth);

  return (
    <View style={styles.container}>
      {/* Header con navegación de mes */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={goToPreviousMonth}
          disabled={!canGoPrevious()}
          style={styles.navButton}
        >
          <Icon
            name="chevron-back"
            size={24}
            color={canGoPrevious() ? '#4a90e2' : '#ccc'}
          />
        </TouchableOpacity>

        <View style={styles.monthYearContainer}>
          <Text style={styles.monthText}>
            {meses[currentMonth.getMonth()]}
          </Text>
          <Text style={styles.yearText}>
            {currentMonth.getFullYear()}
          </Text>
        </View>

        <TouchableOpacity
          onPress={goToNextMonth}
          disabled={!canGoNext()}
          style={styles.navButton}
        >
          <Icon
            name="chevron-forward"
            size={24}
            color={canGoNext() ? '#4a90e2' : '#ccc'}
          />
        </TouchableOpacity>
      </View>

      {/* Días de la semana */}
      <View style={styles.weekDaysContainer}>
        {diasSemana.map((dia, index) => (
          <View key={index} style={styles.weekDay}>
            <Text style={styles.weekDayText}>{dia}</Text>
          </View>
        ))}
      </View>

      {/* Grid de días */}
      <View style={styles.daysGrid}>
        {days.map((date, index) => {
          if (!date) {
            return <View key={`empty-${index}`} style={styles.dayCell} />;
          }

          const isSelected = isSameDay(date, selectedDay);
          const isReservedDate = isReserved(date);
          const disabled = isDisabled(date);
          const isToday = isSameDay(date, new Date());

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayCell,
                isSelected && styles.daySelected,
                isReservedDate && styles.dayReserved,
                disabled && styles.dayDisabled,
                isToday && !isSelected && styles.dayToday,
              ]}
              onPress={() => handleDayPress(date)}
              disabled={disabled}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.dayText,
                  isSelected && styles.dayTextSelected,
                  isReservedDate && styles.dayTextReserved,
                  disabled && styles.dayTextDisabled,
                  isToday && !isSelected && styles.dayTextToday,
                ]}
              >
                {date.getDate()}
              </Text>
              {isReservedDate && !isSelected && (
                <View style={styles.reservedDot} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Leyenda */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, styles.legendToday]} />
          <Text style={styles.legendText}>Hoy</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, styles.legendSelected]} />
          <Text style={styles.legendText}>Seleccionado</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, styles.legendReserved]} />
          <Text style={styles.legendText}>Reservado</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  navButton: {
    padding: 8,
  },
  monthYearContainer: {
    alignItems: 'center',
  },
  monthText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  yearText: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  weekDaysContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDay: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  weekDayText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    position: 'relative',
  },
  dayText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  dayToday: {
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
  },
  dayTextToday: {
    color: '#2196F3',
    fontWeight: '700',
  },
  daySelected: {
    backgroundColor: '#4a90e2',
    borderRadius: 8,
  },
  dayTextSelected: {
    color: '#fff',
    fontWeight: '700',
  },
  dayReserved: {
    backgroundColor: '#fff3cd',
    borderRadius: 8,
  },
  dayTextReserved: {
    color: '#856404',
  },
  dayDisabled: {
    opacity: 0.3,
  },
  dayTextDisabled: {
    color: '#999',
  },
  reservedDot: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ff9800',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendBox: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  legendToday: {
    backgroundColor: '#e3f2fd',
  },
  legendSelected: {
    backgroundColor: '#4a90e2',
  },
  legendReserved: {
    backgroundColor: '#fff3cd',
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
});
