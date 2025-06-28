import React, { useState, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import { useInteractionTracker } from '../hooks/useInteractionTracker';
import { getSurveyService, type SurveyConfig, type SurveyResponse, type SurveyQuestion, QuestionType } from '../api';
import './SurveyPopup.css';

interface SurveyPopupProps {
  surveyId: string;
  projectId?: string;
  visible: boolean;
  onClose: () => void;
  onComplete?: (responses: SurveyResponse[]) => void;
}

export const SurveyPopup: React.FC<SurveyPopupProps> = ({
  surveyId,
  projectId,
  visible,
  onClose,
  onComplete
}) => {
  const { projectId: contextProjectId } = useProject();
  const { trackEvent } = useInteractionTracker();
  const surveyService = getSurveyService();
  
  const [surveyConfig, setSurveyConfig] = useState<SurveyConfig | null>(null);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const finalProjectId = projectId || contextProjectId;

  useEffect(() => {
    if (visible && surveyId && finalProjectId) {
      fetchSurveyConfig();
    }
  }, [visible, surveyId, finalProjectId]);

  const fetchSurveyConfig = async () => {
    if (!finalProjectId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const config = await surveyService.getSurvey(surveyId, finalProjectId);
      setSurveyConfig(config);
      
      // Track survey view
      trackEvent('survey_impression', { 
        eventId: `${surveyId}_impression_${Date.now()}`,
        surveyId: surveyId 
      }, finalProjectId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load survey');
    } finally {
      setLoading(false);
    }
  };

  const handleResponseChange = (questionId: string, answer: any) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmit = async () => {
    if (!surveyConfig || !finalProjectId) return;
    
    setSubmitting(true);
    setError(null);
    
    try {
      const surveyResponses: SurveyResponse[] = Object.entries(responses).map(([questionId, answer]) => ({
        questionId,
        answer: String(answer) // Convert to string for API
      }));
      
      await surveyService.submitSurveyResponse({
        surveyId,
        projectId: finalProjectId,
        responses: surveyResponses
      });
      
      // Track survey completion
      trackEvent('survey_submit', { 
        eventId: `${surveyId}_submit_${Date.now()}`,
        surveyId: surveyId 
      }, finalProjectId);
      
      onComplete?.(surveyResponses);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit survey');
    } finally {
      setSubmitting(false);
    }
  };

  const renderQuestion = (question: SurveyQuestion) => {
    const value = responses[question.id];
    
    switch (question.type) {
      case QuestionType.Text:
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            placeholder="Enter your answer..."
            className="survey-input"
          />
        );
        
      case QuestionType.MultipleChoice:
        return (
          <div className="survey-options">
            {question.options?.map((option: string, index: number) => (
              <label key={index} className="survey-option">
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={value === option}
                  onChange={(e) => handleResponseChange(question.id, e.target.value)}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        );
        
      case QuestionType.Rating:
        const maxRating = question.maxRating || 5;
        return (
          <div className="survey-rating">
            {Array.from({ length: maxRating }, (_, i) => (
              <button
                key={i}
                type="button"
                className={`rating-star ${value && value > i ? 'filled' : ''}`}
                onClick={() => handleResponseChange(question.id, i + 1)}
              >
                ★
              </button>
            ))}
          </div>
        );
        
      case QuestionType.Boolean:
        return (
          <div className="survey-boolean">
            <label className="survey-option">
              <input
                type="radio"
                name={question.id}
                value="true"
                checked={value === true}
                onChange={() => handleResponseChange(question.id, true)}
              />
              <span>Yes</span>
            </label>
            <label className="survey-option">
              <input
                type="radio"
                name={question.id}
                value="false"
                checked={value === false}
                onChange={() => handleResponseChange(question.id, false)}
              />
              <span>No</span>
            </label>
          </div>
        );
        
      default:
        return null;
    }
  };

  if (!visible) return null;

  return (
    <div className="survey-overlay">
      <div className="survey-popup">
        <div className="survey-header">
          <h2>{surveyConfig?.title || 'Survey'}</h2>
          <button 
            type="button" 
            className="survey-close"
            onClick={onClose}
            aria-label="Close survey"
          >
            ×
          </button>
        </div>
        
        <div className="survey-content">
          {loading && (
            <div className="survey-loading">
              <div className="loading-spinner"></div>
              <p>Loading survey...</p>
            </div>
          )}
          
          {error && (
            <div className="survey-error">
              <p>{error}</p>
            </div>
          )}
          
          {surveyConfig && !loading && (
            <>
              {surveyConfig.description && (
                <p className="survey-description">{surveyConfig.description}</p>
              )}
              
              <div className="survey-questions">
                {surveyConfig.questions.map((question, index) => (
                  <div key={question.id} className="survey-question">
                    <label className="question-label">
                      {index + 1}. {question.question}
                    </label>
                    {renderQuestion(question)}
                  </div>
                ))}
              </div>
              
              <div className="survey-actions">
                <button
                  type="button"
                  className="survey-cancel"
                  onClick={onClose}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="survey-submit"
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : 'Submit Survey'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}; 