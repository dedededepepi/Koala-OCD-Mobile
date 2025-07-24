import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { BookOpen, Plus, Clock, CreditCard as Edit3, Trash2, CircleCheck as CheckCircle, Circle as XCircle, X, Calendar } from 'lucide-react-native';
import { JournalIcon } from '@/components/JournalIcon';
import * as Haptics from 'expo-haptics';
import { format } from 'date-fns';
import { storageService, Trigger } from '@/services/storage';

const compulsionTypes = [
  'Handwashing',
  'Cleaning', 
  'Avoidance',
  'Contamination',
  'Doubt',
  'Symmetry',
  'Other'
];
export default function JournalScreen() {
  const [todayTriggers, setTodayTriggers] = useState<Trigger[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTrigger, setEditingTrigger] = useState<Trigger | null>(null);
  const [description, setDescription] = useState('');
  const [isResisted, setIsResisted] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCompulsionType, setSelectedCompulsionType] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [showCustomTimePicker, setShowCustomTimePicker] = useState(false);
  const [pickerDate, setPickerDate] = useState(new Date());
  const [pickerTime, setPickerTime] = useState(new Date());

  const handleSaveNewEntry = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    // Combine date and time
    const combinedDateTime = new Date(selectedDate);
    combinedDateTime.setHours(selectedTime.getHours());
    combinedDateTime.setMinutes(selectedTime.getMinutes());

    const newTrigger = {
      id: Date.now().toString(),
      timestamp: combinedDateTime.toISOString(),
      isResisted,
      compulsionType: selectedCompulsionType || 'general',
      notes: description,
    };

    await storageService.addTrigger(newTrigger);
    await storageService.checkAndUpdateAchievements();
    await loadTodayTriggers();
    
    // Reset form
    setShowAddModal(false);
    setDescription('');
    setIsResisted(true);
    setSelectedCompulsionType('');
    setSelectedDate(new Date());
    setSelectedTime(new Date());
  };

  const handleCompulsionSelect = (compulsion: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedCompulsionType(compulsion);
  };

  const handleDatePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setPickerDate(selectedDate);
    setShowCustomDatePicker(true);
  };

  const handleTimePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setPickerTime(selectedTime);
    setShowCustomTimePicker(true);
  };

  // Custom Date Picker Functions
  const generateDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getWeekDays = () => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handleDayPress = (day: Date) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setPickerDate(day);
  };

  const handleMonthChange = (direction: 'prev' | 'next') => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const newDate = new Date(pickerDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setPickerDate(newDate);
  };

  const handleConfirmDate = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setSelectedDate(pickerDate);
    setShowCustomDatePicker(false);
  };

  const handleCancelDate = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setShowCustomDatePicker(false);
  };

  // Custom Time Picker Functions
  const handleHourChange = (hour: number) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const newTime = new Date(pickerTime);
    newTime.setHours(hour);
    setPickerTime(newTime);
  };

  const handleMinuteChange = (minute: number) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const newTime = new Date(pickerTime);
    newTime.setMinutes(minute);
    setPickerTime(newTime);
  };

  const handleAmPmChange = (isAm: boolean) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const newTime = new Date(pickerTime);
    const currentHours = newTime.getHours();
    
    if (isAm && currentHours >= 12) {
      newTime.setHours(currentHours - 12);
    } else if (!isAm && currentHours < 12) {
      newTime.setHours(currentHours + 12);
    }
    
    setPickerTime(newTime);
  };

  const handleConfirmTime = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setSelectedTime(pickerTime);
    setShowCustomTimePicker(false);
  };

  const handleCancelTime = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setShowCustomTimePicker(false);
  };

  useEffect(() => {
    loadTodayTriggers();
  }, []);

  const loadTodayTriggers = async () => {
    setLoading(true);
    const today = format(new Date(), 'yyyy-MM-dd');
    const triggers = await storageService.getTriggersByDate(today);
    // Sort by timestamp, most recent first
    const sortedTriggers = triggers.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    setTodayTriggers(sortedTriggers);
    setLoading(false);
  };

  const handleDeleteTrigger = async (id: string) => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (Platform.OS !== 'web') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            await storageService.deleteTrigger(id);
            await loadTodayTriggers();
          }
        }
      ]
    );
  };

  const handleEditTrigger = (trigger: Trigger) => {
    setEditingTrigger(trigger);
    setDescription(trigger.notes || '');
    setIsResisted(trigger.isResisted);
    setShowEditModal(true);
  };

  const handleSaveChanges = async () => {
    if (!editingTrigger) return;

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    await storageService.updateTrigger(editingTrigger.id, {
      notes: description,
      isResisted,
    });

    await loadTodayTriggers();
    setShowEditModal(false);
    setEditingTrigger(null);
  };

  const handleAddManualEntry = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setShowAddModal(true);
  };

  const resistedCount = todayTriggers.filter(t => t.isResisted).length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <JournalIcon size={28} color="#4F46E5" />
          <Text style={styles.title}>Journal</Text>
        </View>
        <Text style={styles.subtitle}>
          Review and manage your compulsion journal
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddManualEntry}
        >
          <Plus size={20} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add Manual Entry</Text>
        </TouchableOpacity>

        <View style={styles.todaySection}>
          <View style={styles.todayHeader}>
            <View style={styles.todayTitleContainer}>
              <View style={styles.calendarIcon}>
                <Text style={styles.calendarIconText}>📅</Text>
              </View>
              <Text style={styles.todayTitle}>Today</Text>
            </View>
          </View>
          <Text style={styles.todayStats}>
            {todayTriggers.length} compulsions • {resistedCount} resisted
          </Text>

          <View style={styles.entriesList}>
            {todayTriggers.map((trigger) => (
              <View key={trigger.id} style={styles.entryItem}>
                <View style={styles.entryLeft}>
                  <View style={styles.statusIcon}>
                    {trigger.isResisted ? (
                      <CheckCircle size={20} color="#10B981" />
                    ) : (
                      <XCircle size={20} color="#F97316" />
                    )}
                  </View>
                  <View style={styles.entryContent}>
                    <Text style={[
                      styles.entryStatus,
                      { color: trigger.isResisted ? '#10B981' : '#F97316' }
                    ]}>
                      {trigger.isResisted ? 'Resisted' : 'Gave In'}
                    </Text>
                    <View style={styles.timeContainer}>
                      <Clock size={14} color="#6B7280" />
                      <Text style={styles.entryTime}>
                        {format(new Date(trigger.timestamp), 'h:mm a')}
                      </Text>
                    </View>
                    {trigger.compulsionType && (
                      <View style={styles.compulsionContainer}>
                        {trigger.notes ? (
                          <View style={styles.descriptionContainer}>
                            <Text style={styles.descriptionText}>
                              {trigger.notes}
                            </Text>
                          </View>
                        ) : (
                          <Text style={styles.compulsionType}>
                            {trigger.compulsionType}
                          </Text>
                        )}
                      </View>
                    )}
                  </View>
                </View>
                
                <View style={styles.entryActions}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleEditTrigger(trigger)}
                  >
                    <Edit3 size={16} color="#6B7280" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleDeleteTrigger(trigger.id)}
                  >
                    <Trash2 size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {todayTriggers.length === 0 && !loading && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No entries for today</Text>
                <Text style={styles.emptySubtext}>
                  Great job! Keep up the good work.
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Edit Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
        transparent={false}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Entry</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowEditModal(false)}
              >
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalSubtitle}>
              Update the details of this compulsion entry
            </Text>
            
            <Text style={styles.timestampText}>
              {editingTrigger && format(new Date(editingTrigger.timestamp), 'EEEE, MMMM do \'at\' h:mm a')}
            </Text>

            <View style={styles.modalContent}>
              <Text style={styles.sectionTitle}>Description</Text>
              <TextInput
                style={styles.descriptionInput}
                placeholder="Describe what the compulsion was..."
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />

              <View style={styles.outcomeButtons}>
                <TouchableOpacity
                  style={[
                    styles.outcomeButton,
                    styles.resistedButton,
                    isResisted && styles.resistedSelected
                  ]}
                  onPress={() => setIsResisted(true)}
                >
                  <CheckCircle size={16} color={isResisted ? "#FFFFFF" : "#10B981"} />
                  <Text style={[
                    styles.outcomeText,
                    isResisted && styles.outcomeTextSelected
                  ]}>
                    Resisted
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.outcomeButton,
                    styles.gaveInButton,
                    !isResisted && styles.gaveInSelected
                  ]}
                  onPress={() => setIsResisted(false)}
                >
                  <XCircle size={16} color={!isResisted ? "#FFFFFF" : "#F97316"} />
                  <Text style={[
                    styles.outcomeText,
                    !isResisted && styles.outcomeTextSelected
                  ]}>
                    Gave In
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSaveChanges}
                >
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowEditModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Manual Entry Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        transparent={false}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Manual Entry</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowAddModal(false)}
              >
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalSubtitle}>
              Add a compulsion that occurred when you couldn't access the app
            </Text>

            <View style={styles.modalContent}>
              {/* Date and Time Section */}
              <View style={styles.dateTimeSection}>
                <View style={styles.dateTimeRow}>
                  <View style={styles.dateTimeItem}>
                    <Text style={styles.dateTimeLabel}>Date</Text>
                    <TouchableOpacity 
                      style={styles.dateTimeInput}
                      onPress={handleDatePress}
                    >
                      <Text style={styles.dateTimeText}>
                        {format(selectedDate, 'MM/dd/yyyy')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.dateTimeItem}>
                    <Text style={styles.dateTimeLabel}>Time</Text>
                    <TouchableOpacity 
                      style={styles.dateTimeInput}
                      onPress={handleTimePress}
                    >
                      <Text style={styles.dateTimeText}>
                        {format(selectedTime, 'h:mm a')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Description */}
              <View>
                <Text style={styles.sectionTitle}>Description (Optional)</Text>
                <TextInput
                  style={styles.descriptionInput}
                  placeholder="Describe what the compulsion was..."
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              {/* Tags */}
              <View style={styles.compulsionSection}>
                <Text style={styles.sectionTitle}>Tags</Text>
                <View style={styles.compulsionGrid}>
                  {compulsionTypes.map((compulsion) => (
                    <TouchableOpacity
                      key={compulsion}
                      style={[
                        styles.compulsionTag,
                        selectedCompulsionType === compulsion && styles.compulsionTagSelected
                      ]}
                      onPress={() => handleCompulsionSelect(compulsion)}
                    >
                      <Text style={[
                        styles.compulsionTagText,
                        selectedCompulsionType === compulsion && styles.compulsionTagTextSelected
                      ]}>
                        {compulsion}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Outcome */}
              <View style={styles.outcomeButtons}>
                <TouchableOpacity
                  style={[
                    styles.outcomeButton,
                    styles.resistedButton,
                    isResisted && styles.resistedSelected
                  ]}
                  onPress={() => setIsResisted(true)}
                >
                  <CheckCircle size={16} color={isResisted ? "#FFFFFF" : "#10B981"} />
                  <Text style={[
                    styles.outcomeText,
                    isResisted && styles.outcomeTextSelected
                  ]}>
                    Resisted
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.outcomeButton,
                    styles.gaveInButton,
                    !isResisted && styles.gaveInSelected
                  ]}
                  onPress={() => setIsResisted(false)}
                >
                  <XCircle size={16} color={!isResisted ? "#FFFFFF" : "#F97316"} />
                  <Text style={[
                    styles.outcomeText,
                    !isResisted && styles.outcomeTextSelected
                  ]}>
                    Gave In
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Actions */}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSaveNewEntry}
                >
                  <Text style={styles.saveButtonText}>Add Entry</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowAddModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Custom Date Picker Modal */}
      <Modal
        visible={showCustomDatePicker}
        animationType="fade"
        transparent={true}
        presentationStyle="overFullScreen"
        onRequestClose={handleCancelDate}
      >
        <View style={styles.pickerOverlay}>
          <View style={styles.datePickerContainer}>
            <View style={styles.pickerHeader}>
              <TouchableOpacity 
                style={styles.monthNavButton}
                onPress={() => handleMonthChange('prev')}
              >
                <Text style={styles.monthNavText}>‹</Text>
              </TouchableOpacity>
              
              <Text style={styles.monthYearText}>
                {format(pickerDate, 'MMMM yyyy')}
              </Text>
              
              <TouchableOpacity 
                style={styles.monthNavButton}
                onPress={() => handleMonthChange('next')}
              >
                <Text style={styles.monthNavText}>›</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.weekDaysContainer}>
              {getWeekDays().map((day) => (
                <Text key={day} style={styles.weekDayText}>{day}</Text>
              ))}
            </View>
            
            <View style={styles.daysGrid}>
              {generateDaysInMonth(pickerDate).map((day, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dayButton,
                    day && format(day, 'yyyy-MM-dd') === format(pickerDate, 'yyyy-MM-dd') && styles.selectedDayButton,
                    !day && styles.emptyDayButton
                  ]}
                  onPress={() => day && handleDayPress(day)}
                  disabled={!day}
                >
                  <Text style={[
                    styles.dayText,
                    day && format(day, 'yyyy-MM-dd') === format(pickerDate, 'yyyy-MM-dd') && styles.selectedDayText
                  ]}>
                    {day ? day.getDate() : ''}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={styles.pickerActions}>
              <TouchableOpacity style={styles.pickerCancelButton} onPress={handleCancelDate}>
                <Text style={styles.pickerCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.pickerConfirmButton} onPress={handleConfirmDate}>
                <Text style={styles.pickerConfirmText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Custom Time Picker Modal */}
      <Modal
        visible={showCustomTimePicker}
        animationType="fade"
        transparent={true}
        presentationStyle="overFullScreen"
        onRequestClose={handleCancelTime}
      >
        <View style={styles.pickerOverlay}>
          <View style={styles.timePickerContainer}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Select Time</Text>
            </View>
            
            <View style={styles.timeSelectors}>
              {/* Hours */}
              <View style={styles.timeColumn}>
                <Text style={styles.timeColumnLabel}>Hour</Text>
                <ScrollView style={styles.timeScrollView} showsVerticalScrollIndicator={false}>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((hour) => (
                    <TouchableOpacity
                      key={hour}
                      style={[
                        styles.timeOption,
                        (pickerTime.getHours() % 12 === 0 ? 12 : pickerTime.getHours() % 12) === hour && styles.selectedTimeOption
                      ]}
                      onPress={() => {
                        const isAm = pickerTime.getHours() < 12;
                        const newHour = isAm ? (hour === 12 ? 0 : hour) : (hour === 12 ? 12 : hour + 12);
                        handleHourChange(newHour);
                      }}
                    >
                      <Text style={[
                        styles.timeOptionText,
                        (pickerTime.getHours() % 12 === 0 ? 12 : pickerTime.getHours() % 12) === hour && styles.selectedTimeOptionText
                      ]}>
                        {hour}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              
              {/* Minutes */}
              <View style={styles.timeColumn}>
                <Text style={styles.timeColumnLabel}>Minute</Text>
                <ScrollView style={styles.timeScrollView} showsVerticalScrollIndicator={false}>
                  {Array.from({ length: 60 }, (_, i) => i).filter(m => m % 5 === 0).map((minute) => (
                    <TouchableOpacity
                      key={minute}
                      style={[
                        styles.timeOption,
                        Math.floor(pickerTime.getMinutes() / 5) * 5 === minute && styles.selectedTimeOption
                      ]}
                      onPress={() => handleMinuteChange(minute)}
                    >
                      <Text style={[
                        styles.timeOptionText,
                        Math.floor(pickerTime.getMinutes() / 5) * 5 === minute && styles.selectedTimeOptionText
                      ]}>
                        {minute.toString().padStart(2, '0')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              
              {/* AM/PM */}
              <View style={styles.timeColumn}>
                <Text style={styles.timeColumnLabel}>Period</Text>
                <View style={styles.amPmContainer}>
                  <TouchableOpacity
                    style={[
                      styles.amPmButton,
                      pickerTime.getHours() < 12 && styles.selectedAmPmButton
                    ]}
                    onPress={() => handleAmPmChange(true)}
                  >
                    <Text style={[
                      styles.amPmText,
                      pickerTime.getHours() < 12 && styles.selectedAmPmText
                    ]}>
                      AM
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.amPmButton,
                      pickerTime.getHours() >= 12 && styles.selectedAmPmButton
                    ]}
                    onPress={() => handleAmPmChange(false)}
                  >
                    <Text style={[
                      styles.amPmText,
                      pickerTime.getHours() >= 12 && styles.selectedAmPmText
                    ]}>
                      PM
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            
            <View style={styles.pickerActions}>
              <TouchableOpacity style={styles.pickerCancelButton} onPress={handleCancelTime}>
                <Text style={styles.pickerCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.pickerConfirmButton} onPress={handleConfirmTime}>
                <Text style={styles.pickerConfirmText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: 'NotoSansJP-Bold',
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'NotoSansJP-Regular',
    color: '#6B7280',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  addButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    gap: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'NotoSansJP-SemiBold',
  },
  todaySection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  todayHeader: {
    marginBottom: 8,
  },
  todayTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  calendarIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarIconText: {
    fontSize: 16,
  },
  todayTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'NotoSansJP-Bold',
    color: '#1F2937',
  },
  todayStats: {
    fontSize: 14,
    fontFamily: 'NotoSansJP-Regular',
    color: '#6B7280',
    marginBottom: 20,
  },
  entriesList: {
    gap: 16,
  },
  entryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  entryLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    gap: 12,
  },
  statusIcon: {
    marginTop: 2,
  },
  entryContent: {
    flex: 1,
    gap: 6,
  },
  entryStatus: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'NotoSansJP-SemiBold',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  entryTime: {
    fontSize: 14,
    fontFamily: 'NotoSansJP-Regular',
    color: '#6B7280',
  },
  compulsionContainer: {
    gap: 4,
  },
  compulsionType: {
    fontSize: 14,
    fontFamily: 'NotoSansJP-Medium',
    color: '#1F2937',
    fontWeight: '500',
  },
  contaminationTag: {
    backgroundColor: '#EEF2FF',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  contaminationText: {
    fontSize: 12,
    fontFamily: 'NotoSansJP-Medium',
    color: '#4F46E5',
    fontWeight: '500',
  },
  descriptionContainer: {
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  descriptionText: {
    fontSize: 12,
    fontFamily: 'NotoSansJP-Medium',
    color: '#374151',
    fontWeight: '500',
  },
  entryActions: {
    flexDirection: 'row',
    gap: 8,
  },
  dateTimeSection: {
    marginBottom: 20,
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: 16,
  },
  dateTimeItem: {
    flex: 1,
  },
  dateTimeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  dateTimeInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  dateTimeText: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  compulsionSection: {
    marginBottom: 20,
  },
  compulsionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  compulsionTag: {
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  compulsionTagSelected: {
    backgroundColor: '#EEF2FF',
    borderColor: '#4F46E5',
  },
  compulsionTagText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  compulsionTagTextSelected: {
    color: '#4F46E5',
    fontWeight: '600',
  },
  actionButton: {
    padding: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'NotoSansJP-Regular',
    color: '#6B7280',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: 'NotoSansJP-Regular',
    color: '#9CA3AF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'NotoSansJP-Bold',
    color: '#1F2937',
  },
  closeButton: {
    padding: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    fontFamily: 'NotoSansJP-Regular',
    color: '#6B7280',
    marginBottom: 16,
  },
  timestampText: {
    fontSize: 14,
    fontFamily: 'NotoSansJP-Regular',
    color: '#6B7280',
    marginBottom: 24,
  },
  modalContent: {
    gap: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'NotoSansJP-SemiBold',
    color: '#1F2937',
    marginBottom: 8,
  },
  descriptionInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  outcomeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  outcomeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  resistedButton: {
    borderColor: '#10B981',
    backgroundColor: '#FFFFFF',
  },
  resistedSelected: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  gaveInButton: {
    borderColor: '#F97316',
    backgroundColor: '#FFFFFF',
  },
  gaveInSelected: {
    backgroundColor: '#F97316',
    borderColor: '#F97316',
  },
  outcomeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  outcomeTextSelected: {
    color: '#FFFFFF',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#1F2937',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
  // Custom Picker Styles
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  datePickerContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 350,
  },
  timePickerContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 320,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    flex: 1,
  },
  monthNavButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  monthNavText: {
    fontSize: 24,
    color: '#4F46E5',
    fontWeight: 'bold',
  },
  monthYearText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
    textAlign: 'center',
  },
  weekDaysContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  weekDayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
    paddingVertical: 8,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  dayButton: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    marginVertical: 2,
  },
  selectedDayButton: {
    backgroundColor: '#4F46E5',
  },
  emptyDayButton: {
    opacity: 0,
  },
  dayText: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  selectedDayText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  timeSelectors: {
    flexDirection: 'row',
    marginBottom: 20,
    height: 200,
  },
  timeColumn: {
    flex: 1,
    alignItems: 'center',
  },
  timeColumnLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 10,
  },
  timeScrollView: {
    flex: 1,
    width: '100%',
  },
  timeOption: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderRadius: 8,
    marginVertical: 2,
  },
  selectedTimeOption: {
    backgroundColor: '#4F46E5',
  },
  timeOptionText: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  selectedTimeOptionText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  amPmContainer: {
    gap: 8,
    paddingTop: 10,
  },
  amPmButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  selectedAmPmButton: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  amPmText: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  selectedAmPmText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  pickerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  pickerCancelButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  pickerConfirmButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#4F46E5',
  },
  pickerCancelText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
  pickerConfirmText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  timePickerContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 320,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    flex: 1,
  },
  monthNavButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  monthNavText: {
    fontSize: 24,
    color: '#4F46E5',
    fontWeight: 'bold',
  },
  monthYearText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
    textAlign: 'center',
  },
  weekDaysContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  weekDayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
    paddingVertical: 8,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  dayButton: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    marginVertical: 2,
  },
  selectedDayButton: {
    backgroundColor: '#4F46E5',
  },
  emptyDayButton: {
    opacity: 0,
  },
  dayText: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  selectedDayText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  timeSelectors: {
    flexDirection: 'row',
    marginBottom: 20,
    height: 200,
  },
  timeColumn: {
    flex: 1,
    alignItems: 'center',
  },
  timeColumnLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 10,
  },
  timeScrollView: {
    flex: 1,
    width: '100%',
  },
  timeOption: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderRadius: 8,
    marginVertical: 2,
  },
  selectedTimeOption: {
    backgroundColor: '#4F46E5',
  },
  timeOptionText: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  selectedTimeOptionText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  amPmContainer: {
    gap: 8,
    paddingTop: 10,
  },
  amPmButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  selectedAmPmButton: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  amPmText: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  selectedAmPmText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  pickerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  pickerCancelButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  pickerConfirmButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#4F46E5',
  },
  pickerCancelText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
  pickerConfirmText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});