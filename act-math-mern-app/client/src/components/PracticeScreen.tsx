import { authenticatedFetch } from '../utils/api';

// ... (imports)

// ... (component setup)

  const fetchQuestions = async (isPracticeMore = false) => {
    if (!currentUser) return;
    setLoading(true);
    const endpoint = isPracticeMore ? '/api/questions/practice-more' : `/api/questions/today?limit=10`;
    try {
      const data = await authenticatedFetch(endpoint);
      setQuestions(data);
      startTimeRef.current = Date.now();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

// ... (useEffect hooks)

// ... (handleAnswerSelect function)
    // --- Submit Progress to Server ---
    const submitProgress = async () => {
      if (!currentUser) return;
      try {
        await authenticatedFetch('/api/progress/submit', {
          method: 'POST',
          body: JSON.stringify({
            questionId: questions[currentQuestionIndex].questionId,
            performanceRating,
            timeSpent,
            context: 'practice_session',
            selectedAnswerIndex: selectedIndex,
          }),
        });
      } catch (err) {
        console.error("Failed to submit progress:", err);
      }
    };
    submitProgress();
// ... (rest of component)

export default PracticeScreen;