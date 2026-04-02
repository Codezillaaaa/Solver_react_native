import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, ScrollView, FlatList } from 'react-native';
import Modal from 'react-native-modal';

const QUESTION_COUNT = 10;

function shuffleArray<T>(array: T[]): T[] {
  // Fisher-Yates shuffle
  const arr = [...array];
  for (let i = arr.length -1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

interface Question {
  question: string;
  correct_answer: string;
  options: string[];
}

export default function TabOneScreen() {
  const [categories, setCategories] = useState<{id:number, name:string}[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number[]>([]);
  const [showScore, setShowScore] = useState(false);
  const [showRecap, setShowRecap] = useState(false);
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Fetch categories on mount
  useEffect(() => {
    async function fetchCategories() {
      setLoadingCategories(true);
      try {
        const res = await fetch('https://opentdb.com/api_category.php');
        const data = await res.json();
        setCategories(data.trivia_categories);
      } catch (err) {
        console.error(err);
      }
      setLoadingCategories(false);
    }
    fetchCategories();
  }, []);

  // Fetch questions when category changes
  useEffect(() => {
    if (selectedCategoryId === null) return;

    async function fetchQuestions() {
      setLoading(true);
      try {
        const res = await fetch(
          `https://opentdb.com/api.php?amount=${QUESTION_COUNT}&type=multiple&encode=url3986&category=${selectedCategoryId}`
        );
        const data = await res.json();

        // Process questions (decode + shuffle once)
        const processedQuestions = data.results.map((q: any) => {
          const question = decodeURIComponent(q.question);
          const correct_answer = decodeURIComponent(q.correct_answer);
          const incorrect_answers = q.incorrect_answers.map((a: string) => decodeURIComponent(a));
          const allOptions = shuffleArray([correct_answer, ...incorrect_answers]);
          return {
            question,
            correct_answer,
            options: allOptions,
          };
        });

        setQuestions(processedQuestions);
        setSelected(Array(processedQuestions.length).fill(-1));
        setCurrent(0);
        setShowScore(false);
        setShowRecap(false);
        setExpandedQuestion(null);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    }

    fetchQuestions();
  }, [selectedCategoryId]);

  // UI for categories list (initial screen)
  if (loadingCategories) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!selectedCategoryId) {
    return (
      <View style={styles.container}>
        <Text style={{ fontSize: 24, marginBottom: 20, textAlign: 'center' }}>
          Select a Subject
        </Text>
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={{ paddingBottom: 40 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.categoryButton}
              onPress={() => setSelectedCategoryId(item.id)}
            >
              <Text style={styles.categoryButtonText}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    );
  }

  // Loading questions
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!questions.length) {
    return (
      <View style={styles.container}>
        <Text>Failed to load questions. Try again later.</Text>
        <TouchableOpacity onPress={() => setSelectedCategoryId(null)} style={{marginTop: 20}}>
          <Text style={{color: 'blue'}}>Back to subjects</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Selected category info for top horizontal scroll
  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);

  const q = questions[current];

  const handleSelect = (idx: number) => {
    const updated = [...selected];
    updated[current] = idx;
    setSelected(updated);
  };

  const handleNext = () => {
    setCurrent((prev) => prev + 1);
  };

  const handlePrevious = () => {
    setCurrent((prev) => prev - 1);
  };

  const handleGoToRecap = () => {
    setShowRecap(true);
    setExpandedQuestion(null);
  };

  const handleBackToQuiz = () => {
    setShowRecap(false);
  };

  const handleRecapAnswerChange = (questionIndex: number, optionIndex: number) => {
    const updated = [...selected];
    updated[questionIndex] = optionIndex;
    setSelected(updated);
    setExpandedQuestion(null);
  };

  const handleFinalSubmit = () => {
    setShowScore(true);
  };

  const calcScore = () => {
    let score = 0;
    for (let i = 0; i < questions.length; i++) {
      const selIdx = selected[i];
      if (selIdx === -1) continue;
      if (questions[i].options[selIdx] === questions[i].correct_answer) score++;
    }
    return score;
  };

  const handleRestart = () => {
    setShowScore(false);
    setShowRecap(false);
    setSelectedCategoryId(null);
  };

  // Recap Page View
  if (showRecap) {
    return (
      <View style={{ flex: 1 }}>
        {/* Toolbar */}
        <View style={styles.toolbar}>
          <View style={styles.selectedSubjectContainer}>
            <View style={styles.subjectItem}>
              <Text style={styles.subjectText}>📝 Review Your Answers</Text>
            </View>
          </View>
        </View>

        <ScrollView style={styles.recapContainer} contentContainerStyle={styles.recapContent}>
          <Text style={styles.recapTitle}>
            Review & Edit Your Answers
          </Text>
          <Text style={styles.recapSubtitle}>
            Tap any question to change your answer
          </Text>

          {questions.map((question, qIndex) => (
            <View key={qIndex} style={styles.recapCard}>
              <TouchableOpacity 
                style={styles.recapQuestionHeader}
                onPress={() => setExpandedQuestion(expandedQuestion === qIndex ? null : qIndex)}
              >
                <View style={styles.recapQuestionNumber}>
                  <Text style={styles.recapQuestionNumberText}>{qIndex + 1}</Text>
                </View>
                <View style={styles.recapQuestionContent}>
                  <Text style={styles.recapQuestionText} numberOfLines={expandedQuestion === qIndex ? undefined : 2}>
                    {question.question}
                  </Text>
                  <View style={styles.recapSelectedAnswer}>
                    <MaterialIcons 
                      name={selected[qIndex] !== -1 ? "check-circle" : "radio-button-unchecked"} 
                      size={18} 
                      color={selected[qIndex] !== -1 ? "#4CAF50" : "#999"} 
                    />
                    <Text style={[
                      styles.recapSelectedAnswerText,
                      selected[qIndex] === -1 && styles.recapNoAnswer
                    ]}>
                      {selected[qIndex] !== -1 
                        ? question.options[selected[qIndex]] 
                        : "No answer selected"}
                    </Text>
                  </View>
                </View>
                <MaterialIcons 
                  name={expandedQuestion === qIndex ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                  size={24} 
                  color="#666" 
                />
              </TouchableOpacity>

              {/* Expanded options */}
              {expandedQuestion === qIndex && (
                <View style={styles.recapOptionsContainer}>
                  {question.options.map((option, optIndex) => (
                    <TouchableOpacity
                      key={optIndex}
                      style={[
                        styles.recapOption,
                        selected[qIndex] === optIndex && styles.recapOptionSelected
                      ]}
                      onPress={() => handleRecapAnswerChange(qIndex, optIndex)}
                    >
                      <MaterialIcons 
                        name={selected[qIndex] === optIndex ? "radio-button-checked" : "radio-button-unchecked"} 
                        size={20} 
                        color={selected[qIndex] === optIndex ? "#2196f3" : "#666"} 
                      />
                      <Text style={[
                        styles.recapOptionText,
                        selected[qIndex] === optIndex && styles.recapOptionTextSelected
                      ]}>
                        {option}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          ))}

          {/* Action Buttons */}
          <View style={styles.recapButtonContainer}>
            <TouchableOpacity 
              style={styles.backToQuizButton}
              onPress={handleBackToQuiz}
            >
              <MaterialIcons name="arrow-back" size={20} color="#2196f3" />
              <Text style={styles.backToQuizButtonText}>Back to Quiz</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.finalSubmitButton}
              onPress={handleFinalSubmit}
            >
              <Text style={styles.finalSubmitButtonText}>Final Submit</Text>
              <MaterialIcons name="check" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Score Modal */}
        <Modal isVisible={showScore} onBackdropPress={() => {}} style={styles.bottomModal}>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreText}>🎉 Your Score</Text>
            <Text style={styles.scoreValue}>
              {calcScore()} / {questions.length}
            </Text>
            <Text style={styles.scorePercentage}>
              {Math.round((calcScore() / questions.length) * 100)}%
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={handleRestart}>
              <Text style={styles.closeButtonText}>Start New Quiz</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </View>
    );
  }

  // Quiz View
  return (
    <View style={{ flex: 1 }}>
      {/* Horizontal scroll of selected subject */}
     <View style={styles.toolbar}>
  {/* Center: Selected Subject */}
  <View style={styles.selectedSubjectContainer}>
      <View style={styles.subjectItem}>
          <Text style={styles.subjectText}>{selectedCategory?.name || 'Select Subject'}</Text>
          {selectedCategory?.name && (
            <TouchableOpacity onPress={() => setSelectedCategoryId(null)} style={styles.editIcon}>
              <MaterialIcons name="edit" size={20} color="#2196f3" />
            </TouchableOpacity>
          )}
        </View>
  </View>
  </View>

      <View style={styles.container}>
        <Text style={styles.qCount}>
          Question {current + 1} of {questions.length}
        </Text>
        
        {/* Progress indicator */}
        <View style={styles.progressContainer}>
          {questions.map((_, idx) => (
            <View 
              key={idx} 
              style={[
                styles.progressDot,
                idx === current && styles.progressDotCurrent,
                selected[idx] !== -1 && styles.progressDotAnswered
              ]} 
            />
          ))}
        </View>

        <ScrollView>
          <Text style={styles.question}>{q.question}</Text>
          {q.options.map((option: string, idx: number) => (
            <TouchableOpacity
              key={idx}
              style={[styles.option, selected[current] === idx && styles.selected]}
              onPress={() => handleSelect(idx)}
            >
              <Text style={styles.optionText}>{option}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <View style={styles.buttonRow}>
          {current > 0 && (
            <TouchableOpacity
              style={styles.prevButton}
              onPress={handlePrevious}
            >
              <Text style={styles.buttonText}>Previous</Text>
            </TouchableOpacity>
          )}
          
          {current < questions.length - 1 ? (
            <TouchableOpacity
              style={[styles.nextButton, selected[current] === -1 && styles.disabledButton]}
              disabled={selected[current] === -1}
              onPress={handleNext}
            >
              <Text style={styles.buttonText}>Next</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.submitButton, selected[current] === -1 && styles.disabledButton]}
              disabled={selected[current] === -1}
              onPress={handleGoToRecap}
            >
              <Text style={styles.buttonText}>Review Answers</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 22, justifyContent: 'center', backgroundColor: '#fff' },
  qCount: { fontSize: 18, marginBottom: 10, fontWeight: '600', textAlign: 'center' },
  question: { fontSize: 22, fontWeight: '700', marginBottom: 20, textAlign: 'center' },
  option: { padding: 15, marginVertical: 8, borderWidth: 1, borderColor: '#333', borderRadius: 8 },
  selected: { backgroundColor: '#90ee90', borderColor: '#4CAF50' },
  optionText: { fontSize: 18, color: '#000' },
  buttonRow: { marginTop: 30, flexDirection: 'row', justifyContent: 'center', gap: 12 },
  prevButton: { backgroundColor: '#757575', paddingVertical: 15, paddingHorizontal: 30, borderRadius: 8 },
  nextButton: { backgroundColor: '#2196f3', paddingVertical: 15, paddingHorizontal: 40, borderRadius: 8 },
  submitButton: { backgroundColor: '#4CAF50', paddingVertical: 15, paddingHorizontal: 30, borderRadius: 8 },
  disabledButton: { backgroundColor: '#ccc' },
  buttonText: { color: '#fff', fontSize: 18 },
  bottomModal: { justifyContent: 'flex-end', margin: 0 },
  scoreContainer: { backgroundColor: 'white', padding: 30, borderTopLeftRadius: 25, borderTopRightRadius: 25, alignItems: 'center' },
  scoreText: { fontSize: 28, fontWeight: '700', marginBottom: 10 },
  scoreValue: { fontSize: 48, fontWeight: '800', color: '#2196f3', marginBottom: 5 },
  scorePercentage: { fontSize: 20, color: '#666', marginBottom: 30 },
  closeButton: { backgroundColor: '#2196f3', paddingHorizontal: 40, paddingVertical: 15, borderRadius: 20 },
  closeButtonText: { color: '#fff', fontSize: 18 },
  categoryButton: {
    flex: 1,
    margin: 8,
    backgroundColor: '#2196f3',
    padding: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    textAlign: 'center',
  },
  selectedSubjectButton: {
    backgroundColor: '#2196f3',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  selectedSubjectText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
   toolbar: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },

  brandingContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  branding: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2196f3',
  },

  selectedSubjectContainer: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subjectText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2196f3',
  },

  editButtonContainer: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  editIconButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButtonText: {
    color: '#2196f3',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 6,
  },
  subjectItem: {
    flexDirection: 'row',
    backgroundColor: '#eaf4ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignItems: 'center',
    marginRight: 12,
  },
  editIcon: {
    marginLeft: 8,
  },

  // Progress indicator styles
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    flexWrap: 'wrap',
    gap: 6,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ddd',
  },
  progressDotCurrent: {
    backgroundColor: '#2196f3',
    transform: [{ scale: 1.3 }],
  },
  progressDotAnswered: {
    backgroundColor: '#4CAF50',
  },

  // Recap page styles
  recapContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  recapContent: {
    padding: 16,
    paddingBottom: 40,
  },
  recapTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  recapSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  recapCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    overflow: 'hidden',
  },
  recapQuestionHeader: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'flex-start',
  },
  recapQuestionNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2196f3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recapQuestionNumberText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  recapQuestionContent: {
    flex: 1,
  },
  recapQuestionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  recapSelectedAnswer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recapSelectedAnswerText: {
    fontSize: 14,
    color: '#4CAF50',
    marginLeft: 6,
    fontWeight: '500',
  },
  recapNoAnswer: {
    color: '#999',
    fontStyle: 'italic',
  },
  recapOptionsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    padding: 12,
  },
  recapOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f9f9f9',
  },
  recapOptionSelected: {
    backgroundColor: '#e3f2fd',
    borderWidth: 1,
    borderColor: '#2196f3',
  },
  recapOptionText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
    flex: 1,
  },
  recapOptionTextSelected: {
    color: '#2196f3',
    fontWeight: '600',
  },
  recapButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  backToQuizButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2196f3',
    backgroundColor: '#fff',
  },
  backToQuizButtonText: {
    color: '#2196f3',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  finalSubmitButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
  },
  finalSubmitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
});
