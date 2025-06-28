import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ChevronDown } from 'lucide-react';
import { Modal } from '../Modal';
import { apiService, Survey, SurveyQuestion } from '../../services/apiService';
import './ManageSurveys.css';

interface ManageSurveysProps {
  projectId: string;
}

interface NewSurveyForm {
  title: string; // Changed from 'name' to 'title' to match backend
  description: string;
  questionCount: number;
  questions: Omit<SurveyQuestion, 'id'>[];
}

interface FormErrors {
  title?: string; // Changed from 'name' to 'title' to match backend
  description?: string;
  questionCount?: string;
  questions?: { [key: number]: { question?: string; type?: string } };
}

  const ManageSurveys: React.FC<ManageSurveysProps> = ({ projectId }) => {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [surveyToDelete, setSurveyToDelete] = useState<string | null>(null);
  const [newSurvey, setNewSurvey] = useState<NewSurveyForm>({
    title: '',
    description: '',
    questionCount: 1,
    questions: [{ question: '', type: 'text' }],
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (projectId) {
      loadSurveys();
    }
  }, [projectId]);

  const loadSurveys = async () => {
    try {
      setLoading(true);
      const surveysData = await apiService.getSurveysByProject(projectId);
      setSurveys(surveysData);
    } catch (error) {
      console.error('Failed to load surveys:', error);
      setSurveys([]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionCountChange = (count: number) => {
    const validCount = Math.max(1, Math.min(20, count)); // Limit between 1-20 questions
    const currentQuestions = [...newSurvey.questions];
    
    if (validCount > currentQuestions.length) {
      // Add new questions
      for (let i = currentQuestions.length; i < validCount; i++) {
        currentQuestions.push({ question: '', type: 'text' });
      }
    } else if (validCount < currentQuestions.length) {
      // Remove extra questions
      currentQuestions.splice(validCount);
    }

    setNewSurvey(prev => ({
      ...prev,
      questionCount: validCount,
      questions: currentQuestions,
    }));
  };

  const handleQuestionChange = (index: number, field: 'question' | 'type', value: string) => {
    setNewSurvey(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) =>
        i === index ? { ...q, [field]: value } : q
      ),
    }));
    
    // Clear the error for this question field when user starts typing
    if (formErrors.questions?.[index]?.[field]) {
      setFormErrors(prev => ({
        ...prev,
        questions: {
          ...prev.questions,
          [index]: {
            ...prev.questions?.[index],
            [field]: undefined,
          }
        }
      }));
    }
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    
    if (!newSurvey.title.trim()) {
      errors.title = 'Survey title is required';
    }
    
    if (!newSurvey.description.trim()) {
      errors.description = 'Description is required';
    }

    // Validate each question
    newSurvey.questions.forEach((question, index) => {
      if (!question.question.trim()) {
        if (!errors.questions) errors.questions = {};
        errors.questions[index] = { question: 'Question text is required' };
      }
    });
    
    setFormErrors(errors);
    
    // Check if there are any errors
    const hasBasicErrors = errors.title || errors.description;
    const hasQuestionErrors = errors.questions && Object.keys(errors.questions).length > 0;
    
    return !hasBasicErrors && !hasQuestionErrors;
  };

  const handleCreateSurvey = async () => {
    try {
      if (!validateForm()) {
        return;
      }

      const surveyToCreate = {
        projectId: projectId,
        title: newSurvey.title,
        description: newSurvey.description,
        questions: newSurvey.questions.map((q, index) => ({
          ...q,
          id: `${Date.now()}-${index}`,
          maxRating: q.type === 'rating' ? 5 : undefined,
          required: false, // Default to false for now
          order: index + 1,
        })),
        isActive: true,
      };

      const createdSurvey = await apiService.createSurvey(surveyToCreate);
      setSurveys(prevSurveys => [...prevSurveys, createdSurvey]);
      
      // Reset form and close modal
      setNewSurvey({
        title: '',
        description: '',
        questionCount: 1,
        questions: [{ question: '', type: 'text' }],
      });
      
      setIsCreateModalOpen(false);
      
    } catch (error) {
      console.error('Failed to create survey:', error);
      alert('Failed to create survey. Please try again.');
    }
  };

  const handleInputChange = (field: keyof Pick<NewSurveyForm, 'title' | 'description'>, value: string) => {
    setNewSurvey(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear the error for this field when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleDeleteSurvey = (surveyId: string) => {
    setSurveyToDelete(surveyId);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteSurvey = async () => {
    if (!surveyToDelete) return;
    
    try {
      await apiService.deleteSurvey(surveyToDelete, projectId);
      setSurveys(prevSurveys => prevSurveys.filter(survey => survey.id !== surveyToDelete));
      setIsDeleteModalOpen(false);
      setSurveyToDelete(null);
    } catch (error) {
      console.error('Failed to delete survey:', error);
      alert('Failed to delete survey. Please try again.');
    }
  };

  const cancelDeleteSurvey = () => {
    setIsDeleteModalOpen(false);
    setSurveyToDelete(null);
  };

  if (loading) {
    return (
      <div className="manage-surveys-loading">
        <div className="spinner"></div>
        <p>Loading surveys...</p>
      </div>
    );
  }

  return (
    <div className="manage-surveys-container chart-card">
      <div className='button-display'>
        <button 
          className="create-survey-button"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <Plus size={18} />
          Create a New Survey
        </button>
      </div>

      {surveys.length === 0 ? (
        <div className="empty-state">
          <p>Create survey to view the list</p>
        </div>
      ) : (
        <div className="surveys-table-container">
          <table className="surveys-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Description</th>
                <th>Questions</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {surveys.map((survey) => (
                <tr key={survey.id}>
                  <td>{survey.title}</td>
                  <td>{survey.description}</td>
                  <td>{survey.questions.length}</td>
                  <td>
                    <span className={`status-badge ${survey.isActive ? 'active' : 'inactive'}`}>
                      {survey.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="action-button delete"
                        onClick={() => handleDeleteSurvey(survey.id)}
                        title="Delete survey"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Survey Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setNewSurvey({
            title: '',
            description: '',
            questionCount: 1,
            questions: [{ question: '', type: 'text' }],
          });
          setFormErrors({});
        }}
        title="Create a New Survey"
        maxWidth="600px"
      >
        <div className="create-survey-form">
          <div className="form-group">
            <label htmlFor="survey-name" className="form-label">
              Survey Title
            </label>
            <input
              id="survey-name"
              type="text"
              value={newSurvey.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter survey title"
              className="form-input"
            />
            {formErrors.title && <span className="error-text">{formErrors.title}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="survey-description" className="form-label">
              Description
            </label>
            <textarea
              id="survey-description"
              value={newSurvey.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter survey description"
              className="form-textarea"
              rows={3}
            />
            {formErrors.description && <span className="error-text">{formErrors.description}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="question-count" className="form-label">
              Number of Questions
            </label>
            <input
              id="question-count"
              type="number"
              min="1"
              max="20"
              value={newSurvey.questionCount}
              onChange={(e) => handleQuestionCountChange(parseInt(e.target.value) || 1)}
              className="form-input question-count-input"
            />
          </div>

          <div className="questions-section">
            <h4 className="questions-title">Configure Questions</h4>
            {newSurvey.questions.map((question, index) => (
              <div key={index} className="question-config">
                <div className="question-header">
                  <h5>Question {index + 1}</h5>
                </div>
                
                <div className="form-group">
                  <label htmlFor={`question-${index}`} className="form-label">
                    Question Text
                  </label>
                  <input
                    id={`question-${index}`}
                    type="text"
                    value={question.question}
                    onChange={(e) => handleQuestionChange(index, 'question', e.target.value)}
                    placeholder="Enter your question"
                    className="form-input"
                  />
                  {formErrors.questions?.[index]?.question && (
                    <span className="error-text">{formErrors.questions[index].question}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor={`question-type-${index}`} className="form-label">
                    Question Type
                  </label>
                  <select
                    id={`question-type-${index}`}
                    value={question.type}
                    onChange={(e) => handleQuestionChange(index, 'type', e.target.value)}
                    className="form-select"
                  >
                    <option value="text">Text</option>
                    <option value="multiple_choice">Multiple Choice</option>
                    <option value="rating">Rating</option>
                    <option value="boolean">Boolean (Yes/No)</option>
                  </select>
                </div>
              </div>
            ))}
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={handleCreateSurvey}
              className="submit-button"
            >
              Create Survey
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={cancelDeleteSurvey}
        title="Delete Survey"
        maxWidth="400px"
      >
        <div className="delete-confirmation">
          <p>Are you sure you want to delete this survey?</p>
          <div className="delete-actions">
            <button
              type="button"
              onClick={confirmDeleteSurvey}
              className="confirm-delete-button"
            >
              Yes
            </button>
            <button
              type="button"
              onClick={cancelDeleteSurvey}
              className="cancel-delete-button"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ManageSurveys; 