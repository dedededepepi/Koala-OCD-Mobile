import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Platform,
  Alert,
  Animated,
  Modal,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Plus, X, Gamepad2, TreePine, Quote, Waves, ArrowLeft } from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { storageService, UserSettings } from '@/services/storage';
import { KoalaCelebration } from '@/components/KoalaCelebration';
import { format } from 'date-fns';

const { width: screenWidth } = Dimensions.get('window');
const horizontalPadding = 40; // 20px on each side
const gridGap = 12;
const buttonsPerRow = 2;
const buttonWidth = (screenWidth - horizontalPadding - (gridGap * (buttonsPerRow - 1))) / buttonsPerRow;

const compulsionTypes = [
  'Handwashing',
  'Cleaning', 
  'Avoidance',
  'Contamination',
  'Doubt',
  'Symmetry'
];

const motivationalTips = [
  "Remember your values - acting on compulsions moves you away from what truly matters to you.",
  "Take 3 deep breaths and remind yourself that uncertainty is part of life.",
  "This feeling will pass. You don't need to act on every urge you have.",
  "You are stronger than your compulsions. Trust in your ability to resist.",
  "Think about how proud you'll feel after resisting this urge.",
  "Your anxiety is temporary, but your growth from resisting is lasting.",
  "Every time you resist, you're rewiring your brain for freedom.",
  "You've resisted before - you can do it again right now.",
  "What would the person you want to become do in this moment?",
  "Compulsions promise relief but deliver more anxiety. Break the cycle."
];

// Custom Coping Toolbox Icon Component
const CopingToolboxIcon = ({ size = 24, color = "#FFFFFF" }) => (
  <Svg width={size} height={size} viewBox="0 -960 960 960" fill={color}>
    <Path d="M140-244q0-12 7.5-21t20.5-9q4 0 7.5 1.5t6.5 2.5q13 5 25.5 10.5T234-254q44 0 74-30t30-74q0-44-31-73t-75-29q-10 0-19.5 3t-18.5 7q-6 3-11.5 5.5T170-442q-13 0-21.5-8t-8.5-20v-112q0-13 10.5-23.5T174-616h172q8 0 10-8t-6-16q-13-11-19.5-28t-6.5-36q0-66 45-111t111-45q67 0 111.5 48.5T636-694q0 10-6 23.5T610-640q-8 8-6 16t10 8h172q13 0 23.5 10.5T820-582v100q0 14-2.5 28T802-440q-11 0-21.5-3.5T760-452q-9-3-18-5.5t-18-2.5q-43 0-72.5 29.5T622-358q0 44 30 74t74 30q11 0 21.5-2.5T768-264q8-5 16.5-7.5T802-274q9 0 13.5 10t4.5 20v110q0 13-10.5 23.5T786-100H174q-13 0-23.5-10.5T140-134v-110Z"/>
  </Svg>
);

export default function TrackScreen() {
  const [todayCount, setTodayCount] = useState(3);
  const [todayResisted, setTodayResisted] = useState(2);
  const [selectedCompulsion, setSelectedCompulsion] = useState<string | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [buttonScale] = useState(new Animated.Value(1));
  const [resistButtonScale] = useState(new Animated.Value(1));
  const [resistGlowAnimation] = useState(new Animated.Value(0));
  const [isLoading, setIsLoading] = useState(false);
  const [showGiveInModal, setShowGiveInModal] = useState(false);
  const [currentTip, setCurrentTip] = useState(0);
  const [showKoalaCelebration, setShowKoalaCelebration] = useState(false);
  const [successReminders, setSuccessReminders] = useState<Array<{description: string, date: string}>>([]);
  const [currentReminderIndex, setCurrentReminderIndex] = useState(0);
  const [reminderOpacity] = useState(new Animated.Value(1));
  const [showCopingToolbox, setShowCopingToolbox] = useState(false);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [breathingCount, setBreathingCount] = useState(4);
  const [urgeSurfActive, setUrgeSurfActive] = useState(false);
  const [urgeSurfTimeLeft, setUrgeSurfTimeLeft] = useState(300); // 5 minutes in seconds
  const [currentMantra, setCurrentMantra] = useState(0);
  const [selectedGroundingTechnique, setSelectedGroundingTechnique] = useState<string | null>(null);

  const mantras = [
    "This feeling is temporary and will pass.",
    "I am safe, even when my mind says otherwise.",
    "Uncertainty is part of life, and that's okay.",
    "I can sit with discomfort without acting.",
    "My thoughts are not facts.",
    "I choose to respond, not react.",
    "This urge will fade if I don't feed it.",
    "I am stronger than my compulsions."
  ];

  useEffect(() => {
    loadTodayStats();
    loadSettings();
    loadSuccessReminders();
    // Rotate tip every time the modal might be shown
    setCurrentTip(Math.floor(Math.random() * motivationalTips.length));
  }, []);

  useEffect(() => {
    if (successReminders.length > 1) {
      const interval = setInterval(() => {
        // Fade out
        Animated.timing(reminderOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start(() => {
          // Change reminder
          setCurrentReminderIndex(prev => (prev + 1) % successReminders.length);
          // Fade in
          Animated.timing(reminderOpacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }).start();
        });
      }, 10000); // 10 seconds

      return () => clearInterval(interval);
    }
  }, [successReminders, reminderOpacity]);

  const loadSettings = async () => {
    const userSettings = await storageService.getSettings();
    setSettings(userSettings);
  };

  const loadTodayStats = async () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const triggers = await storageService.getTriggersByDate(today);
    setTodayCount(triggers.length || 3);
    setTodayResisted(triggers.filter(t => t.isResisted).length || 2);
  };

  const loadSuccessReminders = async () => {
    const allTriggers = await storageService.getAllTriggers();
    const successfulWithDescriptions = allTriggers
      .filter(trigger => trigger.isResisted && trigger.notes && trigger.notes.trim().length > 0)
      .map(trigger => ({
        description: trigger.notes!,
        date: format(new Date(trigger.timestamp), 'MMM d')
      }))
      .slice(-10); // Get last 10 successful entries with descriptions
    
    setSuccessReminders(successfulWithDescriptions);
  };

  const handleCompulsionSelect = (compulsion: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedCompulsion(compulsion);
  };

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const logTrigger = async (wasResisted: boolean) => {
    if (isLoading) return;
    
    setIsLoading(true);
    animateButton();
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    const trigger = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      isResisted: wasResisted,
      compulsionType: selectedCompulsion || 'general',
    };

    await storageService.addTrigger(trigger);
    await storageService.checkAndUpdateAchievements();
    await loadTodayStats();
    setSelectedCompulsion(null);
    setIsLoading(false);
    
    if (wasResisted) {
      // Show koala celebration for resistance
      setShowKoalaCelebration(true);
    }
    
    const message = wasResisted 
      ? "Great job resisting! 💪" 
      : "It's okay, you're learning. Keep going! 🌱";
    
    if (Platform.OS !== 'web') {
      Alert.alert('Logged', message);
    }
  };

  const handleGiveInPress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setCurrentTip(Math.floor(Math.random() * motivationalTips.length));
    setShowGiveInModal(true);
  };

  const handleConfirmGiveIn = () => {
    setShowGiveInModal(false);
    logTrigger(false);
  };

  const handleCancelGiveIn = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setShowGiveInModal(false);
    
    // Animate the Resist button to be temporarily larger
    Animated.sequence([
      Animated.timing(resistButtonScale, {
        toValue: 1.1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.delay(1000),
      Animated.timing(resistButtonScale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Start glow animation
    startGlowAnimation();
  };

  const startGlowAnimation = useCallback(() => {
    resistGlowAnimation.setValue(0);
    Animated.timing(resistGlowAnimation, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: false,
    }).start(() => {
      // Repeat the glow animation 2 more times
      Animated.timing(resistGlowAnimation, {
        toValue: 0,
        duration: 2000,
        useNativeDriver: false,
      }).start(() => {
        Animated.timing(resistGlowAnimation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        }).start(() => {
          Animated.timing(resistGlowAnimation, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: false,
          }).start();
        });
      });
    });
  }, [resistGlowAnimation]);

  const handleCopingToolboxPress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setShowCopingToolbox(true);
  };

  const handleToolSelect = (tool: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedTool(tool);
  };

  const handleCloseCopingToolbox = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setShowCopingToolbox(false);
    setSelectedTool(null);
    setSelectedGroundingTechnique(null);
    setBreathingActive(false);
    setUrgeSurfActive(false);
    setUrgeSurfTimeLeft(300);
  };

  const startBreathing = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setBreathingActive(true);
    setBreathingPhase('inhale');
    setBreathingCount(4);
    
    const breathingCycle = () => {
      let phase: 'inhale' | 'hold' | 'exhale' = 'inhale';
      let count = 4;
      
      const interval = setInterval(() => {
        count--;
        setBreathingCount(count);
        
        if (count === 0) {
          if (phase === 'inhale') {
            phase = 'hold';
            count = 4;
            setBreathingPhase('hold');
          } else if (phase === 'hold') {
            phase = 'exhale';
            count = 4;
            setBreathingPhase('exhale');
          } else {
            phase = 'inhale';
            count = 4;
            setBreathingPhase('inhale');
          }
          setBreathingCount(count);
        }
      }, 1000);
      
      return interval;
    };
    
    const interval = breathingCycle();
    
    // Auto-stop after 2 minutes
    setTimeout(() => {
      clearInterval(interval);
      setBreathingActive(false);
    }, 120000);
  };

  const startUrgeSurf = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setUrgeSurfActive(true);
    setUrgeSurfTimeLeft(300);
    
    const interval = setInterval(() => {
      setUrgeSurfTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setUrgeSurfActive(false);
          Alert.alert('Great job!', 'You successfully rode the wave for 5 minutes! 🌊');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const getNewMantra = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setCurrentMantra(prev => (prev + 1) % mantras.length);
  };

  const handleGroundingTechniqueSelect = (technique: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedGroundingTechnique(technique);
  };

  const handleSwipeGesture = (event: any) => {
    const { nativeEvent } = event;
    
    if (nativeEvent.state === State.END) {
      // If user swiped down more than 100 pixels with enough velocity
      if (nativeEvent.translationY > 100 || nativeEvent.velocityY > 500) {
        if (Platform.OS !== 'web') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        handleCloseCopingToolbox();
      }
    }
  };

  const handleBackToTools = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedTool(null);
    setSelectedGroundingTechnique(null);
    setBreathingActive(false);
    setUrgeSurfActive(false);
    setUrgeSurfTimeLeft(300);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const successRate = todayCount > 0 ? Math.round((todayResisted / todayCount) * 100) : 67;
  const targetCount = settings?.dailyTarget || 15;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>🐨 OCD Tracker</Text>
            <View style={styles.fireBadge}>
              <Text style={styles.fireEmoji}>🔥</Text>
              <Text style={styles.fireNumber}>1</Text>
            </View>
          </View>
          <Text style={styles.subtitle}>
            You're making progress! Keep going! {successRate >= 80 ? '🌳' : successRate >= 60 ? '🌿' : successRate >= 40 ? '🌱' : '🌰'}
          </Text>
        </View>

        {/* Date and Stats Card */}
        <View style={styles.statsCard}>
          <Text style={styles.dateText}>Wednesday, July 23rd</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{todayCount}</Text>
              <Text style={styles.statLabel}>Total (Target: {targetCount})</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{todayResisted}</Text>
              <Text style={styles.statLabel}>Resisted</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#8B5CF6' }]}>{successRate}%</Text>
              <Text style={styles.statLabel}>Success Rate</Text>
            </View>
          </View>
        </View>

        {/* Question */}
        <Text style={styles.question}>What are you going to do?</Text>

        {/* Compulsion Types */}
        <View style={styles.compulsionGrid}>
          {compulsionTypes.map((compulsion) => (
            <TouchableOpacity
              key={compulsion}
              style={[
                styles.compulsionButton,
                selectedCompulsion === compulsion && styles.compulsionButtonSelected
              ]}
              onPress={() => handleCompulsionSelect(compulsion)}
            >
              <Text style={[
                styles.compulsionText,
                selectedCompulsion === compulsion && styles.compulsionTextSelected
              ]}>
                {compulsion}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Animated.View style={[
            styles.resistButtonContainer,
            {
              shadowColor: resistGlowAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: ['transparent', '#10B981']
              }),
              shadowOpacity: resistGlowAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.8]
              }),
              shadowRadius: resistGlowAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 20]
              }),
              elevation: resistGlowAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [3, 15]
              }),
            }
          ]}>
            <TouchableOpacity
              style={[
                styles.resistButton,
                isLoading && styles.loadingButton
              ]}
              onPress={() => logTrigger(true)}
              disabled={isLoading}
            >
              <Animated.View style={{ transform: [{ scale: resistButtonScale }] }}>
                <Text style={[
                  styles.resistButtonText,
                ]}>
                  {isLoading ? 'Logging...' : 'Resist'}
                </Text>
              </Animated.View>
            </TouchableOpacity>
          </Animated.View>
          
          <TouchableOpacity
            style={[
              styles.giveInButton,
              isLoading && styles.loadingButton
            ]}
            onPress={handleGiveInPress}
            disabled={isLoading}
          >
            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <Text style={[
                styles.giveInButtonText,
              ]}>
                {isLoading ? 'Logging...' : 'Give In'}
              </Text>
            </Animated.View>
          </TouchableOpacity>
        </View>

        {/* Motivational Message */}
        <View style={styles.motivationSection}>
          <Text style={styles.motivationText}>
            Every moment is a new opportunity to choose differently.
          </Text>
          <Text style={styles.motivationSubtext}>
            You're building strength with each decision. 💙
          </Text>
        </View>

        {/* Previous Success Card */}
        {successReminders.length > 0 && (
          <Animated.View style={[styles.successCard, { opacity: reminderOpacity }]}>
            <Text style={styles.successTitle}>
              💪 You did it before on {successReminders[currentReminderIndex]?.date}:
            </Text>
            <Text style={styles.successCompulsion}>
              "{successReminders[currentReminderIndex]?.description}"
            </Text>
            <Text style={styles.successMessage}>
              You can resist again! 👍
            </Text>
          </Animated.View>
        )}

        {/* Footer */}
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity 
        style={styles.floatingButton}
        onPress={handleCopingToolboxPress}
      >
        <CopingToolboxIcon size={24} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Give In Confirmation Modal */}
      <Modal
        visible={showGiveInModal}
        animationType="fade"
        transparent={true}
        onRequestClose={handleCancelGiveIn}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={handleCancelGiveIn}
            >
              <X size={24} color="#6B7280" />
            </TouchableOpacity>

            <View style={styles.tipContainer}>
              <Text style={styles.tipIcon}>💡</Text>
              <Text style={styles.tipText}>
                {motivationalTips[currentTip]}
              </Text>
            </View>

            <Text style={styles.confirmationTitle}>
              Are You Sure You Want to Give In?
            </Text>

            <View style={styles.confirmationButtons}>
              <TouchableOpacity
                style={styles.confirmGiveInButton}
                onPress={handleConfirmGiveIn}
              >
                <Text style={styles.confirmGiveInText}>Yes, Give In</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.confirmResistButton}
                onPress={handleCancelGiveIn}
              >
                <Text style={styles.confirmResistText}>No, Resist</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Koala Celebration Animation */}
      <KoalaCelebration 
        visible={showKoalaCelebration}
        onComplete={() => setShowKoalaCelebration(false)}
      />

      {/* Coping Toolbox Modal */}
      <Modal
        visible={showCopingToolbox}
        animationType="fade"
        transparent={true}
      >
        <View style={styles.toolboxOverlay}>
          <PanGestureHandler onHandlerStateChange={handleSwipeGesture}>
            <View style={styles.toolboxContainer}>
              {/* Modal Handle */}
              <View style={styles.modalHandle} />
            
            <View style={styles.toolboxHeader}>
              <View style={styles.toolboxTitleContainer}>
                {selectedTool ? (
                  <TouchableOpacity onPress={handleBackToTools}>
                    <ArrowLeft size={20} color="#4F46E5" />
                  </TouchableOpacity>
                ) : (
                  <Plus size={20} color="#4F46E5" />
                )}
                <Text style={styles.toolboxTitle}>Coping Toolbox</Text>
              </View>
              <TouchableOpacity 
                style={styles.toolboxCloseButton}
                onPress={handleCloseCopingToolbox}
              >
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.toolboxSubtitle}>
              Take a moment to ground yourself with these helpful tools
            </Text>

            <ScrollView style={styles.modalScrollContent} showsVerticalScrollIndicator={false}>
              {!selectedTool ? (
                <>
                  {/* Tool Selection */}
                  <View style={styles.toolsGrid}>
                    <TouchableOpacity
                      style={[styles.toolButton, styles.urgeSurfButton]}
                      onPress={() => handleToolSelect('urgeSurf')}
                    >
                      <Gamepad2 size={20} color="#FFFFFF" />
                      <Text style={styles.toolButtonText}>Urge Surf</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[styles.toolButton, styles.breathingButton]}
                      onPress={() => handleToolSelect('breathing')}
                    >
                      <Waves size={20} color="#FFFFFF" />
                      <Text style={styles.toolButtonText}>Breathing</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[styles.toolButton, styles.groundingButton]}
                      onPress={() => handleToolSelect('grounding')}
                    >
                      <TreePine size={20} color="#FFFFFF" />
                      <Text style={styles.toolButtonText}>Grounding</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[styles.toolButton, styles.mantrasButton]}
                      onPress={() => handleToolSelect('mantras')}
                    >
                      <Quote size={20} color="#FFFFFF" />
                      <Text style={styles.toolButtonText}>Mantras</Text>
                    </TouchableOpacity>
                  </View>
                  
                  {/* Close Toolbox Button on Selection Page */}
                  <TouchableOpacity
                    style={styles.closeToolboxButton}
                    onPress={handleCloseCopingToolbox}
                  >
                    <Text style={styles.closeToolboxButtonText}>Close Toolbox</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <View style={styles.toolContent}>
                  {/* Urge Surf Tool */}
                  {selectedTool === 'urgeSurf' && (
                  <View style={styles.toolSection}>
                    <View style={styles.toolHeader}>
                      <Gamepad2 size={24} color="#4F46E5" />
                      <Text style={styles.toolTitle}>Urge Surf</Text>
                    </View>
                    <Text style={styles.toolDescription}>
                      Ride the wave of discomfort for 5 minutes without acting
                    </Text>
                    
                    <View style={styles.toolCard}>
                      <Gamepad2 size={32} color="#4F46E5" />
                      <Text style={styles.toolCardTitle}>
                        {urgeSurfActive ? `${formatTime(urgeSurfTimeLeft)}` : 'Ready to surf?'}
                      </Text>
                    </View>
                    
                    {!urgeSurfActive ? (
                      <>
                        <Text style={styles.howItWorksTitle}>How it works:</Text>
                        <View style={styles.stepsList}>
                          <Text style={styles.stepText}>• Feel the urge but don't act on it</Text>
                          <Text style={styles.stepText}>• Watch the waves and breathe deeply</Text>
                          <Text style={styles.stepText}>• Notice how the urge peaks and fades</Text>
                          <Text style={styles.stepText}>• Ride it out for the full 5 minutes</Text>
                        </View>
                        
                        <TouchableOpacity
                          style={styles.startButton}
                          onPress={startUrgeSurf}
                        >
                          <Waves size={16} color="#FFFFFF" />
                          <Text style={styles.startButtonText}>Ride the Wave</Text>
                        </TouchableOpacity>
                      </>
                    ) : (
                      <View style={styles.activeSession}>
                        <Text style={styles.activeSessionText}>
                          Focus on your breathing. Notice the urge without judgment. 
                          You're riding the wave - it will pass.
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                {/* Breathing Tool */}
                {selectedTool === 'breathing' && (
                  <View style={styles.toolSection}>
                    <View style={styles.toolHeader}>
                      <Waves size={24} color="#4F46E5" />
                      <Text style={styles.toolTitle}>4-4-4 Breathing</Text>
                    </View>
                    <Text style={styles.toolDescription}>
                      Inhale for 4, hold for 4, exhale for 4
                    </Text>
                    
                    <View style={styles.toolCard}>
                      <Waves size={32} color="#4F46E5" />
                      <Text style={styles.toolCardTitle}>
                        {breathingActive ? `${breathingPhase.charAt(0).toUpperCase() + breathingPhase.slice(1)}: ${breathingCount}` : 'Click Start to begin'}
                      </Text>
                    </View>
                    
                    {!breathingActive ? (
                      <>
                        <TouchableOpacity
                          style={styles.startButton}
                          onPress={startBreathing}
                        >
                          <Text style={styles.startButtonText}>▶ Start</Text>
                        </TouchableOpacity>
                        
                        <Text style={styles.breathingInstructions}>
                          Focus on the box and follow the breathing rhythm. 
                          Let your body relax with each breath.
                        </Text>
                      </>
                    ) : (
                      <View style={styles.activeSession}>
                        <Text style={styles.activeSessionText}>
                          Follow the rhythm. Let each breath calm your mind and body.
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                {/* Grounding Tool */}
                {selectedTool === 'grounding' && (
                  <View style={styles.toolSection}>
                    {!selectedGroundingTechnique ? (
                      <>
                        <View style={styles.toolHeader}>
                          <TreePine size={24} color="#4F46E5" />
                          <Text style={styles.toolTitle}>Grounding Techniques</Text>
                        </View>
                        <Text style={styles.toolDescription}>
                          Choose a technique to ground yourself in the present moment
                        </Text>
                        
                        <View style={styles.groundingTechniques}>
                          <TouchableOpacity
                            style={[styles.groundingTechniqueButton, styles.selectedGroundingButton]}
                            onPress={() => handleGroundingTechniqueSelect('5-4-3-2-1')}
                          >
                            <Text style={[styles.groundingTechniqueText, styles.selectedGroundingText]}>5-4-3-2-1 Technique</Text>
                          </TouchableOpacity>
                          
                          <TouchableOpacity
                            style={[styles.groundingTechniqueButton, styles.selectedGroundingButton]}
                            onPress={() => handleGroundingTechniqueSelect('bodyScan')}
                          >
                            <Text style={[styles.groundingTechniqueText, styles.selectedGroundingText]}>Body Scan</Text>
                          </TouchableOpacity>
                          
                          <TouchableOpacity
                            style={[styles.groundingTechniqueButton, styles.selectedGroundingButton]}
                            onPress={() => handleGroundingTechniqueSelect('mindfulObservation')}
                          >
                            <Text style={[styles.groundingTechniqueText, styles.selectedGroundingText]}>Mindful Observation</Text>
                          </TouchableOpacity>
                        </View>
                      </>
                    ) : selectedGroundingTechnique === '5-4-3-2-1' ? (
                      <>
                        <View style={styles.toolHeader}>
                          <TreePine size={24} color="#4F46E5" />
                          <Text style={styles.toolTitle}>5-4-3-2-1 Technique</Text>
                        </View>
                        <Text style={styles.toolDescription}>
                          Ground yourself in the present moment
                        </Text>
                        
                        <View style={styles.groundingSteps}>
                          <View style={styles.groundingStep}>
                            <Text style={styles.groundingNumber}>5</Text>
                            <Text style={styles.groundingText}>things you can see</Text>
                          </View>
                          <View style={styles.groundingStep}>
                            <Text style={styles.groundingNumber}>4</Text>
                            <Text style={styles.groundingText}>things you can touch</Text>
                          </View>
                          <View style={styles.groundingStep}>
                            <Text style={styles.groundingNumber}>3</Text>
                            <Text style={styles.groundingText}>things you can hear</Text>
                          </View>
                          <View style={styles.groundingStep}>
                            <Text style={styles.groundingNumber}>2</Text>
                            <Text style={styles.groundingText}>things you can smell</Text>
                          </View>
                          <View style={styles.groundingStep}>
                            <Text style={styles.groundingNumber}>1</Text>
                            <Text style={styles.groundingText}>thing you can taste</Text>
                          </View>
                        </View>
                        
                        <Text style={styles.groundingInstructions}>
                          Take your time with each step. Notice the details around you. 
                          This helps bring you back to the present moment.
                        </Text>
                      </>
                    ) : selectedGroundingTechnique === 'bodyScan' ? (
                      <>
                        <View style={styles.toolHeader}>
                          <TreePine size={24} color="#4F46E5" />
                          <Text style={styles.toolTitle}>Body Scan</Text>
                        </View>
                        <Text style={styles.toolDescription}>
                          Release tension and reconnect with your body
                        </Text>
                        
                        <View style={styles.groundingSteps}>
                          <View style={styles.groundingStep}>
                            <Text style={styles.groundingNumber}>1</Text>
                            <Text style={styles.groundingText}>Start at the top of your head</Text>
                          </View>
                          <View style={styles.groundingStep}>
                            <Text style={styles.groundingNumber}>2</Text>
                            <Text style={styles.groundingText}>Notice any tension in your forehead and eyes</Text>
                          </View>
                          <View style={styles.groundingStep}>
                            <Text style={styles.groundingNumber}>3</Text>
                            <Text style={styles.groundingText}>Relax your jaw and shoulders</Text>
                          </View>
                          <View style={styles.groundingStep}>
                            <Text style={styles.groundingNumber}>4</Text>
                            <Text style={styles.groundingText}>Feel your arms and hands</Text>
                          </View>
                          <View style={styles.groundingStep}>
                            <Text style={styles.groundingNumber}>5</Text>
                            <Text style={styles.groundingText}>Notice your chest rising and falling</Text>
                          </View>
                          <View style={styles.groundingStep}>
                            <Text style={styles.groundingNumber}>6</Text>
                            <Text style={styles.groundingText}>Relax your stomach and back</Text>
                          </View>
                          <View style={styles.groundingStep}>
                            <Text style={styles.groundingNumber}>7</Text>
                            <Text style={styles.groundingText}>Feel your legs and feet on the ground</Text>
                          </View>
                        </View>
                        
                        <Text style={styles.groundingInstructions}>
                          Take your time with each step. There's no rush - 
                          focus on the present moment.
                        </Text>
                      </>
                    ) : (
                      <>
                        <View style={styles.toolHeader}>
                          <TreePine size={24} color="#4F46E5" />
                          <Text style={styles.toolTitle}>Mindful Observation</Text>
                        </View>
                        <Text style={styles.toolDescription}>
                          Focus your attention on one object
                        </Text>
                        
                        <View style={styles.groundingSteps}>
                          <View style={styles.groundingStep}>
                            <Text style={styles.groundingNumber}>1</Text>
                            <Text style={styles.groundingText}>Choose an object near you</Text>
                          </View>
                          <View style={styles.groundingStep}>
                            <Text style={styles.groundingNumber}>2</Text>
                            <Text style={styles.groundingText}>Look at its color, shape, and texture</Text>
                          </View>
                          <View style={styles.groundingStep}>
                            <Text style={styles.groundingNumber}>3</Text>
                            <Text style={styles.groundingText}>Notice how light hits its surface</Text>
                          </View>
                          <View style={styles.groundingStep}>
                            <Text style={styles.groundingNumber}>4</Text>
                            <Text style={styles.groundingText}>Observe any shadows it creates</Text>
                          </View>
                          <View style={styles.groundingStep}>
                            <Text style={styles.groundingNumber}>5</Text>
                            <Text style={styles.groundingText}>Focus only on this object for 2 minutes</Text>
                          </View>
                        </View>
                        
                        <Text style={styles.groundingInstructions}>
                          Take your time with each step. There's no rush - 
                          focus on the present moment.
                        </Text>
                      </>
                    )}
                  </View>
                )}

                {/* Original Grounding Tool - keeping for reference but now integrated above */}
                {false && selectedTool === 'grounding' && (
                  <View style={styles.toolSection}>
                    <View style={styles.toolHeader}>
                      <TreePine size={24} color="#4F46E5" />
                      <Text style={styles.toolTitle}>5-4-3-2-1 Grounding</Text>
                    </View>
                    <Text style={styles.toolDescription}>
                      Ground yourself in the present moment
                    </Text>
                    
                    <View style={styles.groundingSteps}>
                      <View style={styles.groundingStep}>
                        <Text style={styles.groundingNumber}>5</Text>
                        <Text style={styles.groundingText}>things you can see</Text>
                      </View>
                      <View style={styles.groundingStep}>
                        <Text style={styles.groundingNumber}>4</Text>
                        <Text style={styles.groundingText}>things you can touch</Text>
                      </View>
                      <View style={styles.groundingStep}>
                        <Text style={styles.groundingNumber}>3</Text>
                        <Text style={styles.groundingText}>things you can hear</Text>
                      </View>
                      <View style={styles.groundingStep}>
                        <Text style={styles.groundingNumber}>2</Text>
                        <Text style={styles.groundingText}>things you can smell</Text>
                      </View>
                      <View style={styles.groundingStep}>
                        <Text style={styles.groundingNumber}>1</Text>
                        <Text style={styles.groundingText}>thing you can taste</Text>
                      </View>
                    </View>
                    
                    <Text style={styles.groundingInstructions}>
                      Take your time with each step. Notice the details around you. 
                      This helps bring you back to the present moment.
                    </Text>
                  </View>
                )}

                {/* Mantras Tool */}
                {selectedTool === 'mantras' && (
                  <View style={styles.toolSection}>
                    <View style={styles.toolHeader}>
                      <Quote size={24} color="#4F46E5" />
                      <Text style={styles.toolTitle}>Calming Mantras</Text>
                    </View>
                    <Text style={styles.toolDescription}>
                      Repeat these phrases to yourself when feeling overwhelmed
                    </Text>
                    
                    <View style={styles.mantraCard}>
                      <Quote size={24} color="#4F46E5" />
                      <Text style={styles.mantraText}>
                        "{mantras[currentMantra]}"
                      </Text>
                    </View>
                    
                    <TouchableOpacity
                      style={styles.newMantraButton}
                      onPress={getNewMantra}
                    >
                      <Text style={styles.startButtonText}>✨ New Mantra</Text>
                    </TouchableOpacity>
                    
                    <Text style={styles.mantrasListTitle}>All Available Mantras:</Text>
                    <ScrollView style={styles.mantrasList} showsVerticalScrollIndicator={false}>
                      {mantras.map((mantra, index) => (
                        <TouchableOpacity
                          key={index}
                          style={[
                            styles.mantraListItem,
                            index === currentMantra && styles.mantraListItemActive
                          ]}
                          onPress={() => setCurrentMantra(index)}
                        >
                          <Text style={[
                            styles.mantraListText,
                            index === currentMantra && styles.mantraListTextActive
                          ]}>
                            "{mantra}"
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
                
                <TouchableOpacity
                  style={styles.closeToolboxButton}
                  onPress={handleBackToTools}
                >
                  <Text style={styles.closeToolboxButtonText}>← Back to Toolbox</Text>
                </TouchableOpacity>
                </View>
              )}
            </ScrollView>
            </View>
          </PanGestureHandler>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 12,
    position: 'relative',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: 'NotoSansJP-Bold',
    color: '#1F2937',
  },
  fireBadge: {
    backgroundColor: '#F97316',
    borderRadius: 20,
    width: 50,
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    position: 'absolute',
    right: 0,
  },
  fireEmoji: {
    fontSize: 16,
  },
  fireNumber: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'NotoSansJP-Bold',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'NotoSansJP-Regular',
    color: '#6B7280',
    textAlign: 'center',
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dateText: {
    fontSize: 14,
    fontFamily: 'NotoSansJP-Regular',
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'NotoSansJP-Bold',
    color: '#4F46E5',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: 'NotoSansJP-Regular',
    color: '#6B7280',
    textAlign: 'center',
  },
  question: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'NotoSansJP-Bold',
    color: '#1F2937',
    textAlign: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  compulsionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  compulsionButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    width: buttonWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compulsionButtonSelected: {
    backgroundColor: '#EEF2FF',
    borderColor: '#4F46E5',
  },
  compulsionText: {
    fontSize: 12,
    fontFamily: 'NotoSansJP-Medium',
    color: '#374151',
    fontWeight: '500',
  },
  compulsionTextSelected: {
    color: '#4F46E5',
    fontWeight: '600',
    fontFamily: 'NotoSansJP-SemiBold',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 16,
    marginBottom: 24,
  },
  resistButtonContainer: {
    flex: 1,
    borderRadius: 16,
  },
  resistButton: {
    width: '100%',
    backgroundColor: '#10B981',
    borderRadius: 16,
    paddingVertical: 24,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  loadingButton: {
    opacity: 0.8,
  },
  resistButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'NotoSansJP-Bold',
  },
  disabledButtonText: {
    opacity: 0.7,
  },
  giveInButton: {
    flex: 1,
    backgroundColor: '#F97316',
    borderRadius: 16,
    paddingVertical: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  giveInButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'NotoSansJP-Bold',
  },
  motivationSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  motivationText: {
    fontSize: 16,
    fontFamily: 'NotoSansJP-Regular',
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  motivationSubtext: {
    fontSize: 16,
    fontFamily: 'NotoSansJP-Regular',
    color: '#6B7280',
    textAlign: 'center',
  },
  successCard: {
    backgroundColor: '#F0FDF4',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  successTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#065F46',
    marginBottom: 8,
  },
  successCompulsion: {
    fontSize: 16,
    color: '#047857',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 14,
    color: '#065F46',
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
    marginBottom: 60,
  },
  floatingButton: {
    position: 'absolute',
    right: 20,
    bottom: 100,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
    zIndex: 1,
  },
  tipContainer: {
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  tipIcon: {
    fontSize: 20,
    marginTop: 2,
  },
  tipText: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
    flex: 1,
  },
  confirmationTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 24,
  },
  confirmationButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  confirmGiveInButton: {
    flex: 1,
    backgroundColor: '#F97316',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  confirmGiveInText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmResistButton: {
    flex: 1,
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  confirmResistText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Coping Toolbox Styles
  toolboxOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  toolboxContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingTop: 24,
    paddingBottom: 32,
    paddingHorizontal: 24,
    width: '100%',
    height: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  toolboxHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  toolboxTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toolboxTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'NotoSansJP-Bold',
    color: '#1F2937',
  },
  toolboxCloseButton: {
    padding: 4,
  },
  toolboxSubtitle: {
    fontSize: 14,
    fontFamily: 'NotoSansJP-Regular',
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
  },
  toolButton: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 10,
  },
  urgeSurfButton: {
    backgroundColor: '#38BDF8',
  },
  breathingButton: {
    backgroundColor: '#FB923C',
  },
  groundingButton: {
    backgroundColor: '#10B981',
  },
  mantrasButton: {
    backgroundColor: '#8B5CF6',
  },
  toolButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalScrollContent: {
    flex: 1,
  },
  toolContent: {
    paddingBottom: 20,
  },
  toolSection: {
    gap: 16,
  },
  toolHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  toolTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  toolDescription: {
    fontSize: 18,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  toolCard: {
    backgroundColor: '#EEF2FF',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    gap: 20,
    marginVertical: 16,
  },
  toolCardTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#4F46E5',
    textAlign: 'center',
  },
  howItWorksTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 8,
  },
  stepsList: {
    gap: 8,
  },
  stepText: {
    fontSize: 14,
    color: '#4F46E5',
    lineHeight: 20,
  },
  startButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  activeSession: {
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
  },
  activeSessionText: {
    fontSize: 14,
    color: '#065F46',
    textAlign: 'center',
    lineHeight: 20,
  },
  breathingInstructions: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 16,
  },
  groundingSteps: {
    gap: 16,
  },
  groundingStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 8,
  },
  groundingNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4F46E5',
    width: 32,
    textAlign: 'center',
  },
  groundingText: {
    fontSize: 16,
    color: '#1F2937',
    flex: 1,
  },
  groundingInstructions: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 16,
  },
  mantraCard: {
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    gap: 16,
  },
  mantraText: {
    fontSize: 18,
    color: '#4F46E5',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 24,
  },
  newMantraButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  newMantraButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  mantrasListTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 24,
    marginBottom: 12,
  },
  mantrasList: {
    maxHeight: 200,
  },
  mantraListItem: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  mantraListItemActive: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#4F46E5',
  },
  mantraListText: {
    fontSize: 14,
    color: '#6B7280',
  },
  mantraListTextActive: {
    color: '#4F46E5',
    fontWeight: '500',
  },
  closeToolboxButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  closeToolboxButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
  groundingTechniques: {
    gap: 12,
    marginTop: 16,
  },
  groundingTechniqueButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedGroundingButton: {
    backgroundColor: '#1F2937',
    borderColor: '#1F2937',
  },
  groundingTechniqueText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  selectedGroundingText: {
    color: '#FFFFFF',
  },
});