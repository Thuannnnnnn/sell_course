import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Checkbox } from '../ui/checkbox'
import { Label } from '../ui/label'
import { 
  Pencil, 
  Trash2, 
  Plus, 
  Save, 
  X, 
  FileQuestion,
  Target,
  Hash
} from 'lucide-react'
import { 
  Exam, 
  ExamQuestion, 
  CreateExamQuestionDto,
  UpdateExamQuestionDto 
} from '../../app/types/exam'

interface ExamListProps {
  exam: Exam | null
  onEditQuestion: (question: ExamQuestion) => void
  onDeleteQuestion: (questionId: string) => void
  onAddQuestion: (questionData: CreateExamQuestionDto) => void
  editingQuestion: ExamQuestion | null
  onUpdateQuestion: (questionId: string, updatedData: UpdateExamQuestionDto) => void
  onCancelEdit: () => void
  loading?: boolean
}

interface NewAnswerForm {
  answerId?: string
  answer: string
  isCorrect: boolean
  order?: number
}

interface EditForm {
  question: string
  difficulty: 'easy' | 'medium' | 'hard'
  weight: number
  answers: NewAnswerForm[]
}

export function ExamList({
  exam,
  onEditQuestion,
  onDeleteQuestion,
  onAddQuestion,
  editingQuestion,
  onUpdateQuestion,
  onCancelEdit,
  loading
}: ExamListProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [editForm, setEditForm] = useState<EditForm>({
    question: '',
    difficulty: 'medium',
    weight: 1,
    answers: [
      { answer: '', isCorrect: false },
      { answer: '', isCorrect: false }
    ]
  })
  const [addForm, setAddForm] = useState<CreateExamQuestionDto>({
    question: '',
    difficulty: 'medium',
    weight: 1,
    answers: [
      { answer: '', isCorrect: false },
      { answer: '', isCorrect: false }
    ]
  })

  // Initialize edit form when editing question changes
  React.useEffect(() => {
    if (editingQuestion) {
      setEditForm({
        question: editingQuestion.question,
        difficulty: editingQuestion.difficulty,
        weight: editingQuestion.weight,
        answers: editingQuestion.answers.map((a, index) => ({
          answerId: a.answerId,
          answer: a.answer,
          isCorrect: a.isCorrect,
          order: index
        }))
      })
    }
  }, [editingQuestion])

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'hard': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleAddAnswer = (isEditForm = false) => {
    if (isEditForm) {
      setEditForm(prev => ({
        ...prev,
        answers: [...prev.answers, { 
          answer: '', 
          isCorrect: false, 
          order: prev.answers.length 
        }]
      }))
    } else {
      setAddForm(prev => ({
        ...prev,
        answers: [...prev.answers, { 
          answer: '', 
          isCorrect: false, 
          order: prev.answers.length 
        }]
      }))
    }
  }

  const handleRemoveAnswer = (index: number, isEditForm = false) => {
    if (isEditForm) {
      if (editForm.answers.length > 2) {
        setEditForm(prev => ({
          ...prev,
          answers: prev.answers
            .filter((_, i) => i !== index)
            .map((answer, newIndex) => ({ ...answer, order: newIndex }))
        }))
      }
    } else {
      if (addForm.answers.length > 2) {
        setAddForm(prev => ({
          ...prev,
          answers: prev.answers
            .filter((_, i) => i !== index)
            .map((answer, newIndex) => ({ ...answer, order: newIndex }))
        }))
      }
    }
  }

  const handleUpdateAnswer = (index: number, field: keyof NewAnswerForm, value: string | boolean, isEditForm = false) => {
    if (isEditForm) {
      setEditForm(prev => ({
        ...prev,
        answers: prev.answers.map((answer, i) => 
          i === index ? { ...answer, [field]: value } : answer
        )
      }))
    } else {
      setAddForm(prev => ({
        ...prev,
        answers: prev.answers.map((answer, i) => 
          i === index ? { ...answer, [field]: value } : answer
        )
      }))
    }
  }

  const handleSaveEdit = () => {
    if (!editingQuestion) return
    
    const updatedData: UpdateExamQuestionDto = {
      question: editForm.question,
      difficulty: editForm.difficulty,
      weight: editForm.weight,
      answers: editForm.answers
        .filter(a => a.answer.trim())
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map(a => ({
          answerId: a.answerId,
          answer: a.answer.trim(),
          isCorrect: a.isCorrect
        }))
    }
    
    onUpdateQuestion(editingQuestion.questionId, updatedData)
  }

  const handleAddNewQuestion = () => {
    const questionData: CreateExamQuestionDto = {
      question: addForm.question.trim(),
      difficulty: addForm.difficulty,
      weight: addForm.weight,
      answers: addForm.answers
        .filter(a => a.answer.trim())
        .map(a => ({
          answer: a.answer.trim(),
          isCorrect: a.isCorrect
        }))
    }
    
    onAddQuestion(questionData)
    setAddForm({
      question: '',
      difficulty: 'medium',
      weight: 1,
      answers: [
        { answer: '', isCorrect: false },
        { answer: '', isCorrect: false }
      ]
    })
    setShowAddForm(false)
  }

  if (!exam) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg bg-muted/30">
        <FileQuestion className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground text-lg">No exam found</p>
        <p className="text-sm text-muted-foreground mt-1">
          Create an exam to get started
        </p>
      </div>
    )
  }

  const examStats = {
    totalQuestions: exam.questions.length,
    totalWeight: exam.questions.reduce((sum, q) => sum + q.weight, 0),
    difficultyCount: {
      easy: exam.questions.filter(q => q.difficulty === 'easy').length,
      medium: exam.questions.filter(q => q.difficulty === 'medium').length,
      hard: exam.questions.filter(q => q.difficulty === 'hard').length,
    }
  }

  return (
    <div className="space-y-6">
      {/* Exam Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileQuestion className="h-5 w-5" />
            Exam Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-2xl font-bold">{examStats.totalQuestions}</div>
                <div className="text-xs text-muted-foreground">Questions</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-2xl font-bold">{examStats.totalWeight}</div>
                <div className="text-xs text-muted-foreground">Total Points</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <div>
                <div className="text-2xl font-bold">{examStats.difficultyCount.easy}</div>
                <div className="text-xs text-muted-foreground">Easy</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div>
                <div className="text-2xl font-bold">{examStats.difficultyCount.hard}</div>
                <div className="text-xs text-muted-foreground">Hard</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Question Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Questions</h3>
      </div>

      {/* Add Question Form */}
      {showAddForm && (
        <Card className="border-dashed border-2 border-primary/50">
          <CardHeader>
            <CardTitle className="text-lg">Add New Question</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Question Text</Label>
              <Textarea
                value={addForm.question}
                onChange={(e) => setAddForm(prev => ({ ...prev, question: e.target.value }))}
                placeholder="Enter your question..."
                className="min-h-[80px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Difficulty</Label>
                <Select
                  value={addForm.difficulty}
                  onValueChange={(value: 'easy' | 'medium' | 'hard') => 
                    setAddForm(prev => ({ ...prev, difficulty: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Weight (Points)</Label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={addForm.weight}
                  onChange={(e) => setAddForm(prev => ({ 
                    ...prev, 
                    weight: parseInt(e.target.value) || 1 
                  }))}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Answers</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddAnswer(false)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Answer
                </Button>
              </div>

              <div className="space-y-2">
                {addForm.answers.map((answer, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 border rounded-lg">
                    <Checkbox
                      checked={answer.isCorrect}
                      onCheckedChange={(checked) => 
                        handleUpdateAnswer(index, 'isCorrect', checked, false)
                      }
                    />
                    <Input
                      value={answer.answer}
                      onChange={(e) => 
                        handleUpdateAnswer(index, 'answer', e.target.value, false)
                      }
                      placeholder={`Answer ${index + 1}...`}
                      className="flex-1"
                    />
                    {addForm.answers.length > 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveAnswer(index, false)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowAddForm(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAddNewQuestion}
                disabled={loading || !addForm.question.trim()}
              >
                Add Question
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Questions List */}
      <div className="space-y-4">
        {exam.questions.map((question, index) => (
          <Card key={question.questionId} className="border-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Question {index + 1}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge className={getDifficultyColor(question.difficulty)}>
                    {question.difficulty}
                  </Badge>
                  <Badge variant="outline">
                    {question.weight} pts
                  </Badge>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditQuestion(question)}
                      disabled={loading}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteQuestion(question.questionId)}
                      className="text-red-500 hover:text-red-700"
                      disabled={loading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {editingQuestion?.questionId === question.questionId ? (
                // Edit Mode
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Question Text</Label>
                    <Textarea
                      value={editForm.question}
                      onChange={(e) => setEditForm(prev => ({ 
                        ...prev, 
                        question: e.target.value 
                      }))}
                      className="min-h-[80px]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Difficulty</Label>
                      <Select
                        value={editForm.difficulty}
                        onValueChange={(value: 'easy' | 'medium' | 'hard') => 
                          setEditForm(prev => ({ ...prev, difficulty: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="easy">Easy</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="hard">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Weight (Points)</Label>
                      <Input
                        type="number"
                        min="1"
                        max="10"
                        value={editForm.weight}
                        onChange={(e) => setEditForm(prev => ({ 
                          ...prev, 
                          weight: parseInt(e.target.value) || 1 
                        }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Answers</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddAnswer(true)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Answer
                      </Button>
                    </div>

                    <div className="space-y-2">
                      {editForm.answers.map((answer, answerIndex) => (
                        <div key={answerIndex} className="flex items-center gap-2 p-3 border rounded-lg">
                          <Checkbox
                            checked={answer.isCorrect}
                            onCheckedChange={(checked) => 
                              handleUpdateAnswer(answerIndex, 'isCorrect', checked, true)
                            }
                          />
                          <Input
                            value={answer.answer}
                            onChange={(e) => 
                              handleUpdateAnswer(answerIndex, 'answer', e.target.value, true)
                            }
                            placeholder={`Answer ${answerIndex + 1}...`}
                            className="flex-1"
                          />
                          {editForm.answers.length > 2 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveAnswer(answerIndex, true)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      onClick={onCancelEdit}
                      disabled={loading}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSaveEdit}
                      disabled={loading}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                </div>
              ) : (
                // View Mode
                <div className="space-y-4">
                  <div className="text-base font-medium">
                    {question.question}
                  </div>
                  <div className="space-y-2">
                    {question.answers.map((answer) => (
                      <div 
                        key={answer.answerId} 
                        className={`flex items-center gap-2 p-2 rounded-md ${
                          answer.isCorrect ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          answer.isCorrect ? 'bg-green-500 border-green-500' : 'border-gray-300'
                        }`}>
                          {answer.isCorrect && (
                            <div className="w-full h-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          )}
                        </div>
                        <span className={answer.isCorrect ? 'font-medium text-green-800' : ''}>
                          {answer.answer}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {exam.questions.length === 0 && (
        <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg bg-muted/30">
          <FileQuestion className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-lg">No questions in this exam yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Add questions to get started
          </p>
        </div>
      )}
    </div>
  )
}